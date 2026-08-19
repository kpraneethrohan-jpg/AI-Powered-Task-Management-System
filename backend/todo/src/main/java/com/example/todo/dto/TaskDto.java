package com.example.todo.dto;

import java.time.LocalDate;

import com.example.todo.AssignedTask;

public class TaskDto {
    private Long taskId;
    private String taskname;
    private String description;
    private String status;
    private LocalDate deadline;
    private String priority;
    private ProjectDto project;
    private String assignedBy;
    private String assignedById;

    public TaskDto(AssignedTask task) {
        this.taskId = task.getTaskId();
        this.taskname = task.getTaskname();
        this.description = task.getDescription();
        this.status = task.getStatus();
        this.deadline = task.getDeadline();
        this.priority = task.getPriority();
        
        if (task.getProject() != null) {
            this.project = new ProjectDto(task.getProject().getId(), task.getProject().getName());
        } else {
            this.project = null;
        }
        
        if (task.getAssignedBy() != null) {
            this.assignedById = task.getAssignedBy().getId(); 
            this.assignedBy = task.getAssignedBy().getUsername(); 
        }
    }

    public Long getTaskId() { return taskId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }
    public String getTaskname() { return taskname; }
    public void setTaskname(String taskname) { this.taskname = taskname; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public ProjectDto getProject() { return project; }
    public void setProject(ProjectDto project) { this.project = project; }
    public String getAssignedBy() { return assignedBy; }
    public void setAssignedBy(String assignedBy) { this.assignedBy = assignedBy; }
    public String getAssignedById() { return assignedById; }
    public void setAssignedById(String assignedById) { this.assignedById = assignedById; }
}