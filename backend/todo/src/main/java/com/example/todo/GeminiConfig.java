// package com.example.todo;

// import com.google.genai.Client;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;

// @Configuration
// public class GeminiConfig {
    
//     @Bean
//     public Client GeminiClient(@Value("${spring.ai.google.genai.api-key}") String apiKey) {
//         // This will read the API key from application.properties
//         return new Client(apiKey);
//     }
// }