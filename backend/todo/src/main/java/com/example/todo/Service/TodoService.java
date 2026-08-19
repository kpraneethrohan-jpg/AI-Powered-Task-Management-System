package com.example.todo.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.todo.Todo;
import com.example.todo.Repository.TodoRepository;

@Service
public class TodoService {
	
	@Autowired
	private TodoRepository todorepo;
	
	public List<Todo> getAllTodos(String username){
		return todorepo.findByUsername(username);
	}
	
	public List<Todo> saveTodoList(List<Todo> todo) {
		return todorepo.saveAll(todo);
	}
	
	public void deleteTodo(Long id) {
		todorepo.deleteById(id);
	}
	
	public Todo saveTodo(Todo todo) {
		return todorepo.save(todo);
	}

}
