package com.example.blog.service;

import com.example.blog.entity.Subscription;
import com.example.blog.entity.User;
import com.example.blog.repository.SubscriptionRepository;
import com.example.blog.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public SubscriptionService(SubscriptionRepository subscriptionRepository, UserRepository userRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
    }

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
                    return true;
                });
    }

    public boolean isFollowing(Long followerId, Long followedId) {
        User follower = userRepository.findById(followerId).orElseThrow();
        User followed = userRepository.findById(followedId).orElseThrow();
        return subscriptionRepository.existsByFollowerAndFollowed(follower, followed);
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
