package com.example.todo.Controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import com.example.todo.UnassignedTask;
import com.example.todo.Service.SkillMatchService;
import com.example.todo.Service.TaskAutomationService;
import com.example.todo.dto.AutomationDto;
import com.example.todo.dto.AutomationDto.AutomationResponse;
import com.example.todo.dto.AutomationDto.BulkAutomationRequest;
import com.example.todo.Service.TaskParsingService;
import com.example.todo.dto.RecommendationDto;
import com.example.todo.dto.TaskParseDto;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/gemini/automation")
public class TaskAutomationController {

    @Autowired
    private TaskAutomationService automationService;

    @Autowired
    private TaskParsingService taskParsingService;

    @PostMapping("/add-to-queue")
    public ResponseEntity<UnassignedTask> addToQueue(
            @RequestBody AutomationDto.TaskDraft draft, 
            Authentication authentication) {
        
        String adminId = authentication.getName(); // Same as your other controller
        return ResponseEntity.ok(automationService.addToQueue(draft, adminId));
    }

    @GetMapping("/get-queue")
    public ResponseEntity<List<UnassignedTask>> getQueue(Authentication authentication) {
        String adminId = authentication.getName();
        return ResponseEntity.ok(automationService.getQueue(adminId));
    }

    @PostMapping("/finalize-assign")
    public ResponseEntity<String> finalizeAssign(
            @RequestBody AutomationDto.FinalAssignRequest request, 
            Authentication authentication) {
        
        String adminId = authentication.getName();
        automationService.finalizeAndSave(request, adminId);
        return ResponseEntity.ok("Task assigned successfully");
    }

    // suggest-multi and delete don't need authentication object, but still need token
    @PostMapping("/suggest-multi")
    public AutomationResponse suggestMulti(@RequestBody BulkAutomationRequest request) {
        return automationService.generateBulkSuggestions(request.tasks());
    }

   @PostMapping("/parse-task")
public ResponseEntity<?> parseTask(@RequestBody TaskParseDto.ParseRequest request) {
    return ResponseEntity.ok(taskParsingService.parseTask(request.text()));
}

    @DeleteMapping("/queue/{id}")
    public ResponseEntity<Void> removeFromQueue(@PathVariable Long id) {
        automationService.removeFromQueue(id);
        return ResponseEntity.ok().build();
    }
}