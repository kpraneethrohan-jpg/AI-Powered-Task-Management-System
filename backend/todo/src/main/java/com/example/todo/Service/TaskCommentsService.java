package com.example.todo.Service;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.example.todo.AssignedTask;
import com.example.todo.CommentReadStatus;
import com.example.todo.TaskComments;
import com.example.todo.Repository.AssignedTaskRepository;
import com.example.todo.Repository.CommentReadStatusRepository;
import com.example.todo.Repository.TaskCommentsRepository;

@Service
public class TaskCommentsService {

    @Autowired
    private TaskCommentsRepository taskcommentsrepo;

    @Autowired
    private CommentReadStatusRepository commentReadStatusRepo;

    @Autowired
    private AssignedTaskRepository assignedTaskRepo;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public List<TaskComments> getAllComments(Long taskId) {
        return taskcommentsrepo.findByTaskId(taskId);
    }

    public void addComment(TaskComments comment) {
        // Save the comment
        taskcommentsrepo.save(comment);

        // Determine recipients (who should be notified)
        List<String> recipients = getRecipientsForTask(comment.getTaskId(), comment.getUserId());

        for (String receiver : recipients) {
            // Save unread status
            CommentReadStatus status = new CommentReadStatus();
            status.setCommentId(comment.getCommentId());
            status.setUserId(receiver);
            status.setRead(false);
            commentReadStatusRepo.save(status);

            //  Send WebSocket comment notification
            Optional<AssignedTask> taskOpt = assignedTaskRepo.findById(comment.getTaskId());
            if (taskOpt.isPresent()) {
                AssignedTask task = taskOpt.get();

                Map<String, Object> notification = new HashMap<>();
                notification.put("type", "comment");
                notification.put("message", comment.getUserId() + " commented on task '" + task.getTaskname() + "'");
                notification.put("taskId", task.getTaskId());
                notification.put("fromUser", comment.getUserId());

                messagingTemplate.convertAndSend("/topic/user/" + receiver, notification);
            }
        }
    }

    public void markCommentsAsReadForTask(Long taskId, String userId) {
        List<TaskComments> comments = taskcommentsrepo.findByTaskId(taskId);
        for (TaskComments c : comments) {
            List<CommentReadStatus> entries = commentReadStatusRepo.findByCommentIdAndUserId(c.getCommentId(), userId);
            for (CommentReadStatus entry : entries) {
                if (!entry.isRead()) {
                    entry.setRead(true);
                    commentReadStatusRepo.save(entry);
                }
            }
        }
    }

    public Map<Long, Boolean> getUnreadCommentMap(String userId) {
        System.out.println("Fetching unread comment map for userId: " + userId);
        List<CommentReadStatus> unreadStatuses = commentReadStatusRepo.findByUserIdAndIsReadFalse(userId);
        Map<Long, Boolean> unreadMap = new HashMap<>();

        for (CommentReadStatus status : unreadStatuses) {
            Optional<TaskComments> comment = taskcommentsrepo.findById(status.getCommentId());
            comment.ifPresent(c -> unreadMap.put(c.getTaskId(), true));
        }

        return unreadMap;
    }

    public List<String> getRecipientsForTask(Long taskId, String senderId) {
        Optional<AssignedTask> optionalTask = assignedTaskRepo.findById(taskId);
        if (optionalTask.isEmpty()) return List.of();

        AssignedTask task = optionalTask.get();
        String assignerId = task.getAssignedBy().getId();
        String assigneeId = task.getAssignee().getId();

        if (senderId.equals(assignerId)) {
            return List.of(assigneeId); // Admin/Manager is commenting → notify employee
        } else if (senderId.equals(assigneeId)) {
            return List.of(assignerId); // Employee is commenting → notify admin/manager
        }

        return List.of(); // No valid recipient
    }
}
