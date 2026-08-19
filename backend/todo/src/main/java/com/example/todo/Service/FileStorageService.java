package com.example.todo.Service;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.todo.AssignedTask;
import com.example.todo.FileEntity;
import com.example.todo.Repository.AssignedTaskRepository;
import com.example.todo.Repository.FileRepository;

@Service
public class FileStorageService {

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private AssignedTaskRepository taskRepository;

    // Use @Transactional to ensure data consistency.
    @Transactional
    public FileEntity storeFile(MultipartFile file, Long taskId) throws IOException { // CHANGED: Added "throws IOException"
        AssignedTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        // file.getBytes() can throw an IOException, so the method must declare it.
        FileEntity fileEntity = new FileEntity(file.getOriginalFilename(), file.getContentType(), file.getBytes());
        fileEntity.setTask(task);

        return fileRepository.save(fileEntity);
    }

    @Transactional(readOnly = true) // Good practice for read-only operations.
    public List<FileEntity> getFilesByTaskId(Long taskId) {
        return fileRepository.findByTaskTaskId(taskId);
    }
    
    // NEW: Added this method to get a single file by its unique ID.
    // The controller's download endpoint needs this.
    @Transactional(readOnly = true)
    public FileEntity getFile(Long fileId) {
        return fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found with id: " + fileId));
    }
}