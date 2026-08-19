package com.example.todo.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.todo.FileEntity;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {
	 // 1. Look for the 'task' property in FileEntity.
     // 2. Then, look for the 'taskId' property inside that 'task' object.
	List<FileEntity> findByTaskTaskId(Long taskId);
}