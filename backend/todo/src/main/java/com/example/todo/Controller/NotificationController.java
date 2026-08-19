package com.example.todo.Controller;

import com.example.todo.Notifications;
import com.example.todo.Service.NotificationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('manager') or hasRole('admin')")
    @GetMapping("/user/{userId}")
    public List<Notifications> getNotificationsByUserId(@PathVariable String userId) {
        return notificationService.getUserNotifications(userId);
    }
    
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('MANAGER') or hasRole('ADMIN')")
    @PostMapping("/mark-all-as-read/{userId}")
    public ResponseEntity<Void> markAllAsRead(@PathVariable String userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }
    
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('MANAGER') or hasRole('ADMIN')")
    @PostMapping("/mark-as-read/{notificationId}")
    public ResponseEntity<Void> markOneAsRead(@PathVariable Long notificationId) {
        notificationService.markOneAsRead(notificationId);
        return ResponseEntity.noContent().build();
    }
    
}
