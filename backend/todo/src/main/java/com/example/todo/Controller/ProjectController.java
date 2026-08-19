package com.example.todo.Controller;

import com.example.todo.ProjectEntity;
import com.example.todo.Service.ProjectService;
import com.example.todo.dto.ProjectCreateRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @PostMapping
    public ResponseEntity<ProjectEntity> createProject(@RequestBody ProjectCreateRequest request) {
        ProjectEntity createdProject = projectService.createProject(request);
        return ResponseEntity.ok(createdProject);
    }
    
    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectEntity> getProjectById(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectService.getProjectById(projectId));
    }
    

    @PutMapping("/{projectId}")
    public ResponseEntity<ProjectEntity> updateProject(@PathVariable Long projectId, @RequestBody ProjectCreateRequest request) {
        ProjectEntity updatedProject = projectService.updateProject(projectId, request);
        return ResponseEntity.ok(updatedProject);
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long projectId) {
        projectService.deleteProject(projectId);
        return ResponseEntity.noContent().build(); // Standard response for successful DELETE
    }

    @GetMapping
    public ResponseEntity<List<ProjectEntity>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProjectEntity>> getProjectsForUser(@PathVariable String userId) {
        List<ProjectEntity> projects = projectService.getProjectsForUser(userId);
        return ResponseEntity.ok(projects);
    }
}
