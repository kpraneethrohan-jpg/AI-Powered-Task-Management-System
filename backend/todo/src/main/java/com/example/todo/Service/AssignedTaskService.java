package com.example.todo.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.apache.el.stream.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.todo.AssignedTask;
import com.example.todo.Profile;
import com.example.todo.ProjectEntity;
import com.example.todo.UserAuthentication;
import com.example.todo.Repository.AssignedTaskRepository;
import com.example.todo.Repository.ProfileRepository;
import com.example.todo.Repository.ProjectRepository;
import com.example.todo.Repository.UserRepository;
import com.example.todo.dto.AutomationDto;
import com.example.todo.dto.TaskCreateRequest;
import com.example.todo.dto.TaskDto;

@Service
public class AssignedTaskService {

    @Autowired
    private AssignedTaskRepository assignedtaskrepo;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ProfileRepository profileRepo;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    ///////////////////////////////////// AI AUTOMATION RELATED METHODS /////////////////////////////////////
    public void assignAutomatedTask(AutomationDto.FinalAssignRequest request) {
        UserAuthentication assignedBy = userRepository.findById(request.assignedById())
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        UserAuthentication assignee = userRepository.findById(request.assignedToId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        AssignedTask newTask = new AssignedTask();
        newTask.setTaskname(request.taskName());
        newTask.setDescription(request.description());
        newTask.setDeadline(request.deadline());
        newTask.setPriority(request.priority());
        newTask.setStatus("To Do");
        newTask.setAssignedBy(assignedBy);
        newTask.setAssignee(assignee);

        newTask.setLastUpdatedAt(java.time.LocalDateTime.now());
        newTask.setCreatedAt(java.time.LocalDateTime.now());
        newTask.setCompletedAt(null);

        AssignedTask savedTask = assignedtaskrepo.save(newTask);

        // Notifications & Emails
        notificationService.sendNotification(
            savedTask.getAssignedBy().getId(),
            savedTask.getAssignee().getId(),
            "AI Recommended Task: " + savedTask.getTaskname()
        );
        sendNewTaskEmail(savedTask);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // ... (Add these methods to your existing AssignedTaskService)

    //Admin AI Assistant related methods
    public List<AssignedTask> getActiveTasksForEmployee(String employeeId) {
    return assignedtaskrepo.findByAssigneeIdAndStatusNotIgnoreCase(employeeId, "done");
}

public List<AssignedTask> getAllActiveTasks() {
    return assignedtaskrepo.findByStatusNotIgnoreCase("done");
}



/////////////////////////////////////////////////////////////////

    public List<AssignedTask> searchTasks(String userId, String managerName, String priority, String dueDate) {

         LocalDate parsedDueDate = null;

    if (dueDate != null && !dueDate.isBlank()) {
        try {
            parsedDueDate = LocalDate.parse(dueDate);
        } catch (Exception e) {
            throw new RuntimeException("Invalid date format. Expected YYYY-MM-DD");
        }
    }

    LocalDate finalParsedDueDate = parsedDueDate;
        return assignedtaskrepo.findByAssigneeId(userId).stream()
                .filter(t -> managerName == null ||
                        (t.getAssignedBy() != null && t.getAssignedBy().getUsername().equalsIgnoreCase(managerName)))
                .filter(t -> priority == null ||
                        (t.getPriority() != null && t.getPriority().equalsIgnoreCase(priority)))
                .filter(t -> dueDate == null ||
                        (t.getDeadline() != null && t.getDeadline().isEqual(finalParsedDueDate)))
                .collect(Collectors.toList());
    }

    public List<AssignedTask> getTasksForTimeFrame(String userId, Integer hours) {
        // Standardized status names to match your database values
        List<String> activeStatuses = List.of("To Do", "In Progress");
        List<AssignedTask> tasks = assignedtaskrepo.findByAssigneeIdAndStatusIn(userId, activeStatuses);

        if (hours == null)
            return tasks;

        return tasks.stream()
                .filter(t -> t.getEstimatedHours() == null || t.getEstimatedHours() <= hours)
                .sorted((t1, t2) -> {
                    // Sort by priority (High > Medium > Low), then by deadline
                    int priorityCompare = getPriorityValue(t2.getPriority()) - getPriorityValue(t1.getPriority());
                    if (priorityCompare != 0)
                        return priorityCompare;

                    // If same priority, prefer tasks with earlier deadlines
                    if (t1.getDeadline() != null && t2.getDeadline() != null) {
                        return t1.getDeadline().compareTo(t2.getDeadline());
                    }
                    return 0;
                })
                .collect(Collectors.toList()); // Return all feasible tasks, let AI decide how many to recommend
    }

    /**
     * Convert priority string to numeric value for sorting
     */
    private int getPriorityValue(String priority) {
        if (priority == null)
            return 0;
        switch (priority.toLowerCase()) {
            case "high":
                return 3;
            case "medium":
                return 2;
            case "low":
                return 1;
            default:
                return 0;
        }
    }

    /**
     * Get all active tasks for a user (To Do and In Progress)
     */
    public List<AssignedTask> getActiveTasksForUser(String userId) {
        List<String> activeStatuses = List.of("To Do", "In Progress");
        return assignedtaskrepo.findByAssigneeIdAndStatusIn(userId, activeStatuses);
    }

    /**
     * Get tasks assigned by a specific person (by name or ID)
     */
    public List<AssignedTask> getTasksByAssigner(String userId, String assignerNameOrId) {
        List<String> activeStatuses = List.of("To Do", "In Progress");
        List<AssignedTask> tasks = assignedtaskrepo.findByAssigneeIdAndStatusIn(userId, activeStatuses).stream()
                .filter(t -> t.getAssignedBy() != null &&
                        (t.getAssignedBy().getUsername().equalsIgnoreCase(assignerNameOrId) ||
                                t.getAssignedBy().getId().equals(assignerNameOrId)))
                .collect(Collectors.toList());

        System.out.println("DEBUG: getTasksByAssigner called for userId=" + userId + ", assigner=" + assignerNameOrId
                + ", returned " + tasks.size() + " tasks");
        return tasks;
    }

    //////////////////////////////////////////////////////////////////////////////

    //// Add this to your existing AssignedTaskService
    public List<AssignedTask> getActiveTaskCount(String userId) {
        List<String> activeStatuses = List.of("To Do", "In Progress");
        return assignedtaskrepo.findByAssigneeIdAndStatusIn(userId, activeStatuses);
    }

    //////////////////////////////////////////////////////////////////////////

    public List<TaskDto> getTasksByProjectAndUser(Long projectId, String userId) {
        List<AssignedTask> tasks = assignedtaskrepo.findByProjectIdAndAssigneeId(projectId, userId);

        // Convert the list of entities into a list of DTOs
        return tasks.stream()
                .map(TaskDto::new) // Uses the constructor we created in TaskDto
                .collect(Collectors.toList());
    }

    public List<TaskDto> getAllTasks(String assigneeId) {
        List<AssignedTask> tasks = assignedtaskrepo.findByAssigneeId(assigneeId);
        return tasks.stream()
                .map(TaskDto::new) // Uses the constructor we created in TaskDto
                .collect(Collectors.toList());
    }

    public List<TaskDto> getAllIncompleteTasks(String assigneeId) {
        List<String> activeStatuses = List.of("To Do", "In Progress");
        List<AssignedTask> tasks = assignedtaskrepo.findByAssigneeIdAndStatusIn(assigneeId, activeStatuses);
        return tasks.stream()
                .map(TaskDto::new)
                .collect(Collectors.toList());
    }

    public AssignedTask createTask(TaskCreateRequest taskRequest, String assignedById, Long projectId) {
        UserAuthentication assignedBy = userRepository.findById(assignedById)
                .orElseThrow(() -> new RuntimeException("Assigner not found"));
        UserAuthentication assignee = userRepository.findById(taskRequest.getAssigneeId())
                .orElseThrow(() -> new RuntimeException("Assignee not found"));

        // Find the project to link the task to
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        AssignedTask newTask = new AssignedTask();
        newTask.setTaskname(taskRequest.getTaskname());
        newTask.setDescription(taskRequest.getDescription());
        newTask.setDeadline(taskRequest.getDeadline());
        newTask.setStatus("To Do");
        newTask.setPriority(taskRequest.getPriority());
        newTask.setAssignedBy(assignedBy);
        newTask.setAssignee(assignee);
        newTask.setProject(project);

        newTask.setLastUpdatedAt(java.time.LocalDateTime.now());
        newTask.setCreatedAt(java.time.LocalDateTime.now());
        newTask.setCompletedAt(null);

        // sendNewTaskEmail(newTask);

        AssignedTask savedTask = assignedtaskrepo.save(newTask);
        notificationService.sendNotification(
                savedTask.getAssignedBy().getId(),
                savedTask.getAssignee().getId(),
                "You have a new project task: " + savedTask.getTaskname());
        sendNewTaskEmailForProject(savedTask);
        return savedTask;
    }

    public void storeAssignedTask(AssignedTask assignedtask) {
        assignedtaskrepo.save(assignedtask);
        sendNewTaskEmail(assignedtask);
    }

    public void sendNewTaskEmail(AssignedTask assignedtask) {

        String assigneeId = assignedtask.getAssignee().getId();
        Profile assigneeProfile = profileRepo.findById(assigneeId).orElse(null);

        if (assigneeProfile != null && assigneeProfile.getEmail() != null) {
            String toEmail = assigneeProfile.getEmail();
            String subject = "New Task Assigned: " + assignedtask.getTaskname();
            String body = "Hello,\n\nYou have been assigned a new task: "
                    + assignedtask.getTaskname()
                    + "\nDescription: " + assignedtask.getDescription()
                    + "\nDeadline: " + assignedtask.getDeadline()
                    + "\n\nPlease check your dashboard for details.";

            emailService.sendEmail(toEmail, subject, body);
        }

    }

    public void sendNewTaskEmailForProject(AssignedTask assignedtask) {
        String assigneeId = assignedtask.getAssignee().getId();
        java.util.Optional<Profile> assigneeProfileOpt = profileRepo.findById(assigneeId);

        if (assigneeProfileOpt.isPresent() && assigneeProfileOpt.get().getEmail() != null) {
            Profile assigneeProfile = assigneeProfileOpt.get();
            String toEmail = assigneeProfile.getEmail();
            String subject = "New Project Task Assigned: " + assignedtask.getTaskname();

            // 1. Get the project name from the task's project relationship.
            // We add a check to make sure the project is not null for safety.
            String projectName = (assignedtask.getProject() != null)
                    ? assignedtask.getProject().getName()
                    : "N/A";

            // 2. Use String.format to cleanly insert the project name into the body.
            String body = String.format(
                    "Hello,\n\nYou have been assigned a new task in project '%s':\n\nTask: %s\nDescription: %s\nDeadline: %s\n\nPlease check your dashboard for details.",
                    projectName,
                    assignedtask.getTaskname(),
                    assignedtask.getDescription(),
                    assignedtask.getDeadline());

            emailService.sendEmail(toEmail, subject, body);
        }
    }

    public void updateStatus(Long taskId, String status, String updatedByUserId) {
        AssignedTask task = assignedtaskrepo.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with ID: " + taskId));

        UserAuthentication statusChanger = userRepository.findById(updatedByUserId)
                .orElseThrow(
                        () -> new RuntimeException("User who updated status not found with ID: " + updatedByUserId));

        String oldStatus = task.getStatus();

        // 2. Update the task status in the database
        task.setStatus(status);
        task.setLastUpdatedAt(java.time.LocalDateTime.now());
        if(status.equalsIgnoreCase("done")) {
    task.setCompletedAt(java.time.LocalDateTime.now());
} else {
    task.setCompletedAt(null);
}
        assignedtaskrepo.save(task);

        // 3. --- EMAIL NOTIFICATION LOGIC ---
        // Check if the status has actually changed to avoid sending unnecessary emails
        if (!status.equalsIgnoreCase(oldStatus)) {

            // SCENARIO 1: Employee sends task for review
            if (status.equalsIgnoreCase("In Review")) {
                // The recipient is the person who assigned the task (the assigner)
                UserAuthentication assigner = task.getAssignedBy();
                sendReviewNotificationEmail(assigner, statusChanger, task);
            }

            // SCENARIO 2: Assigner approves or rejects the task
            else if (oldStatus.equalsIgnoreCase("In Review")) {
                // The recipient is the person the task was assigned to (the assignee)
                UserAuthentication assignee = task.getAssignee();
                sendStatusUpdateEmail(assignee, statusChanger, task);
            }
        }

        // 4. IN-APP NOTIFICATION LOGIC
        // Only send a notification if the status has actually changed
        if (!status.equalsIgnoreCase(oldStatus)) {

            // SCENARIO 1: Employee sends task for review
            if (status.equalsIgnoreCase("In Review")) {
                // The recipient is the person who assigned the task (the assigner)
                UserAuthentication assigner = task.getAssignedBy();
                sendReviewAppNotification(assigner, statusChanger, task);
            }

            // SCENARIO 2: Assigner approves or rejects the task
            else if (oldStatus.equalsIgnoreCase("In Review")) {
                // The recipient is the person the task was assigned to (the assignee)
                UserAuthentication assignee = task.getAssignee();
                sendStatusUpdateInAppNotification(assignee, statusChanger, task);
            }

        }
    }

    private void sendReviewNotificationEmail(UserAuthentication recipient, UserAuthentication sender,
            AssignedTask task) {
        java.util.Optional<Profile> recipientProfileOpt = profileRepo.findById(recipient.getId());
        if (recipientProfileOpt.isPresent() && recipientProfileOpt.get().getEmail() != null) {
            String toEmail = recipientProfileOpt.get().getEmail();
            String subject = "Task Submitted for Review: " + task.getTaskname();
            String body = String.format(
                    "Hello %s,\n\nThe user '%s' has submitted the following task for your review:\n\nTask: %s\nProject: %s\n\nPlease log in to your dashboard to approve or reject the task.",
                    recipient.getUsername(),
                    sender.getUsername(),
                    task.getTaskname(),
                    task.getProject() != null ? task.getProject().getName() : "General");
            emailService.sendEmail(toEmail, subject, body);
        }
    }

    // --- NEW HELPER METHOD for "Approve/Reject" email notifications ---
    private void sendStatusUpdateEmail(UserAuthentication recipient, UserAuthentication sender, AssignedTask task) {
        java.util.Optional<Profile> recipientProfileOpt = profileRepo.findById(recipient.getId());
        if (recipientProfileOpt.isPresent() && recipientProfileOpt.get().getEmail() != null) {
            String toEmail = recipientProfileOpt.get().getEmail();
            String subject = "Task Status Updated: " + task.getTaskname();
            String body = String.format(
                    "Hello %s,\n\nYour task '%s' has been reviewed by %s.\n\nThe new status is: %s\n\nPlease check your dashboard for details.",
                    recipient.getUsername(),
                    task.getTaskname(),
                    sender.getUsername(),
                    task.getStatus());
            emailService.sendEmail(toEmail, subject, body);
        }
    }

    private void sendReviewAppNotification(UserAuthentication recipient, UserAuthentication sender, AssignedTask task) {
        String message = String.format(
                "%s has submitted the task '%s' for your review.",
                sender.getUsername(),
                task.getTaskname());
        notificationService.sendNotification(sender.getId(), recipient.getId(), message);
    }

    // 2. Helper for sending the "Approve/Reject" in-app notification
    private void sendStatusUpdateInAppNotification(UserAuthentication recipient, UserAuthentication sender,
            AssignedTask task) {
        String message;
        if (task.getStatus().equalsIgnoreCase("Done")) {
            message = String.format(
                    "%s has approved your task '%s'. Great job!",
                    sender.getUsername(),
                    task.getTaskname());
        } else {
            message = String.format(
                    "%s has updated the status of your task '%s' to '%s'.",
                    sender.getUsername(),
                    task.getTaskname(),
                    task.getStatus());
        }
        notificationService.sendNotification(sender.getId(), recipient.getId(), message);
    }

    public AssignedTask getTaskById(Long taskId) {
        return assignedtaskrepo.findById(taskId).orElse(null);
    }

    public void deleteTaskById(Long taskId) {
        assignedtaskrepo.deleteById(taskId);
    }

    public void updateTask(AssignedTask updatedTask) {
        AssignedTask existingTask = assignedtaskrepo.findById(updatedTask.getTaskId()).orElse(null);
        if (existingTask != null) {
            existingTask.setTaskname(updatedTask.getTaskname());
            existingTask.setDescription(updatedTask.getDescription());
            existingTask.setStatus(updatedTask.getStatus());
            existingTask.setDeadline(updatedTask.getDeadline());
            existingTask.setPriority(updatedTask.getPriority());
            assignedtaskrepo.save(existingTask);
            sendUpdateTaskEmail(existingTask);
        }
    }

    public void sendUpdateTaskEmail(AssignedTask assignedtask) {

        String assigneeId = assignedtask.getAssignee().getId();
        Profile assigneeProfile = profileRepo.findById(assigneeId).orElse(null);

        if (assigneeProfile != null && assigneeProfile.getEmail() != null) {
            String toEmail = assigneeProfile.getEmail();
            String subject = "Task Updated: " + assignedtask.getTaskname();
            String body = "Hello,\n\nYour task has been updated: "
                    + assignedtask.getTaskname()
                    + "\nDescription: " + assignedtask.getDescription()
                    + "\nDeadline: " + assignedtask.getDeadline()
                    + "\n\nPlease check your dashboard for details.";

            emailService.sendEmail(toEmail, subject, body);
        }

    }

    public List<Integer> fetchTotalSummary() {
        long total = assignedtaskrepo.count();
        int todo = assignedtaskrepo.countByStatus("To Do");
        int inProgress = assignedtaskrepo.countByStatus("In Progress");
        int done = assignedtaskrepo.countByStatus("Done");
        return Arrays.asList((int) total, todo, inProgress, done);
    }

    public List<Integer> fetchTotalEmployeeSummary() {
        int total = assignedtaskrepo.countTasksAssignedToEmployees();
        int todo = assignedtaskrepo.countTasksByStatusForEmployees("To Do");
        int inProgress = assignedtaskrepo.countTasksByStatusForEmployees("In Progress");
        int done = assignedtaskrepo.countTasksByStatusForEmployees("Done");
        return Arrays.asList(total, todo, inProgress, done);
    }

    public List<Integer> fetchTotalManagerSummary() {
        int total = assignedtaskrepo.countTasksAssignedToManagers();
        int todo = assignedtaskrepo.countTasksByStatusForManagers("To Do");
        int inProgress = assignedtaskrepo.countTasksByStatusForManagers("In Progress");
        int done = assignedtaskrepo.countTasksByStatusForManagers("Done");
        return Arrays.asList(total, todo, inProgress, done);
    }

    public List<AssignedTask> getTaskDataBasedOnIntent(
            String intent,
            String userId,
            Integer hours) {

        switch (intent) {

            case "PRIORITIZE_TASKS":
                return assignedtaskrepo
                        .findByAssigneeIdAndStatusIn(
                                userId,
                                List.of("TODO", "IN_PROGRESS"));

            case "TIME_BASED_TASKS":
                List<AssignedTask> tasks = assignedtaskrepo
                        .findByAssigneeIdAndStatusIn(
                                userId,
                                List.of("TODO", "IN_PROGRESS"));

                if (hours == null)
                    return tasks;

                return tasks.stream()
                        .filter(t -> t.getEstimatedHours() != null &&
                                t.getEstimatedHours() <= hours)
                        .collect(Collectors.toList());

            case "WORKLOAD_SUMMARY":
                return assignedtaskrepo.findByAssigneeId(userId);

            default:
                return List.of();
        }
    }
}
