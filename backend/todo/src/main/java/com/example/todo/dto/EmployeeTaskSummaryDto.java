package com.example.todo.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class EmployeeTaskSummaryDto {

    private Long taskId;
    private String taskName;
    private String status;
    private String priority;
    private LocalDate deadline;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    private String projectName;

    public EmployeeTaskSummaryDto() {}

    public EmployeeTaskSummaryDto(Long taskId, String taskName, String status, String priority,
                                  LocalDate deadline, LocalDateTime createdAt, LocalDateTime completedAt, String projectName) {
        this.taskId = taskId;
        this.taskName = taskName;
        this.status = status;
        this.priority = priority;
        this.deadline = deadline;
        this.createdAt = createdAt;
        this.completedAt = completedAt;
        this.projectName = projectName;
    }

    public Long getTaskId() { return taskId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }

    public String getTaskName() { return taskName; }
    public void setTaskName(String taskName) { this.taskName = taskName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
}