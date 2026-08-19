package com.example.todo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class PythonRequestDto {

    @JsonProperty("taskDescription")
    private String taskDescription;

    @JsonProperty("employees")
    private List<EmployeeHistoryDto> employees;


    public PythonRequestDto(String taskDescription, List<EmployeeHistoryDto> employees) {
        this.taskDescription = taskDescription;
        this.employees = employees;
    }


    public String getTaskDescription() {
        return taskDescription;
    }

    public void setTaskDescription(String taskDescription) {
        this.taskDescription = taskDescription;
    }

    public List<EmployeeHistoryDto> getEmployees() {
        return employees;
    }

    public void setEmployees(List<EmployeeHistoryDto> employees) {
        this.employees = employees;
    }
}