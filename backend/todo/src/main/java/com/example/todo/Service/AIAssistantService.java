package com.example.todo.Service;

import com.example.todo.AssignedTask;
import com.example.todo.Service.AssignedTaskService;
import com.example.todo.config.AiAssistantConfig;
import com.example.todo.dto.AIAssistantResponseDto;
import com.example.todo.dto.AiTaskRecommendation;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AIAssistantService {

    private final ChatClient chatClient;
    private final AiAssistantConfig.TaskTools taskTools;

    public AIAssistantService(ChatClient.Builder builder, AiAssistantConfig.TaskTools taskTools) {
        this.taskTools = taskTools;
        this.chatClient = builder
                .defaultSystem(
                        """
                                                    You are an intelligent Task Management Assistant that helps employees prioritize and manage their tasks effectively.

                                                    Your capabilities:
                                                    1. Use 'getTasks' to find tasks by specific criteria (manager, priority, deadline)
                                                    2. Use 'getWorkloadAdvice' to get task recommendations based on available time
                                                    3. Use 'getTasksByAssigner' to get tasks assigned TO YOU by a specific person
                                                    4. Analyze task data to provide smart recommendations
                                                    5. Explain your reasoning clearly and helpfully

                                                    CRITICAL INSTRUCTION FOR TASK LISTING:
                                                    When using getTasksByAssigner or any tool that returns multiple tasks:
                                                    - ALWAYS list EVERY SINGLE TASK returned by the tool
                                                    - NEVER summarize or pick just one task as an example
                                                    - Format each task with its name, description, deadline, priority, and status
                                                    - Use a numbered or bulleted list format
                                                    - If the tool returns 5 tasks, show all 5 tasks
                                                    - If the tool returns 10 tasks, show all 10 tasks
                                                    - Do not say "Here are some tasks" or "For example" - show ALL of them
                                                    - Count the tasks and explicitly state "Here are all X tasks assigned to you by [assigner]:"

                                                    CRITICAL RESPONSE FORMAT INSTRUCTION:

                                When returning tasks, recommendations, or workload advice:

                                You MUST return data in STRICT JSON format.

                                Never return markdown.
                                Never return paragraphs.
                                Never explain outside JSON.

                                Return ONLY valid JSON.

                                Format:

                                {
                                  "type": "task_recommendations",
                                  "tasks": [
                                    {
                                      "taskName": "",
                                      "description": "",
                                      "deadline": "",
                                      "priority": "",
                                      "status": "",
                                      "reasoning": ""
                                    }
                                  ]
                                }

                                Rules:
                                - Always include ALL tasks returned by tools
                                - Never summarize
                                - Never omit tasks
                                - Never add text before or after JSON
                                - Response must be machine-readable

                                For task listing:
                                Use type = "task_list"

                                For workload recommendation:
                                Use type = "task_recommendations"
                                Include reasoning for each task

                                If no tasks found:

                                {
                                  "type": "task_list",
                                  "tasks": []
                                }

                                                    When users ask for tasks assigned by someone:
                                                    - Use getTasksByAssigner to get tasks assigned TO THEM by that person
                                                    - Display ALL tasks found, not just a summary or one example
                                                    - List each task with its details (name, description, deadline, priority, status)
                                                    - If no tasks are found, clearly state that
                                                    - Format the response as a clear, numbered or bulleted list

                                                    When users ask about time-based task recommendations:
                                                    - Use getWorkloadAdvice with their available hours
                                                    - Analyze the returned tasks
                                                    - Explain WHY you recommend these specific tasks
                                                    - Consider priority levels, deadlines, and time constraints
                                                    - Be specific about your selection criteria

                                                    Always provide clear, actionable advice with reasoning.
                                                    """)
                .build();
    }

    public AIAssistantResponseDto handleUserMessage(String userId, String userMessage) {
        try {
            AiAssistantConfig.FOR_USER_ID.set(userId);

            return chatClient.prompt()
                    .user(userMessage)
                    .tools(taskTools)
                    .call()
                    .entity(AIAssistantResponseDto.class);
                  } catch (RuntimeException exception) {
                      System.out.println("AI task response unavailable; using local task list: "
                        + exception.getMessage());
                      return localTaskResponse(userId);
        } finally {
            AiAssistantConfig.FOR_USER_ID.remove();
        }
    }

                    private AIAssistantResponseDto localTaskResponse(String userId) {
                  List<AiTaskRecommendation> tasks = taskTools.getTasks(null, null, null).stream()
                    .map(task -> new AiTaskRecommendation(
                      task.getTaskname(),
                      task.getDescription(),
                      task.getDeadline() == null ? "" : task.getDeadline().toString(),
                      task.getPriority(),
                      task.getStatus(),
                      "Task details returned from your current task list."))
                    .toList();
                  return new AIAssistantResponseDto("task_list", tasks);
                    }
}