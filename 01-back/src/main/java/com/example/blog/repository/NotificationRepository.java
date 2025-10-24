package com.example.blog.repository;

import com.example.blog.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findTop20ByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    void deleteByRecipientId(Long recipientId);
    void deleteByActorId(Long actorId);
}
