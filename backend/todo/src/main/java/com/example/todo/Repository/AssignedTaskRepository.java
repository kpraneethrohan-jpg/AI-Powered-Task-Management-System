package com.example.todo.Repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.todo.AssignedTask;
import com.example.todo.ProjectEntity;
import com.example.todo.UserAuthentication;

@Repository
public interface AssignedTaskRepository extends JpaRepository<AssignedTask,Long> {
	List<AssignedTask> findByAssigneeId(String assigneeId);
	List<AssignedTask> findByAssigneeIdAndStatusIn(String assigneeId, List<String> statuses);
	List<AssignedTask> findByProjectIdAndAssigneeId(Long projectId, String assigneeId);
	List<AssignedTask> findTasksByProject(ProjectEntity project);
	List<AssignedTask> findByAssignee(UserAuthentication user);
	List<AssignedTask> findByAssigneeIdAndStatusNotIgnoreCase(String assigneeId, String status);
	List<AssignedTask> findByStatusNotIgnoreCase(String status);
	List<AssignedTask> findByStatusIgnoreCase(String status);
	
	// Find tasks assigned BY a specific user (assigner)
	List<AssignedTask> findByAssignedById(String assignedById);
	List<AssignedTask> findByAssignedByUsername(String assignedByUsername);
	
	int countByStatus(String status);
	
	// Completion queries - for health analysis
	@Query("SELECT COUNT(a) FROM AssignedTask a WHERE a.completedAt IS NOT NULL")
	int countCompletedTasks();
	
	@Query("SELECT COUNT(a) FROM AssignedTask a WHERE a.completedAt IS NULL AND LOWER(a.status) != 'completed' AND LOWER(a.status) != 'done'")
	int countActiveTasks();
	
	@Query("SELECT COUNT(a) FROM AssignedTask a WHERE a.completedAt IS NOT NULL AND a.completedAt < a.deadline")
	int countTasksCompletedOnTime();
	
	@Query("SELECT COUNT(a) FROM AssignedTask a WHERE a.completedAt IS NOT NULL AND a.completedAt > a.deadline")
	int countTasksCompletedLate();
	
	// Status breakdown queries
	@Query("SELECT COUNT(a) FROM AssignedTask a WHERE LOWER(a.status) = 'pending' OR LOWER(a.status) = 'not started'")
	int countPendingTasks();
	
	@Query("SELECT COUNT(a) FROM AssignedTask a WHERE LOWER(a.status) = 'in progress'")
	int countInProgressTasks();
	
	// Priority distribution queries for active tasks
	@Query("SELECT COUNT(a) FROM AssignedTask a WHERE LOWER(a.priority) = 'high' AND a.completedAt IS NULL")
	int countHighPriorityActiveTasks();
	
	@Query("SELECT COUNT(a) FROM AssignedTask a WHERE LOWER(a.priority) = 'medium' AND a.completedAt IS NULL")
	int countMediumPriorityActiveTasks();
	
	@Query("SELECT COUNT(a) FROM AssignedTask a WHERE LOWER(a.priority) = 'low' AND a.completedAt IS NULL")
	int countLowPriorityActiveTasks();
	
	// Overdue tasks query
	@Query("SELECT a FROM AssignedTask a WHERE a.completedAt IS NULL AND a.deadline < :today AND a.deadline IS NOT NULL")
	List<AssignedTask> findOverdueTasks(@Param("today") LocalDate today);
	
	// Completed tasks for trend analysis
	@Query("SELECT a FROM AssignedTask a WHERE a.completedAt IS NOT NULL AND CAST(a.completedAt AS date) = :date")
	List<AssignedTask> findTasksCompletedOn(@Param("date") LocalDate date);
	
	@Query("SELECT COUNT(a) FROM AssignedTask a WHERE a.assignee.role = 'employee'")
	int countTasksAssignedToEmployees();

	@Query("SELECT COUNT(a) FROM AssignedTask a WHERE a.assignee.role = 'employee' AND a.status = :status")
	int countTasksByStatusForEmployees(@Param("status") String status);
	
	@Query("SELECT COUNT(a) FROM AssignedTask a WHERE a.assignee.role = 'manager'")
	int countTasksAssignedToManagers();

	@Query("SELECT COUNT(a) FROM AssignedTask a WHERE a.assignee.role = 'manager' AND a.status = :status")
	int countTasksByStatusForManagers(@Param("status") String status);


}
