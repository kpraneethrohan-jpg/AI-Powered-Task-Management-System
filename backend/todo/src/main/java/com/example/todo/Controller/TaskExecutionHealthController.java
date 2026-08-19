package com.example.todo.Controller;

import com.example.todo.Service.TaskExecutionHealthService;
import com.example.todo.dto.TaskExecutionHealthDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Controller for task execution health and delivery efficiency metrics
 * Provides organizational-level insights into task completion status, deadline adherence,
 * and execution flow without evaluating individual employee performance
 */
@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "http://localhost:3000")
public class TaskExecutionHealthController {

    @Autowired
    private TaskExecutionHealthService taskExecutionHealthService;

    /**
     * Get comprehensive task execution health metrics
     * Includes: completion rates, deadline adherence, active task status, health score
     * @return TaskExecutionHealthDto with all health metrics
     */
    @GetMapping("/task-execution")
    public ResponseEntity<TaskExecutionHealthDto> getTaskExecutionHealth() {
        try {
            TaskExecutionHealthDto health = taskExecutionHealthService.getOverallTaskExecutionHealth();
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get tasks organized by deadline window
     * Categories: Overdue, Critical (3 days), Due Soon (7 days), On Track
     * @return Map of task lists grouped by deadline urgency
     */
    @GetMapping("/tasks-by-window")
    public ResponseEntity<Map<String, List<com.example.todo.dto.DeadlineTaskDto>>> getTasksByDeadlineWindow() {
        try {
            Map<String, List<com.example.todo.dto.DeadlineTaskDto>> tasksByWindow = 
                taskExecutionHealthService.getTasksByDeadlineWindow();
            return ResponseEntity.ok(tasksByWindow);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get daily task completion trend for last 30 days
     * Useful for tracking delivery velocity and trends
     * @return Map of dates to completion counts
     */
    @GetMapping("/completion-trend")
    public ResponseEntity<Map<LocalDate, Integer>> getCompletionTrend() {
        try {
            Map<LocalDate, Integer> trend = taskExecutionHealthService.getDailyCompletionTrend();
            return ResponseEntity.ok(trend);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Health check endpoint
     * @return Status message
     */
    @GetMapping("/status")
    public ResponseEntity<String> getStatus() {
        return ResponseEntity.ok("Task Execution Health Service is running");
    }
}
