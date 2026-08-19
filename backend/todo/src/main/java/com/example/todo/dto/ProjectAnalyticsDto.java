package com.example.todo.dto;

public class ProjectAnalyticsDto {

    private Long projectId;
    private String projectName;

    private int totalTasks;
    private int todoTasks;
    private int inProgressTasks;
    private int inReviewTasks;
    private int doneTasks;

    private int overdueTasks;
    private int dueSoonTasks;

    private int totalAssignees;

    public ProjectAnalyticsDto() {}

    public ProjectAnalyticsDto(Long projectId, String projectName, int totalTasks,
                               int todoTasks, int inProgressTasks, int inReviewTasks, int doneTasks,
                               int overdueTasks, int dueSoonTasks, int totalAssignees) {
        this.projectId = projectId;
        this.projectName = projectName;
        this.totalTasks = totalTasks;
        this.todoTasks = todoTasks;
        this.inProgressTasks = inProgressTasks;
        this.inReviewTasks = inReviewTasks;
        this.doneTasks = doneTasks;
        this.overdueTasks = overdueTasks;
        this.dueSoonTasks = dueSoonTasks;
        this.totalAssignees = totalAssignees;
    }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public int getTotalTasks() { return totalTasks; }
    public void setTotalTasks(int totalTasks) { this.totalTasks = totalTasks; }

    public int getTodoTasks() { return todoTasks; }
    public void setTodoTasks(int todoTasks) { this.todoTasks = todoTasks; }

    public int getInProgressTasks() { return inProgressTasks; }
    public void setInProgressTasks(int inProgressTasks) { this.inProgressTasks = inProgressTasks; }

    public int getInReviewTasks() { return inReviewTasks; }
    public void setInReviewTasks(int inReviewTasks) { this.inReviewTasks = inReviewTasks; }

    public int getDoneTasks() { return doneTasks; }
    public void setDoneTasks(int doneTasks) { this.doneTasks = doneTasks; }

    public int getOverdueTasks() { return overdueTasks; }
    public void setOverdueTasks(int overdueTasks) { this.overdueTasks = overdueTasks; }

    public int getDueSoonTasks() { return dueSoonTasks; }
    public void setDueSoonTasks(int dueSoonTasks) { this.dueSoonTasks = dueSoonTasks; }

    public int getTotalAssignees() { return totalAssignees; }
    public void setTotalAssignees(int totalAssignees) { this.totalAssignees = totalAssignees; }
}