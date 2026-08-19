package com.example.todo.dto;

public record AiTaskRecommendation(
        String taskName,
        String description,
        String deadline,
        String priority,
        String status,
        String reasoning
) {}
