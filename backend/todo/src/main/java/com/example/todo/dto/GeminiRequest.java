package com.example.todo.dto;

import java.util.List;
import java.util.Map;

public class GeminiRequest {
	public String getNewPrompt() {
		return newPrompt;
	}
	public void setNewPrompt(String newPrompt) {
		this.newPrompt = newPrompt;
	}
	public List<Map<String, String>> getHistory() {
		return history;
	}
	public void setHistory(List<Map<String, String>> history) {
		this.history = history;
	}
	private String newPrompt;
    private List<Map<String, String>> history; 
    
}
