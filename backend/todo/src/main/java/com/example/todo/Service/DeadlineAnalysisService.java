package com.example.todo.Service;

import com.example.todo.AssignedTask;
import com.example.todo.dto.DeadlineTaskDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class DeadlineAnalysisService {

    @Autowired
    private AssignedTaskService assignedTaskService;

    public List<DeadlineTaskDto> getOverdueTasks() {

        LocalDate today = LocalDate.now();
        List<AssignedTask> tasks = assignedTaskService.getAllActiveTasks();

        List<DeadlineTaskDto> result = new ArrayList<>();

        for (AssignedTask t : tasks) {
            if (t.getDeadline() == null) continue;

            try {
                LocalDate deadline = t.getDeadline();

                if (deadline.isBefore(today)) {
                    result.add(mapTask(t));
                }

            } catch (Exception ignored) {}
        }

        return result;
    }

    public List<DeadlineTaskDto> getTasksDueInDays(int days) {

        LocalDate today = LocalDate.now();
        LocalDate limit = today.plusDays(days);

        List<AssignedTask> tasks = assignedTaskService.getAllActiveTasks();
        List<DeadlineTaskDto> result = new ArrayList<>();

        for (AssignedTask t : tasks) {
            if (t.getDeadline() == null) continue;

            try {
                LocalDate deadline = t.getDeadline();

                if (!deadline.isBefore(today) && !deadline.isAfter(limit)) {
                    result.add(mapTask(t));
                }

            } catch (Exception ignored) {}
        }

        return result;
    }

    private DeadlineTaskDto mapTask(AssignedTask t) {

        String assigneeId = null;
        String assigneeName = null;

        if (t.getAssignee() != null) {
            assigneeId = t.getAssignee().getId();
            assigneeName = t.getAssignee().getUsername();
        }

        String projectName = null;
        if (t.getProject() != null) {
            projectName = t.getProject().getName();
        }

        return new DeadlineTaskDto(
                t.getTaskId(),
                t.getTaskname(),
                t.getDeadline(),
                t.getPriority(),
                assigneeId,
                assigneeName,
                projectName
        );
    }
}