package com.example.todo.dto;

import java.util.List;

/**
 * DTO for comprehensive task execution health metrics
 * Provides insights into task completion status, deadline adherence, and delivery efficiency
 */
public class TaskExecutionHealthDto {
    
    // Overall Metrics
    private long totalAssignedTasks;
    private long completedTasks;
    private long activeTasks;
    private long overdueTasks;
    
    // Completion Quality Metrics
    private long tasksCompletedOnTime;
    private long tasksCompletedLate;
    private double completionRate;  // percentage (0-100)
    private double onTimeCompletionRate;  // percentage of completed tasks that were on-time
    
    // Deadline Adherence
    private long tasksDueSoon;  // Tasks due within next 7 days
    private long criticalTasks;  // Tasks due within 3 days
    
    // Status Breakdown
    private long pendingTasks;
    private long inProgressTasks;
    private long stuckTasks;  // In Progress for more than 5 days
    
    // Priority Distribution of Active Tasks
    private long highPriorityActive;
    private long mediumPriorityActive;
    private long lowPriorityActive;
    
    // Detailed Lists
    private List<DeadlineTaskDto> overduTaskList;
    private List<DeadlineTaskDto> dueSoonTaskList;
    private List<DeadlineTaskDto> criticalTaskList;
    private List<TaskMonitoringDto> stuckTasksList;
    
    // Health Score
    private double healthScore;  // 0-100, composite metric
    
    public TaskExecutionHealthDto() {}

    // Constructor with main metrics
    public TaskExecutionHealthDto(long totalAssignedTasks, long completedTasks, long activeTasks,
                                  long overdueTasks, long tasksCompletedOnTime, long tasksCompletedLate,
                                  double completionRate, double onTimeCompletionRate,
                                  long tasksDueSoon, long criticalTasks) {
        this.totalAssignedTasks = totalAssignedTasks;
        this.completedTasks = completedTasks;
        this.activeTasks = activeTasks;
        this.overdueTasks = overdueTasks;
        this.tasksCompletedOnTime = tasksCompletedOnTime;
        this.tasksCompletedLate = tasksCompletedLate;
        this.completionRate = completionRate;
        this.onTimeCompletionRate = onTimeCompletionRate;
        this.tasksDueSoon = tasksDueSoon;
        this.criticalTasks = criticalTasks;
    }

    // Getters and Setters
    public long getTotalAssignedTasks() {
        return totalAssignedTasks;
    }

    public void setTotalAssignedTasks(long totalAssignedTasks) {
        this.totalAssignedTasks = totalAssignedTasks;
    }

    public long getCompletedTasks() {
        return completedTasks;
    }

    public void setCompletedTasks(long completedTasks) {
        this.completedTasks = completedTasks;
    }

    public long getActiveTasks() {
        return activeTasks;
    }

    public void setActiveTasks(long activeTasks) {
        this.activeTasks = activeTasks;
    }

    public long getOverdueTasks() {
        return overdueTasks;
    }

    public void setOverdueTasks(long overdueTasks) {
        this.overdueTasks = overdueTasks;
    }

    public long getTasksCompletedOnTime() {
        return tasksCompletedOnTime;
    }

    public void setTasksCompletedOnTime(long tasksCompletedOnTime) {
        this.tasksCompletedOnTime = tasksCompletedOnTime;
    }

    public long getTasksCompletedLate() {
        return tasksCompletedLate;
    }

    public void setTasksCompletedLate(long tasksCompletedLate) {
        this.tasksCompletedLate = tasksCompletedLate;
    }

    public double getCompletionRate() {
        return completionRate;
    }

    public void setCompletionRate(double completionRate) {
        this.completionRate = completionRate;
    }

    public double getOnTimeCompletionRate() {
        return onTimeCompletionRate;
    }

    public void setOnTimeCompletionRate(double onTimeCompletionRate) {
        this.onTimeCompletionRate = onTimeCompletionRate;
    }

    public long getTasksDueSoon() {
        return tasksDueSoon;
    }

    public void setTasksDueSoon(long tasksDueSoon) {
        this.tasksDueSoon = tasksDueSoon;
    }

    public long getCriticalTasks() {
        return criticalTasks;
    }

    public void setCriticalTasks(long criticalTasks) {
        this.criticalTasks = criticalTasks;
    }

    public long getPendingTasks() {
        return pendingTasks;
    }

    public void setPendingTasks(long pendingTasks) {
        this.pendingTasks = pendingTasks;
    }

    public long getInProgressTasks() {
        return inProgressTasks;
    }

    public void setInProgressTasks(long inProgressTasks) {
        this.inProgressTasks = inProgressTasks;
    }

    public long getStuckTasks() {
        return stuckTasks;
    }

    public void setStuckTasks(long stuckTasks) {
        this.stuckTasks = stuckTasks;
    }

    public long getHighPriorityActive() {
        return highPriorityActive;
    }

    public void setHighPriorityActive(long highPriorityActive) {
        this.highPriorityActive = highPriorityActive;
    }

    public long getMediumPriorityActive() {
        return mediumPriorityActive;
    }

    public void setMediumPriorityActive(long mediumPriorityActive) {
        this.mediumPriorityActive = mediumPriorityActive;
    }

    public long getLowPriorityActive() {
        return lowPriorityActive;
    }

    public void setLowPriorityActive(long lowPriorityActive) {
        this.lowPriorityActive = lowPriorityActive;
    }

    public List<DeadlineTaskDto> getOverdueTaskList() {
        return overduTaskList;
    }

    public void setOverdueTaskList(List<DeadlineTaskDto> overduTaskList) {
        this.overduTaskList = overduTaskList;
    }

    public List<DeadlineTaskDto> getDueSoonTaskList() {
        return dueSoonTaskList;
    }

    public void setDueSoonTaskList(List<DeadlineTaskDto> dueSoonTaskList) {
        this.dueSoonTaskList = dueSoonTaskList;
    }

    public List<DeadlineTaskDto> getCriticalTaskList() {
        return criticalTaskList;
    }

    public void setCriticalTaskList(List<DeadlineTaskDto> criticalTaskList) {
        this.criticalTaskList = criticalTaskList;
    }

    public List<TaskMonitoringDto> getStuckTasksList() {
        return stuckTasksList;
    }

    public void setStuckTasksList(List<TaskMonitoringDto> stuckTasksList) {
        this.stuckTasksList = stuckTasksList;
    }

    public double getHealthScore() {
        return healthScore;
    }

    public void setHealthScore(double healthScore) {
        this.healthScore = healthScore;
    }
}
