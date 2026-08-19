package com.example.todo.dto;

public class IntentResult {
    private String intent;
    private Integer hours; // nullable
    
    public IntentResult() {}

    // 2. Add Parameterized Constructor (Fixes error in Service)
    public IntentResult(String intent, Integer hours) {
        this.intent = intent;
        this.hours = hours;
    }

    public String getIntent() {
        return intent;
    }
    public void setIntent(String intent) {
        this.intent = intent;
    }
    public Integer getHours() {
        return hours;
    }
    public void setHours(Integer hours) {
        this.hours = hours;
    }
}
