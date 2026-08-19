package com.example.todo;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

@Entity
@Table(name = "assigned_task")
public class AssignedTask {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO) 
    private Long taskId;

    private String taskname;
    private String description;
    private String status;
    private LocalDate deadline;
    private String priority;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "last_updated_at")
    private LocalDateTime lastUpdatedAt;

    private Integer estimatedHours;

    @ManyToOne
    @JoinColumn(name = "assignee_id", referencedColumnName = "id")
    @JsonIgnore
    private UserAuthentication assignee;

    @ManyToOne
    @JoinColumn(name = "assigned_by_id", referencedColumnName = "id")
    @JsonIgnore
    private UserAuthentication assignedBy;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<FileEntity> files;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    @JsonIgnore
    private ProjectEntity project;

    // ===== GETTERS & SETTERS =====

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

    public Integer getEstimatedHours() { return estimatedHours; }
    public void setEstimatedHours(Integer estimatedHours) { this.estimatedHours = estimatedHours; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public LocalDateTime getLastUpdatedAt() { return lastUpdatedAt; }
    public void setLastUpdatedAt(LocalDateTime lastUpdatedAt) { this.lastUpdatedAt = lastUpdatedAt; }

    public UserAuthentication getAssignee() { return assignee; }
    public void setAssignee(UserAuthentication assignee) { this.assignee = assignee; }

    public UserAuthentication getAssignedBy() { return assignedBy; }
    public void setAssignedBy(UserAuthentication assignedBy) { this.assignedBy = assignedBy; }

    public ProjectEntity getProject() { return project; }
    public void setProject(ProjectEntity project) { this.project = project; }
}