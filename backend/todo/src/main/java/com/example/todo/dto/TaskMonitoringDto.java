package com.example.todo.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class TaskMonitoringDto {

    private Long taskId;
    private String taskname;
    private String status;
    private String priority;
    private LocalDate deadline;

    private String assigneeId;
    private String assigneeName;

    private LocalDateTime lastUpdatedAt;

    public TaskMonitoringDto() {}

    public TaskMonitoringDto(Long taskId, String taskname, String status, String priority,
                             LocalDate deadline, String assigneeId, String assigneeName,
                             LocalDateTime lastUpdatedAt) {
        this.taskId = taskId;
        this.taskname = taskname;
        this.status = status;
        this.priority = priority;
        this.deadline = deadline;
        this.assigneeId = assigneeId;
        this.assigneeName = assigneeName;
        this.lastUpdatedAt = lastUpdatedAt;
    }

    public Long getTaskId() { return taskId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }

    public String getTaskname() { return taskname; }
    public void setTaskname(String taskname) { this.taskname = taskname; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }

    public String getAssigneeId() { return assigneeId; }
    public void setAssigneeId(String assigneeId) { this.assigneeId = assigneeId; }

    public String getAssigneeName() { return assigneeName; }
    public void setAssigneeName(String assigneeName) { this.assigneeName = assigneeName; }

    public LocalDateTime getLastUpdatedAt() { return lastUpdatedAt; }
    public void setLastUpdatedAt(LocalDateTime lastUpdatedAt) { this.lastUpdatedAt = lastUpdatedAt; }
}