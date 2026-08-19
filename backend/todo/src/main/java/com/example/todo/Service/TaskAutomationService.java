package com.example.todo.Service;

import com.example.todo.UnassignedTask;
import com.example.todo.Repository.UnassignedTaskRepository;
import com.example.todo.Repository.UserRepository;
import com.example.todo.config.AutomationTools;
import com.example.todo.dto.AutomationDto.*;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class TaskAutomationService {

    private final ChatClient chatClient;
    private final AutomationTools automationTools;

    @Autowired
    private UnassignedTaskRepository unassignedRepo;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AssignedTaskService assignedTaskService;

    public TaskAutomationService(ChatClient.Builder builder, AutomationTools automationTools) {
        this.automationTools = automationTools;
        this.chatClient = builder
                .defaultTools(automationTools) // Register the Tools
                .defaultSystem("""
                    You are an Autonomous Task Orchestrator. Your goal is to find the 3 most suitable employees for a given task.
                    
                    Your Workflow:
                    1. Use 'getSkillMatchScores' to see who has the technical skills for the task description.
                    2. For the top candidates returned, use 'getEmployeeWorkload' to see how many tasks they are currently handling.
                    3. Compare Skill Score vs. Workload.
                    4. Pick the top 3 and provide a 1-sentence reasoning for each.
                    
                    CRITICAL: Your final output for each task MUST be a JSON array of exactly 3 objects with keys: "employeeId", "score", and "reasoning".
                    Do not include any conversational text, only the JSON.
                    """)
                .build();
    }

    public AutomationResponse generateBulkSuggestions(List<TaskDraft> tasks) {
        Map<String, List<Recommendation>> suggestionsMap = new HashMap<>();

        for (TaskDraft draft : tasks) {
            // THE AGENTIC CALL: We don't call Python here. 
            // We give Gemini the description and let it decide which tools to call.
            List<Recommendation> agentPicks = chatClient.prompt()
                    .user(String.format("Task Name: %s. Description: %s. Find the top 3 candidates.", 
                          draft.taskName(), draft.description()))
                    .call()
                    .entity(new org.springframework.core.ParameterizedTypeReference<List<Recommendation>>() {});
            
            suggestionsMap.put(draft.id(), agentPicks);
        }
        return new AutomationResponse(suggestionsMap);
    }

    // ... (addToQueue, removeFromQueue, and finalizeAndSave remain the same)
    
    public UnassignedTask addToQueue(TaskDraft draft, String adminId) {
        var admin = userRepository.findById(adminId).get();
        UnassignedTask task = new UnassignedTask();
        task.setTaskname(draft.taskName());
        task.setDescription(draft.description());
        task.setPriority(draft.priority());
        task.setDeadline(draft.deadline());
        task.setCreatedBy(admin);
        return unassignedRepo.save(task);
    }

    public void finalizeAndSave(FinalAssignRequest request, String adminId) {
        assignedTaskService.assignAutomatedTask(request);
        if(request.tempId() != null) {
            unassignedRepo.deleteById(Long.parseLong(request.tempId()));
        }
    }

    public List<UnassignedTask> getQueue(String adminId) {
        return unassignedRepo.findByCreatedById(adminId);
    }

    public void removeFromQueue(Long id) {
        unassignedRepo.deleteById(id);
    }
}