package com.example.todo.Controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.todo.TaskComments;
import com.example.todo.Service.TaskCommentsService;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/comments")
public class TaskCommentsController {

    @Autowired
    private TaskCommentsService taskcommentsservice;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

   
    @GetMapping("/view/{taskId}/{userId}")
    public List<TaskComments> viewAndMarkRead(@PathVariable Long taskId, @PathVariable String userId) {
        taskcommentsservice.markCommentsAsReadForTask(taskId, userId);
        return taskcommentsservice.getAllComments(taskId);
    }

   
    @PostMapping("/add")
    public void add(@RequestBody TaskComments comment) {
     
        taskcommentsservice.addComment(comment);

        
        List<String> recipients = taskcommentsservice.getRecipientsForTask(comment.getTaskId(), comment.getUserId());

        for (String receiverId : recipients) {
        	Map<String, Object> notification = new HashMap<>();
        	notification.put("senderId", comment.getUserId()); 
        	notification.put("receiverId", receiverId);        
        	notification.put("message", "🗨️ New comment on Task ID: " + comment.getTaskId());
        	notification.put("timestamp", LocalDateTime.now().toString());
            messagingTemplate.convertAndSend("/topic/user/" + receiverId, notification);
        }

       
        messagingTemplate.convertAndSend("/topic/comments/" + comment.getTaskId(), comment);
    }

    
//    @GetMapping("/unread-map/{userId}")
//    public Map<Long, Boolean> getUnreadComments(@PathVariable String userId) {
//        return taskcommentsservice.getUnreadCommentMap(userId);
//    }

	@GetMapping("/unread-map")
	public Map<Long, Boolean> getUnreadComments(Authentication authentication) {
		String userId= authentication.getName();
		return taskcommentsservice.getUnreadCommentMap(userId);
	}
}
