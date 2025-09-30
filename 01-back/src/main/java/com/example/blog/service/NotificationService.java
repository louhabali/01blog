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

    // public Notification pushNotification(Long recipientId,  String message) {
    //     // Notification n = new Notification();
    //     // n.setRecipientId(recipientId);
       
       
    //     // n.setMessage(message);
        
    //     // n = repo.save(n);

    //     // NotificationDTO dto = new NotificationDTO(
    //     //     n.getId(), n.getActorId(), n.getType(), n.getMessage(), n.getPostId(), n.getCreatedAt(), n.isSeen()
    //     // );

    //     // messaging.convertAndSendToUser(String.valueOf(recipientId), "/queue/notifications", dto);
    //     // return n;
        
    // }
 public void pushNotification(Notification notification) {
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
        messaging.convertAndSend("/topic/notifications", dto);
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
}
