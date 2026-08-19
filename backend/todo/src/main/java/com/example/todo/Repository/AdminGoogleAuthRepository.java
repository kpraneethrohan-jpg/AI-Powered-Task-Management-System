package com.example.todo.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.todo.AdminGoogleAuthEntity;

@Repository
public interface AdminGoogleAuthRepository extends JpaRepository<AdminGoogleAuthEntity, String> {
    
}
