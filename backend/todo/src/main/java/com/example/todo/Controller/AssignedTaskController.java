package com.example.todo.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.todo.AssignedTask;
import com.example.todo.Service.AssignedTaskService;
import com.example.todo.Service.NotificationService;
import com.example.todo.dto.TaskCreateRequest;
import com.example.todo.dto.TaskDto;
import com.example.todo.UserAuthentication;
import com.example.todo.Repository.UserRepository;

@RestController
@RequestMapping("/assigntask")
public class AssignedTaskController {

    @Autowired
    private AssignedTaskService assignedtaskservice;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private NotificationService notificationService;
    
    @GetMapping("/projects/{projectId}/users/{userId}/tasks")
    public ResponseEntity<List<TaskDto>> getTasksForProjectAndUser(
            @PathVariable Long projectId,
            @PathVariable String userId) {
        List<TaskDto> tasks = assignedtaskservice.getTasksByProjectAndUser(projectId, userId);
        return ResponseEntity.ok(tasks);
    }
    
    // All tasks(Tasks assigned out of the project and also includes the tasks assigned in specific project)
    @GetMapping("/gettask/{assigneeId}")
    public ResponseEntity<List<TaskDto>> getTasks(@PathVariable String assigneeId) {
    	List<TaskDto> tasks = assignedtaskservice.getAllTasks(assigneeId);
    	return ResponseEntity.ok(tasks);
    }
    
    @GetMapping("/getincompletetask/{assigneeId}")
    public ResponseEntity<List<TaskDto>> getIncompleteTasks(@PathVariable String assigneeId) {
    	List<TaskDto> tasks = assignedtaskservice.getAllIncompleteTasks(assigneeId);
    	return ResponseEntity.ok(tasks);
    }
    
    @PostMapping("/projects/{projectId}/tasks")
    public ResponseEntity<AssignedTask> createTaskForProject(
            @PathVariable Long projectId,
            Authentication authentication,
            @RequestBody TaskCreateRequest taskRequest) {
    	String assignerId= authentication.getName();
        AssignedTask createdTask = assignedtaskservice.createTask(taskRequest, assignerId, projectId);
        return ResponseEntity.ok(createdTask);
    }

    // Assign Task + Send Notification to Assignee
    @PostMapping("/assign/{assigneeId}")
    public ResponseEntity<String> assignTask(
        @PathVariable String assigneeId,
        Authentication authentication,
        @RequestBody AssignedTask assignedtask) {
    	String assignerId = authentication.getName();

        UserAuthentication assignee = userRepo.findById(assigneeId).orElse(null);
        UserAuthentication assigner = userRepo.findById(assignerId).orElse(null);

        if (assignee == null || assigner == null) {
            return ResponseEntity.badRequest().body("Assignee or Assigner not found.");
        }

        assignedtask.setAssignee(assignee);
        assignedtask.setAssignedBy(assigner);
        assignedtaskservice.storeAssignedTask(assignedtask);

        notificationService.sendNotification(
            assigner.getId(),
            assignee.getId(),
            "You have been assigned a new task: " + assignedtask.getTaskname()
        );

        return ResponseEntity.ok("Task assigned successfully.");
    }

    
    @PutMapping("/updateStatus")
    public void updateStatus(@RequestBody Map<String, String> data,  Authentication authentication) {
        Long taskId = Long.parseLong(data.get("taskId"));
        String status = data.get("status");
        String updatedByUserId = authentication.getName();

        assignedtaskservice.updateStatus(taskId, status, updatedByUserId);

        
//        AssignedTask task = assignedtaskservice.getTaskById(taskId);
//
//        if (task != null && task.getAssignedBy() != null) {
//            String senderId = task.getAssignee().getId();
//            String receiverId = task.getAssignedBy().getId();
//
//            notificationService.sendNotification(
//                senderId,
//                receiverId,
//                "Task '" + task.getTaskname() + "' marked as '" + status + "'"
//            );
//        }
    }

 
    @DeleteMapping("/deleteTask/{id}")
    public ResponseEntity<String> deleteAssignedTask(@PathVariable Long id) {
        assignedtaskservice.deleteTaskById(id);
        return ResponseEntity.ok("Task deleted successfully");
    }

    
    @PutMapping("/updateTask/{id}")
    public ResponseEntity<String> updateTask(@RequestBody AssignedTask updatedTask) {
        assignedtaskservice.updateTask(updatedTask);
        return ResponseEntity.ok("Task updated successfully");
    }

   
    @GetMapping("/totalSummary")
    public List<Integer> totalSummary() {
        return assignedtaskservice.fetchTotalSummary();
    }

    
    @GetMapping("/totalEmployeeSummary")
    public List<Integer> totalEmployeeSummary() {
        return assignedtaskservice.fetchTotalEmployeeSummary();
    }

 
    @GetMapping("/totalManagerSummary")
    public List<Integer> totalManagerSummary() {
        return assignedtaskservice.fetchTotalManagerSummary();
    }
}
