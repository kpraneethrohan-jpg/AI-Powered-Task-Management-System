package com.example.todo.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.todo.UserAuthentication;
@Repository
public interface UserRepository extends JpaRepository<UserAuthentication,String> {
	Optional<UserAuthentication> findByIdAndPasswordAndRole(String id,String password, String role);
	public List<UserAuthentication> findByRole(String role);
	public List<UserAuthentication> findByUsername(String username);

}


