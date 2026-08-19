package com.example.todo.dto;

import java.util.List;

public class EmployeeReportDto {

    private String employeeId;
    private String employeeName;
    private String role;

    private String email;
    private String phone;

    private EmployeeMetricsDto metrics;

    private List<EmployeeTaskSummaryDto> tasks;

    private String aiSummary;

    public EmployeeReportDto() {}

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }


    public EmployeeMetricsDto getMetrics() { return metrics; }
    public void setMetrics(EmployeeMetricsDto metrics) { this.metrics = metrics; }

    public List<EmployeeTaskSummaryDto> getTasks() { return tasks; }
    public void setTasks(List<EmployeeTaskSummaryDto> tasks) { this.tasks = tasks; }

    public String getAiSummary() { return aiSummary; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }
}