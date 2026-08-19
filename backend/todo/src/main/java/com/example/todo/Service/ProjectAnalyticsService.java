package com.example.todo.Service;

import com.example.todo.AssignedTask;
import com.example.todo.ProjectEntity;
import com.example.todo.Repository.AssignedTaskRepository;
import com.example.todo.Repository.ProjectRepository;
import com.example.todo.dto.ProjectAnalyticsDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class ProjectAnalyticsService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private AssignedTaskRepository assignedTaskRepository;

    public List<ProjectAnalyticsDto> getAllProjectAnalytics() {

        List<ProjectEntity> projects = projectRepository.findAll();
        List<AssignedTask> allTasks = assignedTaskRepository.findAll();

        LocalDate today = LocalDate.now();
        LocalDate dueSoonLimit = today.plusDays(3);

        List<ProjectAnalyticsDto> result = new ArrayList<>();

        for (ProjectEntity project : projects) {

            int total = 0, todo = 0, inProgress = 0, inReview = 0, done = 0;
            int overdue = 0, dueSoon = 0;

            for (AssignedTask t : allTasks) {

                if (t.getProject() == null) continue;
                if (!t.getProject().getId().equals(project.getId())) continue;

                total++;

                if (t.getStatus() != null) {
                    if (t.getStatus().equalsIgnoreCase("To Do")) todo++;
                    else if (t.getStatus().equalsIgnoreCase("In Progress")) inProgress++;
                    else if (t.getStatus().equalsIgnoreCase("In Review")) inReview++;
                    else if (t.getStatus().equalsIgnoreCase("done")) done++;
                }

                if (t.getDeadline() != null &&
                        t.getStatus() != null && !t.getStatus().equalsIgnoreCase("done")) {

                    try {
                        LocalDate deadline = t.getDeadline();

                        if (deadline.isBefore(today)) overdue++;
                        else if (!deadline.isAfter(dueSoonLimit)) dueSoon++;

                    } catch (Exception ignored) {}
                }
            }

            int totalAssignees = (project.getAssignedUsers() != null)
                    ? project.getAssignedUsers().size()
                    : 0;

            result.add(new ProjectAnalyticsDto(
                    project.getId(),
                    project.getName(),
                    total,
                    todo,
                    inProgress,
                    inReview,
                    done,
                    overdue,
                    dueSoon,
                    totalAssignees
            ));
        }

        return result;
    }

    public List<ProjectAnalyticsDto> getMostDelayedProjects(int limit) {

        List<ProjectAnalyticsDto> list = getAllProjectAnalytics();

        // sort by overdue tasks
        list.sort((a, b) -> Integer.compare(b.getOverdueTasks(), a.getOverdueTasks()));

        if (list.size() > limit) return list.subList(0, limit);

        return list;
    }

    public List<ProjectAnalyticsDto> getProjectsWithMostPendingTasks(int limit) {

        List<ProjectAnalyticsDto> list = getAllProjectAnalytics();

        list.sort((a, b) -> Integer.compare(
                (b.getTodoTasks() + b.getInProgressTasks() + b.getInReviewTasks()),
                (a.getTodoTasks() + a.getInProgressTasks() + a.getInReviewTasks())
        ));

        if (list.size() > limit) return list.subList(0, limit);

        return list;
    }

    public List<ProjectAnalyticsDto> getProjectsWithMostCompletedTasks(int limit) {

        List<ProjectAnalyticsDto> list = getAllProjectAnalytics();

        list.sort((a, b) -> Integer.compare(b.getDoneTasks(), a.getDoneTasks()));

        if (list.size() > limit) return list.subList(0, limit);

        return list;
    }
}