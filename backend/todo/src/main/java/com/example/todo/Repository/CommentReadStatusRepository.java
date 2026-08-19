package com.example.todo.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.todo.CommentReadStatus;

@Repository
public interface CommentReadStatusRepository extends JpaRepository<CommentReadStatus, Long> {
    List<CommentReadStatus> findByUserIdAndIsReadFalse(String userId);
    List<CommentReadStatus> findByCommentIdAndUserId(Long commentId, String userId);
}
