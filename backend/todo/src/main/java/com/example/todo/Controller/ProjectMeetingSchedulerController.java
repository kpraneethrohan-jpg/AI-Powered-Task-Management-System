package com.example.todo.Controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.todo.AdminGoogleAuthEntity;
import com.example.todo.ProjectEntity;
import com.example.todo.ProjectMeetingEntity;
import com.example.todo.UserAuthentication;
import com.example.todo.Repository.*;
import com.example.todo.Service.GoogleMeetService;
import com.example.todo.dto.MeetingScheduleRequestDto;

@RestController
@RequestMapping("/meeting")
public class ProjectMeetingSchedulerController {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private AdminGoogleAuthRepository adminGoogleAuthRepo;

    @Autowired
    private ProjectRepository projectRepo;

    @Autowired
    private ProjectMeetingRepository meetingRepo;

    @Autowired
    private GoogleMeetService googleMeetService;

    // Connect Google
    @PostMapping("/connect-google/{projectId}")
    public ResponseEntity<?> generateOAuthUrl(Authentication authentication,  @PathVariable Long projectId) {

        String adminId = authentication.getName();

        UserAuthentication user = userRepo.findById(adminId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"admin".equals(user.getRole())) {
            return ResponseEntity.status(403)
                    .body("Only admin can connect Google");
        }

        Optional<AdminGoogleAuthEntity> authOpt =
                adminGoogleAuthRepo.findById(adminId);

        if (authOpt.isPresent() && authOpt.get().isConnected()) {
            return ResponseEntity.ok("Already Connected");
        }

        String url = googleMeetService.generateOAuthUrl(adminId, projectId);
        return ResponseEntity.ok(url);
    }

    //OAuth Callback
    @GetMapping("/oauth/callback")
public ResponseEntity<?> handleCallback(@RequestParam String code, @RequestParam String state) {
    try {
        String[] parts = state.split(":");
        String adminId = parts[0];
        String projectId = parts[1];
        googleMeetService.exchangeCodeForTokens(code, adminId);
        String redirectUrl = "http://localhost:3000/admin/projects/" + projectId + "?google=connected";
        // Redirect to your frontend app
         return ResponseEntity.status(302)
                .header("Location", redirectUrl)
                .build();
    } catch (Exception e) {
        return ResponseEntity.status(302)
                .header("Location", "http://localhost:3000/dashboard?error=google_failed")
                .build();
    }
}

    //Schedule Meeting
  @PostMapping("/schedule/{projectId}")
public ResponseEntity<?> scheduleMeeting(
        Authentication authentication,
        @PathVariable Long projectId,
        @RequestBody MeetingScheduleRequestDto requestDto
) {
    try {
        String adminId = authentication.getName();
        
        ProjectEntity project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        AdminGoogleAuthEntity googleAuth = adminGoogleAuthRepo.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Google not connected"));

        // --- UPDATED EMAIL EXTRACTION LOGIC ---
        // We get emails from the Profile associated with each User in the project
        List<String> attendeeEmails = project.getAssignedUsers().stream()
                .filter(user -> user.getProfile() != null) // Ensure profile exists
                .map(user -> user.getProfile().getEmail()) // Get email from profile
                .filter(email -> email != null && !email.isEmpty())
                .collect(Collectors.toList());

        // Call service with the extracted emails
        var meetResponse = googleMeetService.createMeetEvent(
                googleAuth, project, requestDto, attendeeEmails);

        // --- SAVE TO DATABASE ---
        ProjectMeetingEntity meeting = new ProjectMeetingEntity();
        meeting.setAdminId(adminId);
        meeting.setProjectId(projectId);
        meeting.setMeetingId(meetResponse.getMeetingId());
        meeting.setMeetingLink(meetResponse.getMeetingLink());
        meeting.setTitle(requestDto.getTitle());
        meeting.setDescription(requestDto.getDescription());
        meeting.setStartTime(requestDto.getStartTime());
        meeting.setEndTime(requestDto.getEndTime());

        meetingRepo.save(meeting);

        return ResponseEntity.ok(meetResponse.getMeetingLink());

    } catch (Exception e) {
        e.printStackTrace(); // Good for debugging
        return ResponseEntity.internalServerError().body("Meeting creation failed: " + e.getMessage());
    }
}
}