package com.example.todo;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;


@Entity
public class TaskComments {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long commentId;
	private Long taskId;
	private String userId;
	private String content;
	private LocalDateTime timestamp;
	public Long getCommentId() {
		return commentId;
	}	
	public void setCommentId(Long commentId) {
		this.commentId = commentId;
	}
	public Long getTaskId() {
		return taskId;
	}
	public void setTaskId(Long taskId) {
		this.taskId = taskId;
	}
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	public String getContent() {
		return content;
	}
	public void setContent(String content) {
		this.content = content;
	}
	public LocalDateTime getTimestamp() {
		return timestamp;
	}
	public void setTimestamp(LocalDateTime timestamp) {
		this.timestamp = timestamp;
	}
	
	
}
