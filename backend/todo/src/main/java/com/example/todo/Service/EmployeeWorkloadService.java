package com.example.todo.Service;

import com.example.todo.AssignedTask;
import com.example.todo.Repository.UserRepository;
import com.example.todo.dto.EmployeeWorkloadDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class EmployeeWorkloadService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AssignedTaskService assignedTaskService;

    public List<EmployeeWorkloadDto> getAllEmployeeWorkloads() {

        LocalDate today = LocalDate.now();
        LocalDate dueSoonDate = today.plusDays(3);

        // Fetch employees + managers (depending on your roles table)
        var allUsers = userRepository.findAll();

        List<EmployeeWorkloadDto> result = new ArrayList<>();

        for (var user : allUsers) {

            // Only for employees/managers (skip admin)
            if (user.getRole() == null) continue;
            String role = user.getRole().toLowerCase();

            if (!(role.equals("employee") || role.equals("manager"))) continue;

            List<AssignedTask> tasks = assignedTaskService.getActiveTasksForEmployee(user.getId());

            int active = tasks.size();
            int high = 0;
            int overdue = 0;
            int dueSoon = 0;

            for (AssignedTask task : tasks) {
                if (task.getPriority() != null && task.getPriority().equalsIgnoreCase("High")) {
                    high++;
                }

                if (task.getDeadline() != null) {
                    try {
                        LocalDate deadline = task.getDeadline();

                        if (deadline.isBefore(today)) overdue++;
                        else if (!deadline.isAfter(dueSoonDate)) dueSoon++;

                    } catch (Exception ignored) {}
                }
            }

            int score = (active * 1) + (high * 2) + (overdue * 3) + (dueSoon * 2);

            result.add(new EmployeeWorkloadDto(
                    user.getId(),
                    user.getUsername(),
                    active,
                    high,
                    overdue,
                    dueSoon,
                    score
            ));
        }

        // Sort by workload score descending
        result.sort((a, b) -> Integer.compare(b.getWorkloadScore(), a.getWorkloadScore()));

        return result;
    }
}