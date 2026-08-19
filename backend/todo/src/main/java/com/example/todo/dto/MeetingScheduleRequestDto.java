package com.example.todo.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

public class MeetingScheduleRequestDto {
    
    private String title;
    private String description;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm") 
    private LocalDateTime startTime;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm") 
    private LocalDateTime endTime;
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public LocalDateTime getStartTime() {
        return startTime;
    }
    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }
    public LocalDateTime getEndTime() {
        return endTime;
    }
    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }
}
