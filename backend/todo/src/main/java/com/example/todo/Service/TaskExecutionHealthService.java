package com.example.todo.Service;

import com.example.todo.AssignedTask;
import com.example.todo.Repository.AssignedTaskRepository;
import com.example.todo.dto.DeadlineTaskDto;
import com.example.todo.dto.TaskExecutionHealthDto;
import com.example.todo.dto.TaskMonitoringDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for comprehensive task execution health analysis
 * Evaluates organizational task completion efficiency, deadline adherence, and delivery health
 */
@Service
public class TaskExecutionHealthService {

    @Autowired
    private AssignedTaskRepository assignedTaskRepository;

    @Autowired
    private DeadlineAnalysisService deadlineAnalysisService;

    @Autowired
    private MonitoringAnalysisService monitoringAnalysisService;

    /**
     * Get comprehensive task execution health metrics
     * @return TaskExecutionHealthDto with all health metrics
     */
    public TaskExecutionHealthDto getOverallTaskExecutionHealth() {
        TaskExecutionHealthDto health = new TaskExecutionHealthDto();
        
        // Get all tasks
        List<AssignedTask> allTasks = assignedTaskRepository.findAll();
        
        // Calculate core metrics
        calculateCoreMetrics(health, allTasks);
        
        // Calculate status breakdown
        calculateStatusBreakdown(health, allTasks);
        
        // Calculate priority distribution
        calculatePriorityDistribution(health, allTasks);
        
        // Get detailed task lists
        health.setOverdueTaskList(deadlineAnalysisService.getOverdueTasks());
        health.setDueSoonTaskList(deadlineAnalysisService.getTasksDueInDays(7));
        health.setCriticalTaskList(deadlineAnalysisService.getTasksDueInDays(3));
        health.setStuckTasksList(monitoringAnalysisService.getTasksStuckInProgress(5));
        
        // Calculate health score
        health.setHealthScore(calculateHealthScore(health));
        
        return health;
    }

    /**
     * Calculate core metrics: total, completed, active, overdue
     */
    private void calculateCoreMetrics(TaskExecutionHealthDto health, List<AssignedTask> allTasks) {
        LocalDate today = LocalDate.now();
        
        long totalTasks = allTasks.size();
        long completedCount = 0;
        long activeCount = 0;
        long overdueCount = 0;
        long onTimeCount = 0;
        long lateCount = 0;
        
        for (AssignedTask task : allTasks) {
            // Count total
            if (task.getTaskId() != null) {
                // Check if completed
                if (isTaskCompleted(task)) {
                    completedCount++;
                    
                    // Check if on-time or late
                    if (task.getDeadline() != null && task.getCompletedAt() != null) {
                        LocalDate completedDate = task.getCompletedAt().toLocalDate();
                        if (completedDate.isBefore(task.getDeadline()) || 
                            completedDate.isEqual(task.getDeadline())) {
                            onTimeCount++;
                        } else {
                            lateCount++;
                        }
                    }
                } else {
                    // Not completed, count as active
                    activeCount++;
                    
                    // Check if overdue
                    if (task.getDeadline() != null && task.getDeadline().isBefore(today)) {
                        overdueCount++;
                    }
                }
            }
        }
        
        health.setTotalAssignedTasks(totalTasks);
        health.setCompletedTasks(completedCount);
        health.setActiveTasks(activeCount);
        health.setOverdueTasks(overdueCount);
        health.setTasksCompletedOnTime(onTimeCount);
        health.setTasksCompletedLate(lateCount);
        
        // Calculate rates
        double completionRate = totalTasks > 0 ? (completedCount * 100.0 / totalTasks) : 0;
        health.setCompletionRate(Math.round(completionRate * 100.0) / 100.0);
        
        double onTimeRate = completedCount > 0 ? (onTimeCount * 100.0 / completedCount) : 0;
        health.setOnTimeCompletionRate(Math.round(onTimeRate * 100.0) / 100.0);
        
        // Calculate due soon (within 7 days)
        LocalDate limit7Days = today.plusDays(7);
        long dueSoon = allTasks.stream()
            .filter(t -> !isTaskCompleted(t) && t.getDeadline() != null)
            .filter(t -> !t.getDeadline().isBefore(today) && !t.getDeadline().isAfter(limit7Days))
            .count();
        health.setTasksDueSoon(dueSoon);
        
        // Calculate critical (within 3 days)
        LocalDate limit3Days = today.plusDays(3);
        long critical = allTasks.stream()
            .filter(t -> !isTaskCompleted(t) && t.getDeadline() != null)
            .filter(t -> !t.getDeadline().isBefore(today) && !t.getDeadline().isAfter(limit3Days))
            .count();
        health.setCriticalTasks(critical);
    }

