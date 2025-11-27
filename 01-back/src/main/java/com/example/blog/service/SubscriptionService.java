package com.example.blog.service;

import com.example.blog.entity.*;
import com.example.blog.repository.NotificationRepository;
import com.example.blog.repository.SubscriptionRepository;
import com.example.blog.repository.UserRepository;

import jakarta.transaction.Transactional;

import java.util.Optional;

import org.springframework.stereotype.Service;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
       private final NotificationService notificationService;
 private final NotificationRepository repo;
    public SubscriptionService(NotificationRepository repo,NotificationService notificationService ,SubscriptionRepository subscriptionRepository, UserRepository userRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.repo = repo;
    }

    @Transactional
    public boolean toggleFollow(Long followerId, Long followedId) {
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new RuntimeException("Follower not found"));
        User followed = userRepository.findById(followedId)
                .orElseThrow(() -> new RuntimeException("Followed user not found"));

        return subscriptionRepository.findByFollowerAndFollowed(follower, followed)
                .map(existing -> {
                    subscriptionRepository.delete(existing); // unfollow
                    return false;
                })
                .orElseGet(() -> {
                    Subscription subscription = new Subscription(follower, followed);
                    subscriptionRepository.save(subscription); // follow
                    Notification n = new Notification();
                    n.setRecipientId(followedId);
                    n.setActorId(followerId);
                    n.setType("FOLLOW");
                    n.setMessage(follower.getUsername() +" has followed you!");
                //n.setPostId(postId);
                
                n = repo.save(n);
                    notificationService.pushNotification(userRepository.getById(n.getRecipientId()).getUsername() ,
                     n
                );
                    return true;
                });
    }

    public boolean isFollowing(Long followerId, Long followedId) {

        Optional<User> follower = userRepository.findById(followerId);
        Optional<User> followed = userRepository.findById(followedId);
        if (!follower.isPresent() || !followed.isPresent()) {
            return false;
        }
        return subscriptionRepository.existsByFollowerAndFollowed(follower.get(), followed.get());
    }

    public Long countFollowers(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return subscriptionRepository.countByFollowed(user);
    }

    public Long countFollowing(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return subscriptionRepository.countByFollower(user);
    }
}
