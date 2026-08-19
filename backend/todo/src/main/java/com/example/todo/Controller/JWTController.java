package com.example.todo.Controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.todo.UserAuthentication;
import com.example.todo.Repository.UserRepository;
import com.example.todo.Service.JWTService;
import com.example.todo.Service.UserService;
import com.example.todo.dto.LoginRequestDto;
import com.example.todo.dto.LoginResponseDto;
import com.example.todo.util.JWTUtil;
@CrossOrigin(origins = "/*")
@RestController
@RequestMapping("/user")
public class JWTController {
	
	@Autowired 
	private JWTService jwtservice;
	
	@Autowired
	private JWTUtil jwtUtil;
	
	@Autowired
	private UserService userservice;
	
	@Autowired
	private UserRepository userRepository;
	
	@PostMapping("/register")
	public String register(@RequestBody UserAuthentication user) {
	    // Jackson converts JSON → UserAuthentication object
		userservice.registerUser(user);
		return "Registered successfully";
	}
	
	@PostMapping("/login")
	public ResponseEntity<?> getCredentials( @RequestBody LoginRequestDto login) {
		 Optional<UserAuthentication> userOptional=jwtservice.authenticateCred(login.getUserId(),login.getPassword());
		 if (userOptional.isPresent()) {
	            // If successful, get the user details retrieved from the database.
	            UserAuthentication userDetails = userOptional.get();

	            final String token = jwtUtil.generateToken(
	                userDetails.getId(),
	                userDetails.getUsername(), 
	                userDetails.getRole()
	            );

	 
	            return ResponseEntity.ok(new LoginResponseDto(token));
	        } 
		 else {
	            // If authentication fails, return a 401 Unauthorized status with an error message.
	            return ResponseEntity
	                    .status(HttpStatus.UNAUTHORIZED)
	                    .body("Invalid username or password");
	        }
	}
	
	@GetMapping("/all")
	public ResponseEntity<List<UserAuthentication>> getAllUsers() {
	    return ResponseEntity.ok(userRepository.findAll());
	}
	
}
