package com.example.todo.dto;

public class EmployeeMetricsDto {

    private int totalAssigned;
    private int completed;
    private int active;
    private int overdue;

    private int onTimeCompleted;
    private int lateCompleted;

    private double completionRate;
    private double avgCompletionDays;

    private int workloadScore;

    public EmployeeMetricsDto() {}

    public int getTotalAssigned() { return totalAssigned; }
    public void setTotalAssigned(int totalAssigned) { this.totalAssigned = totalAssigned; }

    public int getCompleted() { return completed; }
    public void setCompleted(int completed) { this.completed = completed; }

    public int getActive() { return active; }
    public void setActive(int active) { this.active = active; }

    public int getOverdue() { return overdue; }
    public void setOverdue(int overdue) { this.overdue = overdue; }

    public int getOnTimeCompleted() { return onTimeCompleted; }
    public void setOnTimeCompleted(int onTimeCompleted) { this.onTimeCompleted = onTimeCompleted; }

    public int getLateCompleted() { return lateCompleted; }
    public void setLateCompleted(int lateCompleted) { this.lateCompleted = lateCompleted; }

    public double getCompletionRate() { return completionRate; }
    public void setCompletionRate(double completionRate) { this.completionRate = completionRate; }

    public double getAvgCompletionDays() { return avgCompletionDays; }
    public void setAvgCompletionDays(double avgCompletionDays) { this.avgCompletionDays = avgCompletionDays; }

    public int getWorkloadScore() { return workloadScore; }
    public void setWorkloadScore(int workloadScore) { this.workloadScore = workloadScore; }
}