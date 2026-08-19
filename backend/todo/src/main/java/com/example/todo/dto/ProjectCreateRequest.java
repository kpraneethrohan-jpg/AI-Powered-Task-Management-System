package com.example.todo.dto;

import java.util.List;


public class ProjectCreateRequest {
    private String name;
    private String description;
    private List<String> userIds;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public List<String> getUserIds() { return userIds; }
    public void setUserIds(List<String> userIds) { this.userIds = userIds; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}