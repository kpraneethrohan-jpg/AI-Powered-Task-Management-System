package com.example.todo.dto;

public class GoogleMeetResponse {

    private String meetingId;
    private String meetingLink;

    public GoogleMeetResponse(String meetingId, String meetingLink) {
        this.meetingId = meetingId;
        this.meetingLink = meetingLink;
    }

    public String getMeetingId() {
        return meetingId;
    }

    public String getMeetingLink() {
        return meetingLink;
    }
}