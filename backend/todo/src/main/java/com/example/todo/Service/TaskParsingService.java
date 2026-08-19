package com.example.todo.Service;

import java.time.LocalDate;

import com.example.todo.dto.TaskParseDto.ParseResponse;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class TaskParsingService {

    private final ChatClient chatClient;

    public TaskParsingService(ChatClient.Builder builder) {
        this.chatClient = builder
                .defaultSystem(
                        """
                                You are an AI Task Creation Assistant.

                                Your job is to convert a user's natural language sentence into a professional task.

                                Return ONLY valid JSON in the following format:

                                {
                                  "taskName": "...",
                                  "description": "...",
                                  "priority": "Low|Medium|High",
                                  "deadline": "YYYY-MM-DD"
                                }

                                Rules:
                                1. taskName must be a short professional title (max 6 words).
                                2. description must be detailed and professional (2-3 sentences).
                                3. Do NOT repeat the input sentence directly.
                                4. If employeeId or employee name is mentioned, do NOT include it in taskName.
                                5. If priority is not mentioned, default to Medium.
                                6. If deadline is not mentioned, return empty string "".
                                7. If deadline is relative like "Friday", convert it using today's date.
                                8. Task description must include what needs to be done + expected outcome.

                                Examples:

                                Input: "Assign login API task to employee e1 urgent"
                                Output:
                                {
                                  "taskName": "Login API Development",
                                  "description": "Develop the login REST API with authentication and validation. Ensure secure token generation and proper error handling for invalid credentials.",
                                  "priority": "High",
                                  "deadline": ""
                                }

                                Input: "Fix UI bug in dashboard low priority"
                                Output:
                                {
                                  "taskName": "Dashboard UI Bug Fix",
                                  "description": "Identify and resolve the UI issue occurring in the dashboard view. Verify responsiveness and ensure layout consistency across devices.",
                                  "priority": "Low",
                                  "deadline": ""
                                }

                                Do not output anything except JSON.
                                """)
                .build();
    }

    public ParseResponse parseTask(String inputText) {

        String today = LocalDate.now().toString();

        String prompt = """
                Today date is: %s.

                Convert the following sentence into a professional task title and detailed description.

                Sentence: "%s"
                """.formatted(today, inputText);

        return chatClient.prompt()
                .user(prompt)
                .call()
                .entity(ParseResponse.class);
    }
}