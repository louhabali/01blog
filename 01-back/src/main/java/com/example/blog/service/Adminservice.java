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
    // Delete all reports that targeted posts owned by the user
    reportRepository.deleteByPost_UserId(id); 
    // Delete all interactions (likes/dislikes) made on posts owned by the user
    interactionRepository.deleteByPost_UserId(id); 
    commentRepository.deleteByPost_UserId(id); 
    postrepo.deleteByUserId(id);
    // Interactions created BY the user
    interactionRepository.deleteByUserId(id); 

    // Comments created BY the user
    commentRepository.deleteByUserId(id); 

    // Subscriptions (where the user is the follower OR the followed)
    subscriptionRepository.deleteByFollowerId(id);
    subscriptionRepository.deleteByFollowedId(id);

    // Notifications (where the user is the recipient OR the actor)
    notificationRepository.deleteByRecipientId(id);
    notificationRepository.deleteByActorId(id);

    // Reports (where the user is the reporter OR the reported user)
    reportRepository.deleteByReporterUserId(id);
    reportRepository.deleteByReportedUserId(id);
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



