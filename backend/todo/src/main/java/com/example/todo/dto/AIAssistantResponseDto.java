package com.example.todo.dto;

import java.util.List;

public record AIAssistantResponseDto(
    String type, 
    List<AiTaskRecommendation> tasks
) {}