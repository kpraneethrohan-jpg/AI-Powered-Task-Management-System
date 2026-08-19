package com.example.todo.Repository;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.todo.Notifications;

@Repository
public interface NotificationRepository extends JpaRepository<Notifications, Long> {
    List<Notifications> findByReceiverIdOrderByTimestampDesc(String receiverId);
    List<Notifications> findByReceiverIdAndIsReadFalse(String receiverId);
}
