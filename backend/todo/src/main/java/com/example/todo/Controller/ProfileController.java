package com.example.todo.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.todo.Profile;
import com.example.todo.UserAuthentication;
import com.example.todo.Service.ProfileService;
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/profile")
public class ProfileController {
	
	@Autowired
	private ProfileService profileservice;
	

	@PostMapping("/register")
	public String register(@RequestBody Profile profile) {
		return profileservice.registerUser(profile);
	}
	
	@GetMapping("/managers")
	public List<UserAuthentication> getManagers() {
		return profileservice.allManagers();
	}
	
	@GetMapping("/employees")
	public List<UserAuthentication> getEmployees() {
		return profileservice.allEmployees();
	}
	
	@DeleteMapping("/user/{id}")
	public void deleteUser(@PathVariable String id) {
		profileservice.remove(id);
	}

	
	

}
