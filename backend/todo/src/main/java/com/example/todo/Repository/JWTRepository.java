package com.example.todo.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;	
import org.springframework.stereotype.Repository;

import com.example.todo.UserAuthentication;

@Repository
public interface JWTRepository extends JpaRepository<UserAuthentication,String>{
	Optional<UserAuthentication> findById(String id);

}