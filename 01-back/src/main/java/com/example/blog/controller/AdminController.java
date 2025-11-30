package com.example.blog.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.blog.entity.Post;
import com.example.blog.entity.Report;
import com.example.blog.entity.User;
import com.example.blog.repository.*;
import com.example.blog.service.*;
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
    private final Adminservice admin;

    // Constructor remains the same
    public AdminController(UserRepository userRepository, PostRepository postRepository,
            ReportRepository reportRepository , CommentRepository commentRepository , InteractionRepository interactionRepository,
            SubscriptionRepository subscriptionRepository, NotificationRepository notificationRepository,
            Adminservice admin ) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.reportRepository = reportRepository;
        this.commentRepository = commentRepository;
        this.interactionRepository = interactionRepository;
        this.notificationRepository = notificationRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.admin = admin;
    }
    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        return admin.bringStatsMap();
    }

    @GetMapping("/users")
    public List<User> getUsers(
            @RequestParam(defaultValue = "10") int limit, 
            @RequestParam(required = false) Long lastUserId) {
        return userRepository.findNextPage(limit, lastUserId);
    }

    @PutMapping("/users/{id}/ban")
    public ResponseEntity<User> toggleUserBan(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow();
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }
    
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        return admin.deleteUserwithTransaction(id);
    }
    @GetMapping("/posts")
    public List<Post> getPosts(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime lastPostCreatedAt,

            @RequestParam(required = false) Long lastPostId) {
        return postRepository.findGlobalFeed(limit, true, lastPostCreatedAt, lastPostId);
    }

    @PutMapping("/posts/{id}/hide")
    public ResponseEntity<Post> toggleHidePost(@PathVariable Long id) {
        
        Post post = postRepository.findById(id).orElseThrow();
        post.setisAppropriate(!post.isAppropriate()); 
        postRepository.save(post);
        return ResponseEntity.ok(post);
    }
    
    @Transactional
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        try {
            return admin.deletePostwithTransaction(id);
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.internalServerError().build();
    }
    }

    @GetMapping("/reports")
    public List<Report> getReports(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) Long lastReportId) {
        return reportRepository.findNextPage(limit, lastReportId);
    }

    @Transactional
    @DeleteMapping("/reports/{id}")
    public ResponseEntity<Void> resolveReport(@PathVariable Long id) {
        reportRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}