    /**
     * Calculate task status breakdown
     */
    private void calculateStatusBreakdown(TaskExecutionHealthDto health, List<AssignedTask> allTasks) {
        long pending = 0;
        long inProgress = 0;
        long stuck = 0;
        
        LocalDate today = LocalDate.now();
        
        for (AssignedTask task : allTasks) {
            String status = task.getStatus();
            if (status == null) continue;
            
            String statusLower = status.toLowerCase();
            
            if (statusLower.equals("pending") || statusLower.equals("not started")) {
                pending++;
            } else if (statusLower.equals("in progress")) {
                inProgress++;
                
                // Check if stuck (in progress for more than 5 days)
                if (task.getLastUpdatedAt() != null) {
                    LocalDate lastUpdated = task.getLastUpdatedAt().toLocalDate();
                    long daysSinceUpdate = ChronoUnit.DAYS.between(lastUpdated, today);
                    if (daysSinceUpdate >= 5) {
                        stuck++;
                    }
                }
            }
        }
        
        health.setPendingTasks(pending);
        health.setInProgressTasks(inProgress);
        health.setStuckTasks(stuck);
    }

    /**
     * Calculate priority distribution for active tasks
     */
    private void calculatePriorityDistribution(TaskExecutionHealthDto health, List<AssignedTask> allTasks) {
        long highPriority = 0;
        long mediumPriority = 0;
        long lowPriority = 0;
        
        for (AssignedTask task : allTasks) {
            if (isTaskCompleted(task)) continue;
            
            String priority = task.getPriority();
            if (priority == null) continue;
            
            String priorityLower = priority.toLowerCase();
            
            if (priorityLower.equals("high")) {
                highPriority++;
            } else if (priorityLower.equals("medium")) {
                mediumPriority++;
            } else if (priorityLower.equals("low")) {
                lowPriority++;
            }
        }
        
        health.setHighPriorityActive(highPriority);
        health.setMediumPriorityActive(mediumPriority);
        health.setLowPriorityActive(lowPriority);
    }

    /**
     * Calculate composite health score (0-100)
     * Based on: completion rate, on-time rate, overdue percentage, stuck tasks
     */
    private double calculateHealthScore(TaskExecutionHealthDto health) {
        if (health.getTotalAssignedTasks() == 0) {
            return 100.0;
        }
        
        // Component 1: Completion Rate (40% weight)
        double completionComponent = health.getCompletionRate() * 0.40;
        
        // Component 2: On-Time Completion (30% weight)
        double onTimeComponent = health.getOnTimeCompletionRate() * 0.30;
        
        // Component 3: No Overdue Tasks (20% weight)
        double overduePercentage = (health.getOverdueTasks() * 100.0 / health.getActiveTasks());
        overduePercentage = Math.min(overduePercentage, 100);
        double overdueComponent = (100 - overduePercentage) * 0.20;
        
        // Component 4: No Stuck Tasks (10% weight)
        double stuckPercentage = (health.getStuckTasks() * 100.0 / health.getActiveTasks());
        stuckPercentage = Math.min(stuckPercentage, 100);
        double stuckComponent = (100 - stuckPercentage) * 0.10;
        
        double score = completionComponent + onTimeComponent + overdueComponent + stuckComponent;
        return Math.round(score * 100.0) / 100.0;
    }

