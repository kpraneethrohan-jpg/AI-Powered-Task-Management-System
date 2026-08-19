package com.example.todo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RecommendationDto {

    @JsonProperty("employeeId")
    private String employeeId; 

    @JsonProperty("score")
    private double score;


    public RecommendationDto() {
    }
 
    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }
}