package com.example.todo;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class UnassignedTask {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String taskname;
    private String description;
    private String priority;
    private String deadline;

    @ManyToOne
    @JoinColumn(name = "created_by_id", referencedColumnName = "id")
    private UserAuthentication createdBy; // The Admin/Manager who created this

    // Getters and Setters...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTaskname() { return taskname; }
    public void setTaskname(String taskname) { this.taskname = taskname; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getDeadline() { return deadline; }
    public void setDeadline(String deadline) { this.deadline = deadline; }
    public UserAuthentication getCreatedBy() { return createdBy; }
    public void setCreatedBy(UserAuthentication createdBy) { this.createdBy = createdBy; }
}