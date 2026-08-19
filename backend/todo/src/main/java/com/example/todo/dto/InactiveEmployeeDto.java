package com.example.todo.dto;

public class InactiveEmployeeDto {

    private String employeeId;
    private String username;
    private int activeTasks;
    private String lastTaskUpdatedDate;

    public InactiveEmployeeDto() {}

    public InactiveEmployeeDto(String employeeId, String username, int activeTasks, String lastTaskUpdatedDate) {
        this.employeeId = employeeId;
        this.username = username;
        this.activeTasks = activeTasks;
        this.lastTaskUpdatedDate = lastTaskUpdatedDate;
    }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public int getActiveTasks() { return activeTasks; }
    public void setActiveTasks(int activeTasks) { this.activeTasks = activeTasks; }

    public String getLastTaskUpdatedDate() { return lastTaskUpdatedDate; }
    public void setLastTaskUpdatedDate(String lastTaskUpdatedDate) { this.lastTaskUpdatedDate = lastTaskUpdatedDate; }
}