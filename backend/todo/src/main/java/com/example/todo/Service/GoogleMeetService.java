package com.example.todo.Service;

import com.example.todo.AdminGoogleAuthEntity;
import com.example.todo.ProjectEntity;
import com.example.todo.Repository.AdminGoogleAuthRepository;
import com.example.todo.dto.GoogleMeetResponse;
import com.example.todo.dto.MeetingScheduleRequestDto;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleRefreshTokenRequest;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GoogleMeetService {

    @Value("${google.client.id}")
    private String CLIENT_ID;

    @Value("${google.client.secret}")
    private String CLIENT_SECRET;

    @Value("${google.redirect.uri}")
    private String REDIRECT_URI;

    @Value("${google.scope}")
    private String SCOPE;

    @Autowired
    private AdminGoogleAuthRepository adminGoogleAuthRepo;

    private static final String APPLICATION_NAME = "Task Management System";
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    /**
     * 1. Generate OAuth URL for Admin Login
     */
    public String generateOAuthUrl(String adminId, Long projectId) {
        return "https://accounts.google.com/o/oauth2/v2/auth?" +
                "client_id=" + CLIENT_ID +
                "&redirect_uri=" + REDIRECT_URI +
                "&response_type=code" +
                "&scope=" + SCOPE +
                "&access_type=offline" +
                "&prompt=consent" +
                 "&state=" + adminId + ":" + projectId;
    }

    /**
     * 2. Exchange Authorization Code for Tokens
     */
    public void exchangeCodeForTokens(String code, String adminId) throws Exception {
        NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();

        TokenResponse response = new GoogleAuthorizationCodeTokenRequest(
                HTTP_TRANSPORT,
                JSON_FACTORY,
                "https://oauth2.googleapis.com/token",
                CLIENT_ID,
                CLIENT_SECRET,
                code,
                REDIRECT_URI)
                .execute();

        AdminGoogleAuthEntity auth = adminGoogleAuthRepo.findById(adminId)
                .orElse(new AdminGoogleAuthEntity());

        auth.setAdminId(adminId);
        auth.setConnected(true);
        
        // Refresh token is only sent the first time the user consents
        if (response.getRefreshToken() != null) {
            auth.setRefreshToken(response.getRefreshToken());
        }

        adminGoogleAuthRepo.save(auth);
    }

    /**
     * 3. Create Google Meet Event and Notify Attendees
     */
    public GoogleMeetResponse createMeetEvent(
            AdminGoogleAuthEntity googleAuth,
            ProjectEntity project,
            MeetingScheduleRequestDto requestDto,
            List<String> attendeeEmails // List of emails fetched from Profiles in the Controller
    ) throws GeneralSecurityException, IOException {

        // A. Get a fresh Access Token
        String accessToken = refreshAccessToken(googleAuth.getRefreshToken());

        final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();

        // B. Build Calendar Service
        Calendar service = new Calendar.Builder(HTTP_TRANSPORT, JSON_FACTORY, null)
                .setApplicationName(APPLICATION_NAME)
                .setHttpRequestInitializer(request -> {
                    request.getHeaders().setAuthorization("Bearer " + accessToken);
                }).build();

        // C. Define Event Details
        Event event = new Event()
                .setSummary(requestDto.getTitle())
                .setDescription("Project: " + project.getName() + "\n" + requestDto.getDescription());

        // D. Convert LocalDateTime to Google DateTime
        DateTime startDateTime = new DateTime(requestDto.getStartTime()
                .atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());
        event.setStart(new EventDateTime().setDateTime(startDateTime).setTimeZone("Asia/Kolkata"));

        DateTime endDateTime = new DateTime(requestDto.getEndTime()
                .atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());
        event.setEnd(new EventDateTime().setDateTime(endDateTime).setTimeZone("Asia/Kolkata"));

        // E. ADD ATTENDEES (Employees)
        if (attendeeEmails != null && !attendeeEmails.isEmpty()) {
            List<EventAttendee> attendees = attendeeEmails.stream()
                    .map(email -> new EventAttendee().setEmail(email))
                    .collect(Collectors.toList());
            event.setAttendees(attendees);
        }

        // F. CONFIGURE GOOGLE MEET LINK GENERATION
        ConferenceData conferenceData = new ConferenceData();
        CreateConferenceRequest createConferenceRequest = new CreateConferenceRequest();
        createConferenceRequest.setRequestId(UUID.randomUUID().toString());

        ConferenceSolutionKey solutionKey = new ConferenceSolutionKey();
        solutionKey.setType("hangoutsMeet");

        createConferenceRequest.setConferenceSolutionKey(solutionKey);
        conferenceData.setCreateRequest(createConferenceRequest);
        event.setConferenceData(conferenceData);

        // G. INSERT EVENT
        // setConferenceDataVersion(1) is required to generate the Meet Link
        // setSendUpdates("all") triggers the automated notification emails
        Event createdEvent = service.events()
                .insert("primary", event)
                .setConferenceDataVersion(1)
                .setSendUpdates("all") 
                .execute();

        // H. Return Meeting ID and the clickable Hangout Link
        return new GoogleMeetResponse(
                createdEvent.getId(),
                createdEvent.getHangoutLink()
        );
    }

    /**
     * 4. Refresh Access Token using stored Refresh Token
     */
    private String refreshAccessToken(String refreshToken) throws IOException {
        try {
            NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
            
            TokenResponse response = new GoogleRefreshTokenRequest(
                    HTTP_TRANSPORT,
                    JSON_FACTORY,
                    refreshToken,
                    CLIENT_ID,
                    CLIENT_SECRET)
                    .execute();

            return response.getAccessToken();
        } catch (GeneralSecurityException e) {
            throw new IOException("Security exception during token refresh", e);
        }
    }
}