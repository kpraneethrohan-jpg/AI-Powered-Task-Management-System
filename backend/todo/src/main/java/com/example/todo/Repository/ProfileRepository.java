package com.example.todo.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.todo.Profile;
import com.example.todo.UserAuthentication;

@Repository
public interface ProfileRepository extends JpaRepository<Profile,String>{
	
	

}
