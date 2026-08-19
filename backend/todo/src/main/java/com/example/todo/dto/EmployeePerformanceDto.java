package com.example.todo.dto;

public class EmployeePerformanceDto {

    private String employeeId;
    private String username;

    private int totalAssigned;
    private int totalCompleted;
    private int completedOnTime;
    private int completedLate;

    private double completionRate;
    private double avgCompletionDays;

    public EmployeePerformanceDto() {}

    public EmployeePerformanceDto(String employeeId, String username,
                                  int totalAssigned, int totalCompleted,
                                  int completedOnTime, int completedLate,
                                  double completionRate, double avgCompletionDays) {
        this.employeeId = employeeId;
        this.username = username;
        this.totalAssigned = totalAssigned;
        this.totalCompleted = totalCompleted;
        this.completedOnTime = completedOnTime;
        this.completedLate = completedLate;
        this.completionRate = completionRate;
        this.avgCompletionDays = avgCompletionDays;
    }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public int getTotalAssigned() { return totalAssigned; }
    public void setTotalAssigned(int totalAssigned) { this.totalAssigned = totalAssigned; }

    public int getTotalCompleted() { return totalCompleted; }
    public void setTotalCompleted(int totalCompleted) { this.totalCompleted = totalCompleted; }

    public int getCompletedOnTime() { return completedOnTime; }
    public void setCompletedOnTime(int completedOnTime) { this.completedOnTime = completedOnTime; }

    public int getCompletedLate() { return completedLate; }
    public void setCompletedLate(int completedLate) { this.completedLate = completedLate; }

    public double getCompletionRate() { return completionRate; }
    public void setCompletionRate(double completionRate) { this.completionRate = completionRate; }

    public double getAvgCompletionDays() { return avgCompletionDays; }
    public void setAvgCompletionDays(double avgCompletionDays) { this.avgCompletionDays = avgCompletionDays; }
}