    /**
     * Check if a task is completed
     */
    private boolean isTaskCompleted(AssignedTask task) {
        String status = task.getStatus();
        if (status == null) return false;
        return status.equalsIgnoreCase("completed") || 
               status.equalsIgnoreCase("done") || 
               status.equalsIgnoreCase("closed");
    }

    /**
     * Get tasks grouped by completion window
     * Returns map of: [Overdue, Critical (3 days), Due Soon (7 days), On Track]
     */
    public Map<String, List<DeadlineTaskDto>> getTasksByDeadlineWindow() {
        Map<String, List<DeadlineTaskDto>> result = new LinkedHashMap<>();
        
        LocalDate today = LocalDate.now();
        List<AssignedTask> allActiveTasks = assignedTaskRepository.findByStatusNotIgnoreCase("completed");
        
        List<DeadlineTaskDto> overdue = new ArrayList<>();
        List<DeadlineTaskDto> critical = new ArrayList<>();  // Within 3 days
        List<DeadlineTaskDto> dueSoon = new ArrayList<>();    // Within 7 days
        List<DeadlineTaskDto> onTrack = new ArrayList<>();
        
        LocalDate limit3Days = today.plusDays(3);
        LocalDate limit7Days = today.plusDays(7);
        
        for (AssignedTask task : allActiveTasks) {
            if (task.getDeadline() == null) {
                onTrack.add(mapToDeadlineTaskDto(task));
                continue;
            }
            
            if (task.getDeadline().isBefore(today)) {
                overdue.add(mapToDeadlineTaskDto(task));
            } else if (!task.getDeadline().isAfter(limit3Days)) {
                critical.add(mapToDeadlineTaskDto(task));
            } else if (!task.getDeadline().isAfter(limit7Days)) {
                dueSoon.add(mapToDeadlineTaskDto(task));
            } else {
                onTrack.add(mapToDeadlineTaskDto(task));
            }
        }
        
        result.put("overdue", overdue);
        result.put("critical", critical);
        result.put("dueSoon", dueSoon);
        result.put("onTrack", onTrack);
        
        return result;
    }

    /**
     * Get daily completion trend (last 30 days)
     */
    public Map<LocalDate, Integer> getDailyCompletionTrend() {
        Map<LocalDate, Integer> trend = new LinkedHashMap<>();
        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysAgo = today.minusDays(30);
        
        List<AssignedTask> allTasks = assignedTaskRepository.findAll();
        
        // Initialize all dates with 0
        for (LocalDate date = thirtyDaysAgo; !date.isAfter(today); date = date.plusDays(1)) {
            trend.put(date, 0);
        }
        
        // Count completed tasks per day
        for (AssignedTask task : allTasks) {
            if (isTaskCompleted(task) && task.getCompletedAt() != null) {
                LocalDate completedDate = task.getCompletedAt().toLocalDate();
                if (!completedDate.isBefore(thirtyDaysAgo) && !completedDate.isAfter(today)) {
                    trend.put(completedDate, trend.getOrDefault(completedDate, 0) + 1);
                }
            }
        }
        
        return trend;
    }

    /**
     * Helper method to map AssignedTask to DeadlineTaskDto
     */
    private DeadlineTaskDto mapToDeadlineTaskDto(AssignedTask task) {
        String assigneeId = null;
        String assigneeName = null;
        
        if (task.getAssignee() != null) {
            assigneeId = task.getAssignee().getId();
            assigneeName = task.getAssignee().getUsername();
        }
        
        String projectName = null;
        if (task.getProject() != null) {
            projectName = task.getProject().getName();
        }
        
        return new DeadlineTaskDto(
            task.getTaskId(),
            task.getTaskname(),
            task.getDeadline(),
            task.getPriority(),
            assigneeId,
            assigneeName,
            projectName
        );
    }
}
