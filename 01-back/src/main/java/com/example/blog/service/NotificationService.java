package com.example.blog.service;

import com.example.blog.entity.Notification;
import com.example.blog.DTO.NotificationDTO;
import com.example.blog.repository.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository repo;
    private final SimpMessagingTemplate messaging;

    public NotificationService(NotificationRepository repo, SimpMessagingTemplate messaging) {
        this.repo = repo;
        this.messaging = messaging;
    }
 public void pushNotification(String recipientName, Notification notification) {
        // Send to specific user's private queue
        NotificationDTO dto = new NotificationDTO(
        notification.getId(),
        notification.getActorId(),
        notification.getType(),
        notification.getMessage(),
        notification.getPostId(),
        notification.getCreatedAt(),
        notification.isSeen()
    );
        messaging.convertAndSendToUser(recipientName, "/queue/notifications", dto);
       //System.out.println("+++++++++ Sending notification to user " + recipientId + ": " + notification);
    }

    public List<Notification> getNotificationsFor(Long userId) {
        return repo.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    // optional: mark as seen
    public void markAsSeen(Long notificationId) {
        repo.findById(notificationId).ifPresent(n -> {
            n.setSeen(true);
            repo.save(n);
        });
    }
    public void markAllAsSeen() {
        List<Notification> notifs = repo.findAll();
        for (Notification n : notifs) {
            n.setSeen(true);
        }
        repo.saveAll(notifs);
    }
}
