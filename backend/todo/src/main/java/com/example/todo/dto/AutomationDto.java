package com.example.todo.dto;

import java.util.List;
import java.util.Map;

public class AutomationDto {
    public record TaskDraft(String id, String taskName, String description, String priority, String deadline) {}
    public record BulkAutomationRequest(List<TaskDraft> tasks) {}
    public record AutomationResponse(Map<String, List<Recommendation>> suggestions) {}
    public record Recommendation(String employeeId, double score, String reasoning) {}

    public record FinalAssignRequest(
        String tempId,      // The ID from the UnassignedTask table
        String taskName,
        String description,
        String priority,
        java.time.LocalDate deadline,
        String assignedToId,
        String assignedById
    ) {}
}