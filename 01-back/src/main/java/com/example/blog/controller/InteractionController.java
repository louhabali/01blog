package com.example.blog.controller;
import com.example.blog.repository.*;
import com.example.blog.service.*;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.blog.entity.*;
import java.util.Map;
@RestController
@RequestMapping("/interactions")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
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
        @RequestParam(required = false) Long userId , HttpServletRequest http ) {
            String uersname  = (String) http.getAttribute("userName");
            if (uersname == null){
               return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("You must log in to like a post");
            }
    if (userId == null || userId == 0 ) {
        // user not logged in → return 401 Unauthorized
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("You must log in to like a post");
    }

    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

    boolean liked = interactionService.toggleLike(user, post);

    return ResponseEntity.ok(liked);
}
  
}
