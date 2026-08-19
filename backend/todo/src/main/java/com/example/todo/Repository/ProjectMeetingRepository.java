package com.example.todo.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.todo.ProjectMeetingEntity;

@Repository
public interface ProjectMeetingRepository extends JpaRepository<ProjectMeetingEntity, Long> {
    
}
