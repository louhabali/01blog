package com.example.blog.controller;

import com.example.blog.service.SubscriptionService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @PostMapping("/toggle")
    public boolean toggleFollow(@RequestParam Long followerId, @RequestParam Long followedId) {
        return subscriptionService.toggleFollow(followerId, followedId);
    }

    @GetMapping("/status")
    public boolean isFollowing(@RequestParam Long followerId, @RequestParam Long followedId) {
        return subscriptionService.isFollowing(followerId, followedId);
    }

    @GetMapping("/{userId}/followers/count")
    public Long getFollowersCount(@PathVariable Long userId) {
        return subscriptionService.countFollowers(userId);
    }

    @GetMapping("/{userId}/following/count")
    public Long getFollowingCount(@PathVariable Long userId) {
        return subscriptionService.countFollowing(userId);
    }
}
