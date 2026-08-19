package com.example.todo.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.todo.Todo;
import com.example.todo.Service.TodoService;
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/todo")
public class TodoController {

    @Autowired
    private TodoService todoser;

    @GetMapping("/todo")
    public List<Todo> getTodos(@RequestParam String username) {
        return todoser.getAllTodos(username);
    }

    
    @PostMapping("/addTodo")
    public void save(@RequestBody List<Todo> todo) {
    	todoser.saveTodoList(todo);
    }
    
    @PostMapping("/deleteTodoList")
    public void removeTodo(@RequestBody Long id) {
        todoser.deleteTodo(id);
    }
    
    @PostMapping("/updateTodoList")
    public void update(@RequestBody Todo todo) {
    	todoser.saveTodo(todo);
    }

}
