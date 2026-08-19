package com.example.todo;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users_table")
public class UserAuthentication {

    @Id
    private String id; 
    private String username;
    private String password;
    private String role;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Profile profile;

    @OneToMany(mappedBy = "assignee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AssignedTask> assignedTasks;
    
    @ManyToMany(mappedBy = "assignedUsers", fetch = FetchType.LAZY)
    @JsonIgnore 
    private Set<ProjectEntity> projects = new HashSet<>();
    
    public Set<ProjectEntity> getProjects() { 
    	return projects; 
    }
    
    public void setProjects(Set<ProjectEntity> projects) { 
    	this.projects = projects; 
    }

 
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Profile getProfile() {
        return profile;
    }

    public void setProfile(Profile profile) {
        this.profile = profile;
        if (profile != null) {
            profile.setUser(this); 
        }
    }

    public List<AssignedTask> getAssignedTasks() {
        return assignedTasks;
    }

    public void setAssignedTasks(List<AssignedTask> assignedTasks) {
        this.assignedTasks = assignedTasks;
    }
}
