package com.example.blog.service;

import com.example.blog.entity.Notification;
import com.example.blog.DTO.NotificationDTO;
import com.example.blog.repository.*;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository repo;
    private final SimpMessagingTemplate messaging;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository repo, SimpMessagingTemplate messaging,
                                 PostRepository postRepository, UserRepository userRepository
    ) {
        this.repo = repo;
        this.messaging = messaging;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
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
    List<Notification> initialList =
        repo.findByRecipientIdOrderByCreatedAtDesc(userId);

    initialList.removeIf(n ->
        n.getPostId() != null &&
        postRepository.findById(n.getPostId()).isEmpty()
    );

    return initialList;
}


    // mark as seen
    public HashMap<String,Boolean> markAsSeen(Long notificationId) {
        repo.findById(notificationId).ifPresent(n -> {
            n.setSeen(true);
            repo.save(n);
        });
        // get the seen state
        HashMap<String , Boolean> response = new HashMap<>();
        boolean seenState = repo.findById(notificationId).map(Notification::isSeen).orElse(false);
        response.put("seen", seenState);
        return response;
    }
}
