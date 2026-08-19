package com.example.todo.Service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {
    
    private final ChatClient chatClient;

    public GeminiService(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    public String askGemini(String newPrompt, List<Map<String, String>> historyData) {
        List<Message> messages = new ArrayList<>();
        
        // Build conversation history
        if (historyData != null) {
            for (Map<String, String> message : historyData) {
                String role = message.get("role");
                String text = message.get("text");

                if ("user".equals(role)) {
                    messages.add(new UserMessage(text));
                } else if ("model".equals(role) || "assistant".equals(role)) {
                    messages.add(new AssistantMessage(text));
                }
            }
        }
        
        // Add the new user message
        messages.add(new UserMessage(newPrompt));

        // Call OpenAI
        return chatClient.prompt(new Prompt(messages))
                .call()
                .content();
    }
}