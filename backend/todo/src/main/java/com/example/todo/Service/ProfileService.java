package com.example.todo.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.todo.Profile;
import com.example.todo.UserAuthentication;
import com.example.todo.Repository.ProfileRepository;
import com.example.todo.Repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class ProfileService {
	
	@Autowired
	private ProfileRepository profilerepo;
	
	@Autowired
	private UserRepository userrepo;
	
	public String registerUser(Profile profile) {
		profilerepo.save(profile);
		return "Registered successfully";
	}
	
	public List<UserAuthentication> allManagers() {
		return userrepo.findByRole("manager");
	}
	
	public List<UserAuthentication> allEmployees() {
		return userrepo.findByRole("employee");
	}
	
	@Transactional
	public void remove(String id) {
		profilerepo.deleteById(id);
		userrepo.deleteById(id);
	}

}
