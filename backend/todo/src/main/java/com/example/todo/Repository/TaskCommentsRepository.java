	package com.example.todo.Repository;
	
	import java.util.List;
	import java.util.Optional;
	
	import org.springframework.data.jpa.repository.JpaRepository;
	import org.springframework.stereotype.Repository;
	
	import com.example.todo.TaskComments;
	import com.example.todo.UserAuthentication;
	
	@Repository
	public interface TaskCommentsRepository extends JpaRepository<TaskComments, Long> {
		
		List<TaskComments> findByTaskId(Long taskId);
	
	}
