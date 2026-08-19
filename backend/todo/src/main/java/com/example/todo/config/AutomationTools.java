package com.example.todo.config;

import com.example.todo.AssignedTask;
import com.example.todo.Service.AssignedTaskService;
import com.example.todo.Service.DeadlineAnalysisService;
import com.example.todo.Service.EmployeeWorkloadService;
import com.example.todo.Service.PerformanceAnalysisService;
import com.example.todo.Service.ProjectAnalyticsService;
import com.example.todo.Service.SkillMatchService;
import com.example.todo.dto.RecommendationDto;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.example.todo.dto.DeadlineTaskDto;
import com.example.todo.dto.EmployeeWorkloadDto;
import com.example.todo.dto.EmployeePerformanceDto;
import com.example.todo.dto.TaskMonitoringDto;
import com.example.todo.dto.InactiveEmployeeDto;
import com.example.todo.Service.MonitoringAnalysisService;
import com.example.todo.dto.ProjectAnalyticsDto;

import java.util.Arrays;
import java.util.List;

@Component
public class AutomationTools {

    @Autowired
    private SkillMatchService skillMatchService;

    @Autowired
    private AssignedTaskService assignedTaskService;

    @Autowired
    private EmployeeWorkloadService employeeWorkloadService;

    @Autowired
    private DeadlineAnalysisService deadlineAnalysisService;

    @Autowired
    private PerformanceAnalysisService performanceAnalysisService;

    @Autowired
    private MonitoringAnalysisService monitoringAnalysisService;

    @Autowired
    private ProjectAnalyticsService projectAnalyticsService;

    @Tool(description = "Retrieve skill match scores for a task description using a BERT/NCF model. Returns a list of potential employees with their suitability scores.")
    public List<RecommendationDto> getSkillMatchScores(String taskDescription) {
        RecommendationDto[] matches = skillMatchService.getSkillMatches(taskDescription);
        return matches != null ? Arrays.asList(matches) : List.of();
    }

    @Tool(description = "Check the current workload of a specific employee. Returns the list of tasks currently assigned to them.")
    public List<AssignedTask> getEmployeeWorkload(String employeeId) {
        return assignedTaskService.getActiveTaskCount(employeeId);
    }

    @Tool(description = "Returns workload summary of all employees and managers. Includes active task count, overdue tasks, due soon tasks, and workload score. Use this tool when admin asks who is overloaded or free.")
    public List<EmployeeWorkloadDto> getAllEmployeeWorkloads() {
        return employeeWorkloadService.getAllEmployeeWorkloads();
    }

    @Tool(description = "Get all overdue tasks (deadline already passed). Returns task list with assignee and project details.")
    public List<DeadlineTaskDto> getOverdueTasks() {
        return deadlineAnalysisService.getOverdueTasks();
    }

    @Tool(description = "Get all tasks due within the next given number of days. Use for questions like due in next 3 days or urgent tasks.")
    public List<DeadlineTaskDto> getTasksDueInNextDays(int days) {
        return deadlineAnalysisService.getTasksDueInDays(days);
    }

    // Performnce Analysis Tools(Admin AI Assistant)

    @Tool(description = "Returns performance metrics for all employees including completion rate, average completion time, and deadline misses. Useful for admin performance analysis.")
    public List<EmployeePerformanceDto> getAllEmployeePerformance() {
        return performanceAnalysisService.getAllEmployeePerformance();
    }

    @Tool(description = "Returns performance report for a specific employee by username or employeeId. Includes completion rate, on-time completion, late completion, and average completion days.")
    public EmployeePerformanceDto getEmployeePerformance(String employeeNameOrId) {
        return performanceAnalysisService.getEmployeePerformance(employeeNameOrId);
    }

    @Tool(description = "Returns top fastest employees who complete tasks quickly. Uses average completion days metric.")
    public List<EmployeePerformanceDto> getFastestEmployees(int limit) {
        return performanceAnalysisService.getFastestEmployees(limit);
    }

    @Tool(description = "Returns employees who frequently miss deadlines. Sorted by late completions.")
    public List<EmployeePerformanceDto> getEmployeesMissingDeadlines(int limit) {
        return performanceAnalysisService.getEmployeesMissingDeadlines(limit);
    }

    // Monitoring Tools(Admin AI Assistant)

    @Tool(description = "Returns tasks that are stuck in In Progress status for more than the given number of days.")
    public List<TaskMonitoringDto> getTasksStuckInProgress(int days) {
        return monitoringAnalysisService.getTasksStuckInProgress(days);
    }

    @Tool(description = "Returns all active tasks that have not been updated for the given number of days. Useful for identifying stale tasks.")
    public List<TaskMonitoringDto> getTasksNotUpdatedRecently(int days) {
        return monitoringAnalysisService.getTasksNotUpdatedInDays(days);
    }

    @Tool(description = "Returns employees/managers who have not updated any active task recently for the given number of days.")
    public List<InactiveEmployeeDto> getInactiveEmployees(int days) {
        return monitoringAnalysisService.getInactiveEmployees(days);
    }

    @Tool(description = "Returns tasks that are currently waiting for review (status = In Review).")
    public List<TaskMonitoringDto> getTasksWaitingForReview() {
        return monitoringAnalysisService.getTasksWaitingForReview();
    }


//Project Analytics Tools(Admin AI Assistant)

@Tool(description = "Returns project progress summary for all projects. Includes total tasks, pending tasks, completed tasks, overdue tasks, and due soon tasks.")
public List<ProjectAnalyticsDto> getAllProjectAnalytics() {
    return projectAnalyticsService.getAllProjectAnalytics();
}

@Tool(description = "Returns top delayed projects sorted by overdue task count.")
public List<ProjectAnalyticsDto> getMostDelayedProjects(int limit) {
    return projectAnalyticsService.getMostDelayedProjects(limit);
}

@Tool(description = "Returns projects with most pending tasks (To Do + In Progress + In Review).")
public List<ProjectAnalyticsDto> getProjectsWithMostPendingTasks(int limit) {
    return projectAnalyticsService.getProjectsWithMostPendingTasks(limit);
}

@Tool(description = "Returns projects with maximum completed tasks.")
public List<ProjectAnalyticsDto> getProjectsWithMostCompletedTasks(int limit) {
    return projectAnalyticsService.getProjectsWithMostCompletedTasks(limit);
}
}