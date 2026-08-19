package com.example.todo.Service;

import com.example.todo.AssignedTask;
import com.example.todo.Profile;
import com.example.todo.UserAuthentication;
import com.example.todo.Repository.AssignedTaskRepository;
import com.example.todo.Repository.ProfileRepository;
import com.example.todo.Repository.UserRepository;
import com.example.todo.dto.EmployeeMetricsDto;
import com.example.todo.dto.EmployeeReportDto;
import com.example.todo.dto.EmployeeTaskSummaryDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class EmployeeReportService {

    @Autowired
    private AssignedTaskRepository assignedTaskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private EmployeeReportAiSummaryService aiSummaryService;

    @Autowired
    private EmployeeReportPdfGeneratorService pdfGenerator;

    public byte[] generateEmployeeReportPdf(String employeeId) {

        UserAuthentication employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        Profile profile = profileRepository.findById(employeeId).orElse(null);

        List<AssignedTask> tasks = assignedTaskRepository.findByAssigneeId(employeeId);

        // Build Task DTO list
        List<EmployeeTaskSummaryDto> taskDtos = new ArrayList<>();

        for (AssignedTask t : tasks) {
            String projectName = (t.getProject() != null) ? t.getProject().getName() : "General";

            taskDtos.add(new EmployeeTaskSummaryDto(
                    t.getTaskId(),
                    t.getTaskname(),
                    t.getStatus(),
                    t.getPriority(),
                    t.getDeadline(),
                    t.getCreatedAt(),
                    t.getCompletedAt(),
                    projectName
            ));
        }

        // Build Metrics
        EmployeeMetricsDto metrics = calculateMetrics(tasks);

        // Build Report DTO
        EmployeeReportDto reportDto = new EmployeeReportDto();
        reportDto.setEmployeeId(employee.getId());
        reportDto.setEmployeeName(employee.getUsername());
        reportDto.setRole(employee.getRole());

        if (profile != null) {
            reportDto.setEmail(profile.getEmail());
            reportDto.setPhone(profile.getPhone());
        } else {
            reportDto.setEmail("N/A");
            reportDto.setPhone("N/A");
        }

        reportDto.setTasks(taskDtos);
        reportDto.setMetrics(metrics);

        // AI Summary
        String aiSummary = aiSummaryService.generateSummary(reportDto);
        reportDto.setAiSummary(aiSummary);

        // Generate PDF
        return pdfGenerator.generateEmployeeReportPdf(reportDto);
    }

    private EmployeeMetricsDto calculateMetrics(List<AssignedTask> tasks) {

        EmployeeMetricsDto metrics = new EmployeeMetricsDto();

        int total = tasks.size();
        int completed = 0;
        int active = 0;
        int overdue = 0;
        int onTime = 0;
        int late = 0;

        double totalCompletionDays = 0;
        int completionDaysCount = 0;

        LocalDate today = LocalDate.now();

        for (AssignedTask t : tasks) {

            String status = t.getStatus() != null ? t.getStatus() : "";

            if (status.equalsIgnoreCase("done")) {
                completed++;

                 if (t.getCreatedAt() != null && t.getCompletedAt() != null) {
                    try {
                        // ChronoUnit works with LocalDateTime too
                        long days = ChronoUnit.DAYS.between(t.getCreatedAt(), t.getCompletedAt());
                        totalCompletionDays += days;
                        completionDaysCount++;
                    } catch (Exception ignored) {}
                }

                // Deadline check
                if (t.getDeadline() != null && t.getCompletedAt() != null) {
                    try {
                        LocalDate deadline = t.getDeadline();
                        LocalDate completedDate = t.getCompletedAt().toLocalDate();

                        if (!completedDate.isAfter(deadline)) {
                            onTime++;
                        } else {
                            late++;
                        }
                    } catch (Exception ignored) {}
                }

            } else {
                active++;

                // overdue check
                if (t.getDeadline() != null) {
                    try {
                        if (t.getDeadline().isBefore(today)) {
                            overdue++;
                        }
                    } catch (Exception ignored) {}
                }
            }
        }

        metrics.setTotalAssigned(total);
        metrics.setCompleted(completed);
        metrics.setActive(active);
        metrics.setOverdue(overdue);
        metrics.setOnTimeCompleted(onTime);
        metrics.setLateCompleted(late);

        double completionRate = (total == 0) ? 0 : ((completed * 100.0) / total);
        metrics.setCompletionRate(completionRate);

        double avgCompletionDays = (completionDaysCount == 0) ? 0 : (totalCompletionDays / completionDaysCount);
        metrics.setAvgCompletionDays(avgCompletionDays);

        // Workload Score (simple logic)
        int workloadScore = (active * 2) + (overdue * 5);
        metrics.setWorkloadScore(workloadScore);

        return metrics;
    }
}