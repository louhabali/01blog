package com.example.blog.service;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.example.blog.repository.*;

import jakarta.transaction.Transactional;

import java.util.*;
@Service
public class Adminservice {
    private final UserRepository userrepo;
     private final PostRepository postrepo;
    private final ReportRepository reportRepository;
     private final CommentRepository commentRepository;
     private final InteractionRepository interactionRepository;
     private final SubscriptionRepository subscriptionRepository;
     private final NotificationRepository notificationRepository;
    public Adminservice(UserRepository userrepo ,PostRepository postr,
         ReportRepository reportRepository,
      CommentRepository commentRepository,
      InteractionRepository interactionRepository,
      SubscriptionRepository subscriptionRepository,
      NotificationRepository notificationRepository
    ) {
        this.commentRepository = commentRepository;
        this.reportRepository = reportRepository;
        this.interactionRepository = interactionRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.notificationRepository = notificationRepository;
        this.userrepo = userrepo;
        this.postrepo = postr;
    }
    public Map<String, Object> bringStatsMap(){
         Map<String, Object> stats = new HashMap<>();
        // Total users
        long totalUsers = userrepo.count();
        // Banned users = enabled = false
        long bannedUsers = userrepo.countByEnabledFalse(); // you need this method in UserRepository
        // Total posts
        long totalPosts = postrepo.count();
        stats.put("usersCount", totalUsers);
        stats.put("bannedUsersCount", bannedUsers);
        stats.put("postsCount", totalPosts);
        stats.put("hiddenPostsCount", postrepo.countByIsAppropriateFalse());
        return stats;
    }
    @Transactional
    public ResponseEntity<Void> deleteUserwithTransaction(Long id){
        interactionRepository.deleteByUserId(id);
        commentRepository.deleteByUserId(id);
        postrepo.deleteByUserId(id);
        subscriptionRepository.deleteByFollowerId(id);
        subscriptionRepository.deleteByFollowedId(id);
        notificationRepository.deleteByRecipientId(id);
        notificationRepository.deleteByActorId(id);
         // Then delete the user
        userrepo.deleteById(id);
        return ResponseEntity.ok().build();
    }
    @Transactional
    public ResponseEntity<Void> deletePostwithTransaction(Long id){
        reportRepository.deleteByPostId(id);
        interactionRepository.deleteByPostId(id);
        commentRepository.deleteByPostId(id);
        postrepo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}



