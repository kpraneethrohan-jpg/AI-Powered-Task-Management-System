package com.example.todo.Controller;

import com.example.todo.GeminiPromptRequest;
import com.example.todo.Service.GeminiService;

import lombok.Data;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequiredArgsConstructor
public class GeminiController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/api/gemini/ask")
    public String askGemini(@RequestBody GeminiPromptRequest request) {
        return geminiService.askGemini(request.getNewPrompt(), request.getHistory());
    }
}
