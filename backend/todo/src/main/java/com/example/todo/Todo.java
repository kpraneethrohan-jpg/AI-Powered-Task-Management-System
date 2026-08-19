package com.example.todo;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
@Entity
public class Todo {
	@Id
	private Long id;
	private String username;
	private String task;
	private boolean completed;
	
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getTask() {
		return task;
	}
	public void setTask(String task) {
		this.task = task;
	}
	public boolean isCompleted() {
		return completed;
	}
	public void setCompleted(boolean completed) {
		this.completed = completed;
	}
}

/*
⚙️ What happens behind the scenes:
Step	What Happens	                                       Who Helps
1️⃣	JSON is received	                                     by @RequestBody in @PostMapping

2️⃣	Jackson converts JSON → Java object	                     using setters in Todo.java

3️⃣	The Todo object is saved to DB	                         via todorepo.save(todo)

4️⃣	Later, you fetch it with /todo	                         calls todorepo.findAll()

5️⃣	Data from DB is returned as a list of Todo objects	

6️⃣	Jackson converts Java object → JSON	                     using getters in Todo.java

7️⃣	You see the response in JSON format in Insomnia or browser

*/








