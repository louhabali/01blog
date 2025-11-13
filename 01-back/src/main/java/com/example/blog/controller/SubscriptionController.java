package com.example.blog.controller;

import com.example.blog.service.SubscriptionService;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController
@RequestMapping("/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @PostMapping("/toggle")
    public boolean toggleFollow(@RequestBody Map<String, Long> payload) {
          Long followerId = payload.get("followerId");
    Long followingId = payload.get("followingId");
    return subscriptionService.toggleFollow(followerId, followingId);
    
    }

    @GetMapping("/status")
    public boolean isFollowing(@RequestParam Long followerId, @RequestParam Long followedId) {
        return subscriptionService.isFollowing(followerId, followedId);
    }

    @GetMapping("/followers/{userId}")
    public Long getFollowersCount(@PathVariable Long userId) {
        return subscriptionService.countFollowers(userId);
    }

    @GetMapping("/following/{userId}")
    public Long getFollowingCount(@PathVariable Long userId) {
        return subscriptionService.countFollowing(userId);
    }
}
