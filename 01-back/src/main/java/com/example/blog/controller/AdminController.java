package com.example.blog.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.blog.entity.Post;
import com.example.blog.entity.Report;
import com.example.blog.entity.User;
import com.example.blog.repository.*;

import jakarta.transaction.Transactional;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final ReportRepository reportRepository;
     private final CommentRepository commentRepository;
     private final InteractionRepository interactionRepository;
     private final SubscriptionRepository subscriptionRepository;
     private final NotificationRepository notificationRepository;
    public AdminController(UserRepository userRepository, PostRepository postRepository,
            ReportRepository reportRepository , CommentRepository commentRepository , InteractionRepository interactionRepository,
            SubscriptionRepository subscriptionRepository, NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.reportRepository = reportRepository;
        this.commentRepository = commentRepository;
        this.interactionRepository = interactionRepository;
        this.notificationRepository = notificationRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    // ------------------- STATS -------------------
    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();

        // Total users
        long totalUsers = userRepository.count();

        // Banned users = enabled = false
        long bannedUsers = userRepository.countByEnabledFalse(); // you need this method in UserRepository

        // Total posts
        long totalPosts = postRepository.count();

        stats.put("usersCount", totalUsers);
        stats.put("bannedUsersCount", bannedUsers);
        stats.put("postsCount", totalPosts);
        stats.put("hiddenPostsCount", postRepository.countByIsAppropriateFalse());

        return stats;
    }

    // ------------------- USERS -------------------
    @GetMapping("/users")
    public List<User> getUsers(@RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10") int limit) {
        return userRepository.findWithOffsetLimit(offset, limit);
    }

    @PutMapping("/users/{id}/ban")
    public ResponseEntity<User> toggleUserBan(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow();
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }
    @Transactional
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        interactionRepository.deleteByUserId(id);
        commentRepository.deleteByUserId(id);
        postRepository.deleteByUserId(id);
        subscriptionRepository.deleteByFollowerId(id);
        subscriptionRepository.deleteByFollowedId(id);
        notificationRepository.deleteByRecipientId(id);
        notificationRepository.deleteByActorId(id);
         // Then delete the user
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ------------------- POSTS -------------------
    @GetMapping("/posts")
    public List<Post> getPosts(@RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10") int limit) {
        return postRepository.findWithOffsetLimit(offset, limit, true);
    }

    @PutMapping("/posts/{id}/hide")
    public ResponseEntity<Post> toggleHidePost(@PathVariable Long id) {
        
        Post post = postRepository.findById(id).orElseThrow();
        post.setisAppropriate(!post.isAppropriate()); // assuming you have a 'hidden' boolean field in Post
        postRepository.save(post);
        return ResponseEntity.ok(post);
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        try {

        // First, delete interactions related to the post
        reportRepository.deleteByPostId(id);
        interactionRepository.deleteByPostId(id);
        // 
        commentRepository.deleteByPostId(id);
        
        //
        postRepository.deleteById(id);

        return ResponseEntity.ok().build();
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.internalServerError().build();
    }
    }

    // ------------------- REPORTS -------------------
    @GetMapping("/reports")
    public List<Report> getReports(@RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10") int limit) {
        return reportRepository.findWithOffsetLimit(offset, limit);
    }

    @DeleteMapping("/reports/{id}")
    public ResponseEntity<Void> resolveReport(@PathVariable Long id) {
        reportRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
