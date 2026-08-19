//package com.example.todo.Controller;
//
//import java.util.List;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.CrossOrigin;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.RestController;
//
//import com.example.todo.UserAuthentication;
//import com.example.todo.Repository.UserRepository;
//import com.example.todo.Service.UserService;
//import com.example.todo.dto.UserLoginRequest;
//@CrossOrigin(origins = "http://localhost:3000")
//@RestController
//@RequestMapping("/user")
//public class UserController {
//	@Autowired
//	private UserService userservice;
//	@Autowired
//	private UserRepository userRepository;
//	
//	
//	@PostMapping("/register")
//	public String register(@RequestBody UserAuthentication user) {
//	    // Jackson converts JSON → UserAuthentication object
//		userservice.registerUser(user);
//		return "Registered successfully";
//	}
//
//	 @PostMapping("/login")
//	    public ResponseEntity<?> loginUser(@RequestBody UserLoginRequest loginRequest) {
//	        // You probably have a service method that checks credentials
//	        // and returns the authenticated user or throws an exception.
//	        try {
//	            UserAuthentication authenticatedUser = userservice.verifyUser(
//	                loginRequest.getId(),
//	                loginRequest.getPassword(),
//	                loginRequest.getRole()
//	            );
//	            
//	            // IF a user is found and password matches:
//	            // Instead of returning a string...
//	            // return ResponseEntity.ok("Login successful");
//	            
//	            // ...RETURN THE FULL USER OBJECT.
//	            // Jackson will automatically convert this to JSON, excluding the password
//	            // if you have @JsonIgnore on the password field in your entity.
//	            return ResponseEntity.ok(authenticatedUser);
//
//	        } catch (RuntimeException e) {
//	            // If authentication fails (user not found, password mismatch),
//	            // return a proper error response.
//	            return ResponseEntity.badRequest().body("Login failed. Invalid credentials.");
//	        }
//	    }
//	
//	@GetMapping("/all")
//	public ResponseEntity<List<UserAuthentication>> getAllUsers() {
//	    return ResponseEntity.ok(userRepository.findAll());
//	}
//	
//	
//
//}