package com.example.blog.controller;
import com.example.blog.repository.*;
import com.example.blog.service.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.blog.entity.*;

import java.security.Principal;
@RestController
@RequestMapping("/interactions")
public class InteractionController {

    private final InteractionService interactionService;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    public InteractionController(InteractionService interactionService,
                                 UserRepository userRepository,
                                 PostRepository postRepository) {
        this.interactionService = interactionService;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
    }

    @PostMapping("/like/{postId}/like")
public ResponseEntity<?> toggleLike(
        @PathVariable Long postId,
        Principal principal) {
  if (principal == null) {
        System.out.println("NOT PRINCPAL");
            // This will be handled by the filter, but it's good practice
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("You must log in to like a post");
        }
        
        String username = principal.getName();
        System.out.println("USERNAMEPRINCIPAL IS : "+username);
    User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
    Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

    boolean liked = interactionService.toggleLike(user, post);
    System.out.println("POST ID " + postId + " LIKED STATE IS NOW :: " + liked);
    return ResponseEntity.ok(liked);
}
  
}
