package com.example.todo.Controller;

import com.example.todo.Service.AdminAssistantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/gemini/admin-assistant")
public class AdminAssistantController {

    @Autowired
    private AdminAssistantService adminAssistantService;

    @PostMapping("/ask")
    public ResponseEntity<?> askAdminAssistant(@RequestBody Map<String, String> body, Authentication authentication) {

        
        String adminId = authentication.getName(); // not used now, but good for logging
        String question = body.get("question");
           if(question == null || question.trim().isEmpty()) {
        return ResponseEntity.badRequest().body(Map.of("error", "Question cannot be empty"));
    }

        String answer = adminAssistantService.ask(question);
         if(answer == null || answer.trim().isEmpty()) {
        answer = "No response generated. Please try again.";
    }

        return ResponseEntity.ok(Map.of("answer", answer));
    }
}