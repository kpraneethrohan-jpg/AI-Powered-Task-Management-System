package com.example.todo.dto;

public class TaskParseDto {

    public record ParseRequest(String text) {}

    public record ParseResponse(
            String taskName,
            String description,
            String priority,
            String deadline
    ) {}
}