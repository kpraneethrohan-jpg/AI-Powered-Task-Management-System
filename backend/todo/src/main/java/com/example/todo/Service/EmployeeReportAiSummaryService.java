package com.example.todo.Service;

import com.example.todo.dto.EmployeeReportDto;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class EmployeeReportAiSummaryService {

    private final ChatClient chatClient;

    public EmployeeReportAiSummaryService(ChatClient.Builder builder) {
        this.chatClient = builder
                .defaultSystem("""
You are an AI Employee Performance Report Generator for an organization.

You will receive employee performance metrics.
Your job is to generate a professional HR-style summary for a PDF report.

IMPORTANT OUTPUT RULES:
- Output MUST be plain text only (NO markdown).
- Do NOT use #, ##, ###, **, bullet points, or special symbols.
- Use only numbered headings exactly as given below.
- Each heading MUST have 2 to 5 sentences.
- Never leave a section empty. If data is missing, write "Not enough data available".
- Keep language formal and professional.

REQUIRED FORMAT (exactly this):

1. Overall Summary
<text>

2. Strengths
<text>

3. Weaknesses / Risks
<text>

4. Recommendations
<text>

5. Workload Status
<text>

CONTENT RULES:
- Mention completion rate clearly.
- Mention overdue task risk if overdue > 0.
- Mention on-time vs late completion comparison.
- If completed tasks are very low, mention inactivity or low productivity.
- Workload Status must classify as Low / Medium / High workload using workloadScore.
- Recommendations must be actionable (ex: prioritize overdue tasks, break down work, improve planning).

Do not mention JSON, tools, AI model, or internal implementation details.
""")
                .build();
    }

    public String generateSummary(EmployeeReportDto reportDto) {

       String prompt = """
Employee Performance Data:

Employee Name: %s
Employee ID: %s

Performance Metrics:
Total Assigned Tasks: %d
Completed Tasks: %d
Active Tasks: %d
Overdue Tasks: %d
On-Time Completed Tasks: %d
Late Completed Tasks: %d
Completion Rate: %.2f%%
Average Completion Days: %.2f
Workload Score: %d

Generate the report summary using the required format.
""".formatted(
        reportDto.getEmployeeName(),
        reportDto.getEmployeeId(),
        reportDto.getMetrics().getTotalAssigned(),
        reportDto.getMetrics().getCompleted(),
        reportDto.getMetrics().getActive(),
        reportDto.getMetrics().getOverdue(),
        reportDto.getMetrics().getOnTimeCompleted(),
        reportDto.getMetrics().getLateCompleted(),
        reportDto.getMetrics().getCompletionRate(),
        reportDto.getMetrics().getAvgCompletionDays(),
        reportDto.getMetrics().getWorkloadScore()
);

        try {
            String generatedSummary = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();
            if (generatedSummary != null && !generatedSummary.isBlank()) {
                return generatedSummary;
            }
        } catch (RuntimeException exception) {
            System.out.println("AI report summary unavailable; using local summary: "
                    + exception.getMessage());
        }

        return buildLocalSummary(reportDto);
    }

    private String buildLocalSummary(EmployeeReportDto reportDto) {
        var metrics = reportDto.getMetrics();
        String workload = metrics.getWorkloadScore() >= 10
                ? "High"
                : metrics.getWorkloadScore() >= 5 ? "Medium" : "Low";
        String completion = metrics.getTotalAssigned() == 0
                ? "No tasks have been assigned yet."
                : String.format("Completion rate is %.2f%% with %d of %d tasks completed.",
                        metrics.getCompletionRate(), metrics.getCompleted(), metrics.getTotalAssigned());
        String risks = metrics.getOverdue() > 0
                ? String.format("There are %d overdue active tasks requiring attention.", metrics.getOverdue())
                : "No overdue active tasks are currently recorded.";

        return "1. Overall Summary\n"
                + reportDto.getEmployeeName() + " currently has a " + workload + " workload. " + completion + "\n\n"
                + "2. Strengths\n"
                + String.format("The manager has completed %d tasks, including %d on time.",
                        metrics.getCompleted(), metrics.getOnTimeCompleted()) + "\n\n"
                + "3. Weaknesses / Risks\n"
                + risks + "\n\n"
                + "4. Recommendations\n"
                + (metrics.getOverdue() > 0
                        ? "Prioritize overdue tasks and review deadlines with the team."
                        : "Continue monitoring workload and maintain regular progress reviews.") + "\n\n"
                + "5. Workload Status\n"
                + "Workload is classified as " + workload + " based on the current workload score of "
                + metrics.getWorkloadScore() + ".";
    }
}