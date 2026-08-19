package com.example.todo;

import jakarta.persistence.*;
import java.time.LocalDateTime;


@Entity
@Table(name = "notifications")
public class Notifications {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String senderId;     
    private String receiverId;  
    private String message;    
    @Column(name = "is_read") 
    private boolean isRead = false; 


    private LocalDateTime timestamp; 

    public Notifications() {
        this.timestamp = LocalDateTime.now();
    }

    public Notifications(String senderId, String receiverId, String message) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.message = message;
        this.isRead = false;
        this.timestamp = LocalDateTime.now();
    }

    

    public Long getId() {
        return id;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(String receiverId) {
        this.receiverId = receiverId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
    
    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean isRead) {
        this.isRead = isRead;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
