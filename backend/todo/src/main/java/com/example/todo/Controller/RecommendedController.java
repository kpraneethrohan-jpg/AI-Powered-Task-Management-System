package com.example.todo.Controller;

import com.example.todo.AssignedTask;
import com.example.todo.UserAuthentication;
import com.example.todo.Repository.AssignedTaskRepository;
import com.example.todo.Repository.UserRepository;
import com.example.todo.dto.EmployeeHistoryDto;
import com.example.todo.dto.PythonRequestDto;
import com.example.todo.dto.RecommendationDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;
import java.util.List;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashSet;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class RecommendedController {

    @Autowired
    private AssignedTaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/recommend")
    public ResponseEntity<RecommendationDto[]> getRecommendation(@RequestBody String taskDescription) {
        
        List<UserAuthentication> allEmployees = userRepository.findAll().stream()
            .filter(user -> "employee".equalsIgnoreCase(user.getRole()))
            .toList();

        List<EmployeeHistoryDto> employeeHistories = allEmployees.stream().map(employee -> {
            
            List<AssignedTask> tasks = taskRepository.findByAssignee(employee);
            
            String concatenatedDescriptions = tasks.stream()
                    .map(AssignedTask::getDescription)
                    .collect(Collectors.joining(". "));

     
            return new EmployeeHistoryDto(employee.getId(), concatenatedDescriptions);
            
        }).collect(Collectors.toList());

        PythonRequestDto pythonRequest = new PythonRequestDto(taskDescription, employeeHistories);

        RestTemplate restTemplate = new RestTemplate();
        String pythonUrl = "http://127.0.0.1:5000/recommend";

        try {
            RecommendationDto[] recommendations = restTemplate.postForObject(
                    pythonUrl, pythonRequest, RecommendationDto[].class);
            if (recommendations != null) {
                return ResponseEntity.ok(recommendations);
            }
        } catch (RestClientException exception) {
            // The optional Python service is not bundled with this application.
            System.out.println("Recommendation model unavailable; using local matching: "
                    + exception.getMessage());
        }

        return ResponseEntity.ok(localRecommendations(taskDescription, employeeHistories));
    }

    private RecommendationDto[] localRecommendations(
            String taskDescription, List<EmployeeHistoryDto> employeeHistories) {
        Set<String> taskWords = words(taskDescription);

        return employeeHistories.stream()
                .map(history -> {
                    Set<String> employeeWords = words(history.getPastTaskDescriptions());
                    long matchingWords = taskWords.stream().filter(employeeWords::contains).count();
                    RecommendationDto recommendation = new RecommendationDto();
                    recommendation.setEmployeeId(history.getEmployeeId());
                    recommendation.setScore(taskWords.isEmpty()
                            ? 0.0
                            : (double) matchingWords / taskWords.size());
                    return recommendation;
                })
                .sorted(Comparator.comparingDouble(RecommendationDto::getScore).reversed())
                .toArray(RecommendationDto[]::new);
    }

    private Set<String> words(String text) {
        if (text == null) {
            return Set.of();
        }
        return Arrays.stream(text.toLowerCase(Locale.ROOT).split("[^a-z0-9]+"))
                .filter(word -> word.length() > 2)
                .collect(Collectors.toCollection(HashSet::new));
    }
    
    @GetMapping("/training-data")
    public List<Map<String, Object>> getTrainingData() {
        return taskRepository.findAll().stream()
                .filter(task -> task.getAssignee() != null && task.getDescription() != null)
                .map(task -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    // No parsing needed here either.
                    map.put("employeeId", task.getAssignee().getId());
                    map.put("taskDescription", task.getDescription());
                    return map;
                })
                .collect(Collectors.toList());
    }
}