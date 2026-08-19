package com.example.todo.Service;

import com.example.todo.AssignedTask;
import com.example.todo.Repository.AssignedTaskRepository;
import com.example.todo.Repository.UserRepository;
import com.example.todo.dto.InactiveEmployeeDto;
import com.example.todo.dto.TaskMonitoringDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class MonitoringAnalysisService {

    @Autowired
    private AssignedTaskRepository assignedTaskRepository;

    @Autowired
    private UserRepository userRepository;

    // ✅ Tasks stuck in progress for more than X days
    public List<TaskMonitoringDto> getTasksStuckInProgress(int days) {

        List<AssignedTask> inProgressTasks = assignedTaskRepository.findByStatusIgnoreCase("In Progress");

        LocalDate today = LocalDate.now();
        List<TaskMonitoringDto> result = new ArrayList<>();

        for (AssignedTask task : inProgressTasks) {

            if (task.getLastUpdatedAt() == null) continue;

            try {
                LocalDate lastUpdated = task.getLastUpdatedAt().toLocalDate();
                long diffDays = ChronoUnit.DAYS.between(lastUpdated, today);

                if (diffDays >= days) {
                    result.add(mapTask(task));
                }

            } catch (Exception ignored) {}
        }

        return result;
    }

    // Tasks not updated recently (any status except done)
    public List<TaskMonitoringDto> getTasksNotUpdatedInDays(int days) {

        List<AssignedTask> activeTasks = assignedTaskRepository.findByStatusNotIgnoreCase("done");

        LocalDate today = LocalDate.now();
        List<TaskMonitoringDto> result = new ArrayList<>();

        for (AssignedTask task : activeTasks) {

            if (task.getLastUpdatedAt() == null) continue;

            try {
                LocalDate lastUpdated = task.getLastUpdatedAt().toLocalDate();
                long diffDays = ChronoUnit.DAYS.between(lastUpdated, today);

                if (diffDays >= days) {
                    result.add(mapTask(task));
                }

            } catch (Exception ignored) {}
        }

        return result;
    }

    // Employees who haven't updated any task recently
    public List<InactiveEmployeeDto> getInactiveEmployees(int days) {

        var allUsers = userRepository.findAll();
        LocalDate today = LocalDate.now();

        List<InactiveEmployeeDto> result = new ArrayList<>();

        for (var user : allUsers) {

            if (user.getRole() == null) continue;

            String role = user.getRole().toLowerCase();
            if (!(role.equals("employee") || role.equals("manager"))) continue;

            List<AssignedTask> tasks = assignedTaskRepository.findByAssigneeIdAndStatusNotIgnoreCase(user.getId(), "done");

            if (tasks.isEmpty()) continue;

            LocalDate mostRecentUpdate = null;

            for (AssignedTask t : tasks) {

                if (t.getLastUpdatedAt() == null) continue;

                try {
                    LocalDate updated = t.getLastUpdatedAt().toLocalDate();

                    if (mostRecentUpdate == null || updated.isAfter(mostRecentUpdate)) {
                        mostRecentUpdate = updated;
                    }

                } catch (Exception ignored) {}
            }

            if (mostRecentUpdate == null) continue;

            long diffDays = ChronoUnit.DAYS.between(mostRecentUpdate, today);

            if (diffDays >= days) {
                result.add(new InactiveEmployeeDto(
                        user.getId(),
                        user.getUsername(),
                        tasks.size(),
                        mostRecentUpdate.toString()
                ));
            }
        }

        // Sort most inactive first (oldest update date)
        result.sort((a, b) -> a.getLastTaskUpdatedDate().compareTo(b.getLastTaskUpdatedDate()));

        return result;
    }

    // Tasks waiting for review
    public List<TaskMonitoringDto> getTasksWaitingForReview() {

        List<AssignedTask> reviewTasks = assignedTaskRepository.findByStatusIgnoreCase("In Review");

        List<TaskMonitoringDto> result = new ArrayList<>();
        for (AssignedTask task : reviewTasks) {
            result.add(mapTask(task));
        }

        return result;
    }

    // ---------------- Helper Mapping ----------------

    private TaskMonitoringDto mapTask(AssignedTask task) {

        String assigneeId = null;
        String assigneeName = null;

        if (task.getAssignee() != null) {
            assigneeId = task.getAssignee().getId();
            assigneeName = task.getAssignee().getUsername();
        }

        return new TaskMonitoringDto(
                task.getTaskId(),
                task.getTaskname(),
                task.getStatus(),
                task.getPriority(),
                task.getDeadline(),
                assigneeId,
                assigneeName,
                task.getLastUpdatedAt()
        );
    }
}