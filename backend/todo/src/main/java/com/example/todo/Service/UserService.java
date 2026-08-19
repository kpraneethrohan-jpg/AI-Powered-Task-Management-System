package com.example.todo.Service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.todo.UserAuthentication;
import com.example.todo.Repository.UserRepository;

@Service
public class UserService {
	
	@Autowired
	private UserRepository userrepo;
	
public UserAuthentication verifyUser(String id, String password, String role) {
		
        // Find the user by their unique ID and role first.
        // NOTE: It is a major security risk to query by password. This should be changed later.
		Optional<UserAuthentication> userOpt = userrepo.findByIdAndPasswordAndRole(id,password, role);

		if (userOpt.isPresent()) {
            // If the user exists, now check if the password matches.
            UserAuthentication user = userOpt.get();
            if (user.getPassword().equals(password)) {
                // Passwords match, authentication is successful.
                // Return the full user object.
                return user;
            }
        }
		
        // If the user was not found, or if the password did not match,
        // throw an exception. The controller will catch this.
		throw new RuntimeException("Invalid credentials or user not found.");
	}
	public void registerUser(UserAuthentication user) {
		userrepo.save(user);
	}
	
	

}
