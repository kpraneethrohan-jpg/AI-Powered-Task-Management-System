package com.example.todo;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "profile")
public class Profile {

    @Id
    private String id;  

    private String email;
    private String phone;

    @OneToOne
    @MapsId  // Tells JPA to use same ID as UserAuthentication
    @JoinColumn(name = "id")
    @JsonIgnore
    private UserAuthentication user;

    public String getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public UserAuthentication getUser() {
        return user;
    }

    public void setUser(UserAuthentication user) {
        this.user = user;
    }
}
