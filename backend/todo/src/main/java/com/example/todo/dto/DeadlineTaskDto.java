package com.example.todo.dto;

import java.time.LocalDate;

public class DeadlineTaskDto {

    private Long taskId;
    private String taskname;
    private LocalDate deadline;
    private String priority;

    private String assigneeId;
    private String assigneeName;

    private String projectName;

    public DeadlineTaskDto() {}

    public DeadlineTaskDto(Long taskId, String taskname, LocalDate deadline, String priority,
                           String assigneeId, String assigneeName, String projectName) {
        this.taskId = taskId;
        this.taskname = taskname;
        this.deadline = deadline;
        this.priority = priority;
        this.assigneeId = assigneeId;
        this.assigneeName = assigneeName;
        this.projectName = projectName;
    }

    public Long getTaskId() { return taskId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }

    public String getTaskname() { return taskname; }
    public void setTaskname(String taskname) { this.taskname = taskname; }

    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getAssigneeId() { return assigneeId; }
    public void setAssigneeId(String assigneeId) { this.assigneeId = assigneeId; }

    public String getAssigneeName() { return assigneeName; }
    public void setAssigneeName(String assigneeName) { this.assigneeName = assigneeName; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
}