package com.example.todo.dto;

public class EmployeeWorkloadDto {

    private String employeeId;
    private String username;

    private int activeTasks;
    private int highPriorityTasks;
    private int overdueTasks;
    private int dueSoonTasks;

    private int workloadScore;

    public EmployeeWorkloadDto() {}

    public EmployeeWorkloadDto(String employeeId, String username, int activeTasks, int highPriorityTasks,
                               int overdueTasks, int dueSoonTasks, int workloadScore) {
        this.employeeId = employeeId;
        this.username = username;
        this.activeTasks = activeTasks;
        this.highPriorityTasks = highPriorityTasks;
        this.overdueTasks = overdueTasks;
        this.dueSoonTasks = dueSoonTasks;
        this.workloadScore = workloadScore;
    }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public int getActiveTasks() { return activeTasks; }
    public void setActiveTasks(int activeTasks) { this.activeTasks = activeTasks; }

    public int getHighPriorityTasks() { return highPriorityTasks; }
    public void setHighPriorityTasks(int highPriorityTasks) { this.highPriorityTasks = highPriorityTasks; }

    public int getOverdueTasks() { return overdueTasks; }
    public void setOverdueTasks(int overdueTasks) { this.overdueTasks = overdueTasks; }

    public int getDueSoonTasks() { return dueSoonTasks; }
    public void setDueSoonTasks(int dueSoonTasks) { this.dueSoonTasks = dueSoonTasks; }

    public int getWorkloadScore() { return workloadScore; }
    public void setWorkloadScore(int workloadScore) { this.workloadScore = workloadScore; }
}