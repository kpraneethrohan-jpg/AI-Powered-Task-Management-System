package com.example.todo.Service;

import com.example.todo.AssignedTask;
import com.example.todo.Repository.AssignedTaskRepository;
import com.example.todo.Repository.UserRepository;
import com.example.todo.dto.EmployeePerformanceDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class PerformanceAnalysisService {

    @Autowired
    private AssignedTaskRepository assignedTaskRepository;

    @Autowired
    private UserRepository userRepository;

    // Get performance for all employees/managers
    public List<EmployeePerformanceDto> getAllEmployeePerformance() {

        var allUsers = userRepository.findAll();
        List<EmployeePerformanceDto> performanceList = new ArrayList<>();

        for (var user : allUsers) {

            if (user.getRole() == null) continue;
            String role = user.getRole().toLowerCase();

            // Consider only employees + managers
            if (!(role.equals("employee") || role.equals("manager"))) continue;

            EmployeePerformanceDto dto = calculatePerformanceForEmployee(user.getId(), user.getUsername());
            performanceList.add(dto);
        }

        // Sort by completionRate desc (best performers first)
        performanceList.sort((a, b) -> Double.compare(b.getCompletionRate(), a.getCompletionRate()));

        return performanceList;
    }

    // Get performance for a specific employee by ID or username
    public EmployeePerformanceDto getEmployeePerformance(String employeeNameOrId) {

        var userOpt = userRepository.findById(employeeNameOrId);

        if (userOpt.isPresent()) {
            var user = userOpt.get();
            return calculatePerformanceForEmployee(user.getId(), user.getUsername());
        }

        // Search by username
        var allUsers = userRepository.findAll();
        for (var u : allUsers) {
            if (u.getUsername() != null && u.getUsername().equalsIgnoreCase(employeeNameOrId)) {
                return calculatePerformanceForEmployee(u.getId(), u.getUsername());
            }
        }

        // If not found
        return new EmployeePerformanceDto(
                null,
                employeeNameOrId,
                0,
                0,
                0,
                0,
                0.0,
                0.0
        );
    }

    // Core logic
    private EmployeePerformanceDto calculatePerformanceForEmployee(String employeeId, String username) {

        List<AssignedTask> tasks = assignedTaskRepository.findByAssigneeId(employeeId);

        int totalAssigned = tasks.size();
        int totalCompleted = 0;

        int completedOnTime = 0;
        int completedLate = 0;

        long totalDaysTaken = 0;
        int completionDaysCount = 0;

        for (AssignedTask task : tasks) {

            // We only calculate completion metrics if task is done
            if (task.getStatus() != null && task.getStatus().equalsIgnoreCase("done")) {

                totalCompleted++;

                // Completion time calculation
                if (task.getCreatedAt() != null && task.getCompletedAt() != null) {

                    try {
                        LocalDateTime created = task.getCreatedAt();
                        LocalDateTime completed = task.getCompletedAt();

                        long daysTaken = ChronoUnit.DAYS.between(created, completed);

                        if (daysTaken < 0) daysTaken = 0;

                        totalDaysTaken += daysTaken;
                        completionDaysCount++;

                    } catch (Exception ignored) {}
                }

                // Deadline comparison (on time vs late)
                if (task.getDeadline() != null &&
                        task.getCompletedAt() != null ) {

                    try {
                        LocalDate deadline = task.getDeadline();
                        LocalDate completed = task.getCompletedAt().toLocalDate();

                        if (completed.isAfter(deadline)) {
                            completedLate++;
                        } else {
                            completedOnTime++;
                        }

                    } catch (Exception ignored) {}
                }
            }
        }

        double completionRate = 0.0;
        if (totalAssigned > 0) {
            completionRate = ((double) totalCompleted / totalAssigned) * 100.0;
        }

        double avgCompletionDays = 0.0;
        if (completionDaysCount > 0) {
            avgCompletionDays = (double) totalDaysTaken / completionDaysCount;
        }

        return new EmployeePerformanceDto(
                employeeId,
                username,
                totalAssigned,
                totalCompleted,
                completedOnTime,
                completedLate,
                Math.round(completionRate * 100.0) / 100.0,   // round to 2 decimals
                Math.round(avgCompletionDays * 100.0) / 100.0 // round to 2 decimals
        );
    }

    // ✅ Fastest employees (lowest avg completion days)
    public List<EmployeePerformanceDto> getFastestEmployees(int limit) {

        List<EmployeePerformanceDto> list = getAllEmployeePerformance();

        // Remove employees with no completed tasks
        list.removeIf(p -> p.getTotalCompleted() == 0);

        list.sort((a, b) -> Double.compare(a.getAvgCompletionDays(), b.getAvgCompletionDays()));

        if (list.size() > limit) {
            return list.subList(0, limit);
        }

        return list;
    }

    // ✅ Employees frequently missing deadlines
    public List<EmployeePerformanceDto> getEmployeesMissingDeadlines(int limit) {

        List<EmployeePerformanceDto> list = getAllEmployeePerformance();

        list.sort((a, b) -> Integer.compare(b.getCompletedLate(), a.getCompletedLate()));

        if (list.size() > limit) {
            return list.subList(0, limit);
        }

        return list;
    }
}