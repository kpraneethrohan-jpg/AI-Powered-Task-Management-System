package com.example.todo.Service;

import com.example.todo.AssignedTask;
import com.example.todo.UserAuthentication;
import com.example.todo.Repository.AssignedTaskRepository;
import com.example.todo.Repository.UserRepository;
import com.example.todo.dto.EmployeeHistoryDto;
import com.example.todo.dto.PythonRequestDto;
import com.example.todo.dto.RecommendationDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SkillMatchService {

    @Autowired
    private AssignedTaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String pythonUrl = "http://127.0.0.1:5000/recommend";

    public RecommendationDto[] getSkillMatches(String taskDescription) {
        // 1. Fetch all employees
        List<UserAuthentication> allEmployees = userRepository.findAll();

        // 2. Build histories (concatenated task descriptions)
        List<EmployeeHistoryDto> employeeHistories = allEmployees.stream().map(employee -> {
            List<AssignedTask> tasks = taskRepository.findByAssignee(employee);
            String history = tasks.stream()
                    .map(AssignedTask::getDescription)
                    .collect(Collectors.joining(". "));
            return new EmployeeHistoryDto(employee.getId(), history);
        }).collect(Collectors.toList());

        // 3. Request Python BERT/NCF Model
        PythonRequestDto pythonRequest = new PythonRequestDto(taskDescription, employeeHistories);
        return restTemplate.postForObject(pythonUrl, pythonRequest, RecommendationDto[].class);
    }
}