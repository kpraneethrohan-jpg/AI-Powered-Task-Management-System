package com.example.todo.Service;

import com.example.todo.AssignedTask;
import com.example.todo.ProjectEntity;
import com.example.todo.UserAuthentication;
import com.example.todo.Repository.AssignedTaskRepository;
import com.example.todo.Repository.ProjectRepository;
import com.example.todo.Repository.UserRepository;
import com.example.todo.dto.ProjectCreateRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AssignedTaskRepository assignedtaskrepo; 

    @Transactional
    public ProjectEntity createProject(ProjectCreateRequest request) {
        ProjectEntity project = new ProjectEntity();
        project.setName(request.getName());
        project.setDescription(request.getDescription()); // <-- SET THE DESCRIPTION

        List<UserAuthentication> users = userRepository.findAllById(request.getUserIds());
        project.setAssignedUsers(new HashSet<>(users));
        return projectRepository.save(project);
    }
    
    @Transactional
    public ProjectEntity updateProject(Long projectId, ProjectCreateRequest request) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        project.setName(request.getName());
        project.setDescription(request.getDescription()); // <-- UPDATE DESCRIPTION

        List<UserAuthentication> users = userRepository.findAllById(request.getUserIds());
        project.setAssignedUsers(new HashSet<>(users));
        
        return projectRepository.save(project);
    }

    @Transactional // This is important to ensure all operations succeed or fail together
    public void deleteProject(Long projectId) {
        // 1. Find the project first to ensure it exists
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        // 2. Find all tasks associated with this project
        List<AssignedTask> tasksToDelete = assignedtaskrepo.findTasksByProject(project); // We need to create this method
        
        // 3. Delete all the associated tasks
        if (tasksToDelete != null && !tasksToDelete.isEmpty()) {
            assignedtaskrepo.deleteAll(tasksToDelete);
        }

        // 4. Clear the Many-to-Many relationship with users
        // This removes the entries from the `project_users` join table
        project.getAssignedUsers().clear();
        projectRepository.save(project); // Save the project to persist the cleared relationship

        // 5. Now that all children are gone, delete the project itself
        projectRepository.delete(project);
    }

    public List<ProjectEntity> getAllProjects() {
        return projectRepository.findAll();
    }
    
    public ProjectEntity getProjectById(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
    }
    

    public List<ProjectEntity> getProjectsForUser(String userId) {
        return projectRepository.findByAssignedUsers_Id(userId);
    }
    
}