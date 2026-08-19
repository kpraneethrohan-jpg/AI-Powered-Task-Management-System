package com.example.todo.dto;

// This is a plain Java Object (POJO), NOT a database entity.
// It simply models the JSON sent from the React login form.
public class UserLoginRequest {

    private String id;
    private String password;
    private String role;

    // --- Standard Getters and Setters ---

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}