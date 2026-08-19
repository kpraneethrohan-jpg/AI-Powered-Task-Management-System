package com.example.todo.Repository;

import com.example.todo.UnassignedTask;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UnassignedTaskRepository extends JpaRepository<UnassignedTask, Long> {
    List<UnassignedTask> findByCreatedById(String adminId);
}