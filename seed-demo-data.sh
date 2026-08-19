#!/usr/bin/env bash

set -euo pipefail

API_BASE_URL="${API_BASE_URL:-http://localhost:8080}"

if ! command -v jq >/dev/null 2>&1; then
  echo "This script requires jq. Install it with: brew install jq" >&2
  exit 1
fi

api_call() {
  local response status url

  url="$1"
  shift
  response=$(curl -sS -w $'\n%{http_code}' "$@" "$url") || {
    echo "Request failed: $url" >&2
    exit 1
  }
  status="${response##*$'\n'}"
  response="${response%$'\n'*}"

  if (( status >= 400 )); then
    echo "Request failed ($status): $url" >&2
    printf '%s\n' "$response" >&2
    exit 1
  fi

  printf '%s' "$response"
}

read -r -s -p "Password for admin1: " ADMIN_PASSWORD
printf '\n'

login_response=$(api_call "$API_BASE_URL/user/login" -X POST \
  -H 'Content-Type: application/json' \
  -d "{\"userId\":\"admin1\",\"password\":\"$ADMIN_PASSWORD\"}")
token=$(printf '%s' "$login_response" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

if [[ -z "$token" ]]; then
  echo "Could not sign in as admin1. Check that the backend is running and the password is correct." >&2
  exit 1
fi

auth_header="Authorization: Bearer $token"
users=$(api_call "$API_BASE_URL/user/all" -H "$auth_header")

create_user() {
  if jq -e --arg id "$1" 'any(.[]; .id == $id)' <<<"$users" >/dev/null; then
    echo "User already exists: $1"
    return
  fi

  api_call "$API_BASE_URL/user/register" -X POST \
    -H 'Content-Type: application/json' \
    -d "{\"id\":\"$1\",\"username\":\"$2\",\"password\":\"demo123\",\"role\":\"$3\"}" >/dev/null
}

create_user mgr_maya "Maya Patel" manager
create_user mgr_daniel "Daniel Chen" manager
create_user emp_arjun "Arjun Rao" employee
create_user emp_priya "Priya Shah" employee
create_user emp_kiran "Kiran Das" employee
create_user emp_sofia "Sofia Martin" employee
create_user emp_liam "Liam Wilson" employee

projects=$(api_call "$API_BASE_URL/projects" -H "$auth_header")

create_project() {
  local existing_project project_id
  existing_project=$(jq -c --arg name "$1" 'map(select(.name == $name)) | .[0] // empty' <<<"$projects")
  if [[ -n "$existing_project" ]]; then
    echo "Project already exists: $1" >&2
    jq -r '.id' <<<"$existing_project"
    return
  fi

  project_id=$(api_call "$API_BASE_URL/projects" -X POST -H "$auth_header" \
    -H 'Content-Type: application/json' -d "$2" | jq -r '.id')
  if [[ -z "$project_id" || "$project_id" == "null" ]]; then
    echo "Project response did not contain an id: $1" >&2
    exit 1
  fi
  printf '%s' "$project_id"
}

web_project_id=$(create_project "Website Relaunch" '{"name":"Website Relaunch","description":"Refresh the customer-facing website before the autumn campaign.","userIds":["mgr_maya","emp_arjun","emp_priya","emp_kiran"]}')

mobile_project_id=$(create_project "Mobile App Sprint" '{"name":"Mobile App Sprint","description":"Improve onboarding and stabilize the next mobile release.","userIds":["mgr_daniel","emp_sofia","emp_liam","emp_kiran"]}')

create_task() {
  local project_id task_data assignee_id task_name existing_tasks
  project_id="$1"
  task_data="$2"
  task_name=$(jq -r '.taskname' <<<"$task_data")
  assignee_id=$(jq -r '.assigneeId' <<<"$task_data")
  existing_tasks=$(api_call "$API_BASE_URL/assigntask/projects/$project_id/users/$assignee_id/tasks" -H "$auth_header")
  if jq -e --arg name "$task_name" 'any(.[]; .taskname == $name)' <<<"$existing_tasks" >/dev/null; then
    echo "Task already exists: $task_name"
    return
  fi

  api_call "$API_BASE_URL/assigntask/projects/$project_id/tasks" -X POST -H "$auth_header" \
    -H 'Content-Type: application/json' -d "$task_data" >/dev/null
}

create_task "$web_project_id" '{"taskname":"Create homepage wireframes","description":"Draft desktop and mobile homepage layouts for stakeholder review.","deadline":"2026-08-25","priority":"high","assigneeId":"emp_priya"}'
create_task "$web_project_id" '{"taskname":"Build responsive navigation","description":"Implement accessible desktop and mobile navigation components.","deadline":"2026-08-22","priority":"high","assigneeId":"emp_arjun"}'
create_task "$web_project_id" '{"taskname":"Write launch page copy","description":"Prepare concise feature copy and calls to action for the relaunch.","deadline":"2026-08-29","priority":"medium","assigneeId":"emp_kiran"}'
create_task "$web_project_id" '{"taskname":"Review analytics tracking plan","description":"Confirm page events and conversion metrics before implementation.","deadline":"2026-08-15","priority":"low","assigneeId":"mgr_maya"}'
create_task "$mobile_project_id" '{"taskname":"Improve onboarding checklist","description":"Simplify the first-run checklist and empty states.","deadline":"2026-08-24","priority":"high","assigneeId":"emp_sofia"}'
create_task "$mobile_project_id" '{"taskname":"Fix notification preferences","description":"Resolve inconsistent push-notification preference persistence.","deadline":"2026-08-18","priority":"high","assigneeId":"emp_liam"}'
create_task "$mobile_project_id" '{"taskname":"Test release candidate","description":"Run regression tests across the onboarding and notification flows.","deadline":"2026-08-31","priority":"medium","assigneeId":"emp_kiran"}'
create_task "$mobile_project_id" '{"taskname":"Prepare sprint retrospective","description":"Summarize sprint outcomes, risks, and improvements.","deadline":"2026-09-02","priority":"low","assigneeId":"mgr_daniel"}'

echo "Demo data created: 2 managers, 5 employees, 2 projects, and 8 tasks."
echo "All demo accounts use password: demo123"
