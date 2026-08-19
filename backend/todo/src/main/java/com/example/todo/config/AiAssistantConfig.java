package com.example.todo.config;

import com.example.todo.AssignedTask;
import com.example.todo.Service.AssignedTaskService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import java.util.List;

@Configuration
public class AiAssistantConfig {

    public record TaskSearchRequest(
        String managerName,
        String priority,
        String dueDate
    ) {}

    public record WorkloadRequest(
        Integer hours
    ) {}

    public static final ThreadLocal<String> FOR_USER_ID = new ThreadLocal<>();

    @Component
    public static class TaskTools {

        private final AssignedTaskService taskService;

        public TaskTools(AssignedTaskService taskService) {
            this.taskService = taskService;
        }

        @Tool(description = "Get tasks based on specific filters like manager name, priority level, or due date")
        public List<AssignedTask> getTasks(String managerName, String priority, String dueDate) {
            String currentUid = FOR_USER_ID.get();
            return taskService.searchTasks(currentUid, managerName, priority, dueDate);
        }

        @Tool(description = "Get intelligent task recommendations based on available hours. This analyzes all active tasks and suggests the best ones to focus on within the given time frame, considering priority, deadlines, and time estimates.")
        public List<AssignedTask> getWorkloadAdvice(Integer hours) {
            String currentUid = FOR_USER_ID.get();
            return taskService.getTasksForTimeFrame(currentUid, hours);
        }

        @Tool(description = "Get tasks assigned TO YOU by a specific person. Search by assigner's name or ID. Returns all tasks that this person assigned to you. IMPORTANT: This tool returns a list - you must display ALL tasks in the list, not just one.")
        public List<AssignedTask> getTasksByAssigner(String assignerNameOrId) {
            String currentUid = FOR_USER_ID.get();
            return taskService.getTasksByAssigner(currentUid, assignerNameOrId);
        }
    }
}