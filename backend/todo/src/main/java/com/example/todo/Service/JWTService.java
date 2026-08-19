package com.example.todo.Service;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.todo.UserAuthentication;
import com.example.todo.Repository.JWTRepository;

@Service
public class JWTService {

    @Autowired
    private JWTRepository jwtRepository;
    
    public Optional<UserAuthentication> authenticateCred(String id, String rawPassword) {
      
        Optional<UserAuthentication> userOptional = jwtRepository.findById(id);

        if (userOptional.isEmpty()) {
            return Optional.empty(); // User not found
        }

        UserAuthentication user = userOptional.get();

        if (rawPassword.equals(user.getPassword())) {
            return Optional.of(user); // Success
        }

        return Optional.empty(); // Password did not match
    }
}