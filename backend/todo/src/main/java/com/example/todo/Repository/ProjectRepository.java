package com.example.todo.Repository;

import com.example.todo.ProjectEntity;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<ProjectEntity, Long> {
	 List<ProjectEntity> findByAssignedUsers_Id(String userId);
}