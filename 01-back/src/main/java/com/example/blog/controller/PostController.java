package com.example.blog.controller;

import com.example.blog.entity.Post;
import com.example.blog.DTO.*;
import com.example.blog.entity.User;
import com.example.blog.service.InteractionService;
import com.example.blog.service.PostService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

import com.example.blog.repository.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/posts")
public class PostController {
    
    private final PostService postService;
    private final PostRepository postRepo;
    private final UserRepository userRepository;
    private final InteractionService interactionService;
    private final CommentRepository commentRepository;
    private final InteractionRepository interactionRepository;

    public PostController(PostService postService, UserRepository userRepository,
            PostRepository postRepo, InteractionService interactionService,
            CommentRepository commentRepository, InteractionRepository interactionRepository) {
                this.postService = postService;
        this.userRepository = userRepository;
        this.postRepo = postRepo;
        this.interactionService = interactionService;
        this.commentRepository = commentRepository;
        this.interactionRepository = interactionRepository;
    }

     // Get all posts with pagination and subscription filtering
    @GetMapping("/all")
    public ResponseEntity<List<PostResponse>> getAllPosts(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String lastPostCreatedAt,
            @RequestParam(required = false) Long lastPostId,
            Principal principal) {

        // 1. Get the posts (this works for everyone)
        List<Post> posts = new ArrayList<>();
        // 2. Determine the Current User ID (Safely)
        Long currentUserId = null;

        if (principal != null) {
            String username = principal.getName();
            // We use ifPresent or similar logic to avoid crashing if DB is weird
            User currentUser = userRepository.findByUsername(username).orElse(null);
            if (currentUser != null) {
                currentUserId = currentUser.getId();
            }
        }

        // 3. Make "currentUserId" effectively final for the lambda below
        final Long finalUserId = currentUserId;
        String lastPostCreatedAtStr = lastPostCreatedAt; // Use the String received
        LocalDateTime lastPostCreatedAtToDate = null;

        if (lastPostCreatedAtStr != null) {
            try {
                // 1. Parse the full ISO string as an Instant (handles the 'Z')
                Instant instant = Instant.parse(lastPostCreatedAtStr);
                // 2. Convert the Instant to a LocalDateTime (discarding the Z)
                lastPostCreatedAtToDate = instant.atZone(ZoneId.systemDefault()).toLocalDateTime();
            } catch (DateTimeParseException e) {
                // Log the error
                System.err.println(
                        "Failed to parse date string: " + lastPostCreatedAtStr + " | Error: " + e.getMessage());
            }
        }
        if (finalUserId != null) {

            posts = postRepo.findWithOffsetLimitofsubscribed(limit, false, finalUserId, lastPostCreatedAtToDate,
                    lastPostId);
        } else {
            // return the posts empty
            return ResponseEntity.ok(new ArrayList<>());
        }
        List<PostResponse> responses = posts.stream()
                .map(post -> {
                    // 4. Only check "liked" if we actually have a user ID
                    boolean liked = false;
                    liked = postService.isPostLikedByUser(post.getId(), finalUserId);
                    Long likes = interactionService.getLikesCount(post.getId());
                    return new PostResponse(post, liked, likes);
                })
                .toList();

        return ResponseEntity.ok(responses);
    }
    // Get posts by user with pagination
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostResponse>> getPostsByUser(
            @PathVariable Long userId,
            @RequestParam(required = false) Long currentUserId,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String lastPostCreatedAt,
            @RequestParam(required = false) Long lastPostId
        
        ) {
     String lastPostCreatedAtStr = lastPostCreatedAt; // Use the String received
    LocalDateTime lastPostCreatedAtToDate = null;
        
        if (lastPostCreatedAtStr != null) {
            try {
                // 1. Parse the full ISO string as an Instant (handles the 'Z')
                Instant instant = Instant.parse(lastPostCreatedAtStr);
                // 2. Convert the Instant to a LocalDateTime (discarding the Z)
                lastPostCreatedAtToDate = instant.atZone(ZoneId.systemDefault()).toLocalDateTime();
            } catch (DateTimeParseException e) {
                // Log the error
                System.err.println(
                        "Failed to parse date string: " + lastPostCreatedAtStr + " | Error: " + e.getMessage());
            }
        }
        List<Post> posts = postRepo.findPostsByUserWithPagination(userId, limit, lastPostCreatedAtToDate, lastPostId);
    
        List<PostResponse> responses = posts.stream()
                .map(post -> {
                    boolean liked = postService.isPostLikedByUser(post.getId(), currentUserId);
                    Long likes = interactionService.getLikesCount(post.getId());
                    return new PostResponse(post, liked, likes);
                })
                .toList();
    
        return ResponseEntity.ok(responses);
    }

    // Create a new post
    @PostMapping("/create")
    public ResponseEntity<?> createPost(@Valid @RequestBody PostRequest request, HttpServletRequest httpRequest) {
        //
        User author = userRepository.findById(request.getAuthorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be logged in"));

        Post post = new Post();
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setImageUrl(request.getImageUrl());
        post.setVideoUrl(request.getVideoUrl());
        post.setCreatedAt(request.getCreatedAt() != null ? request.getCreatedAt() : LocalDateTime.now());
        post.setUser(author);

        Post savedPost = postService.createPost(post);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPost);
    }

    // Get a post by ID
    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(
            @PathVariable Long id,
            @RequestParam(required = false) Long currentUserId) {
        Post post = postRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        System.out.println("GET POST BY ID CALLED WITH ID: " + id + " and currentUserId: " + currentUserId);

        boolean liked = postService.isPostLikedByUser(post.getId(), currentUserId);
        Long likes = interactionService.getLikesCount(post.getId());

        return ResponseEntity.ok(new PostResponse(post, liked, likes));
    }
    // Toggle like on a post
    @PostMapping("/{postId}/like")
    public ResponseEntity<Boolean> toggleLike(@PathVariable Long postId,
            @RequestParam(required = false) Long userId) {
        if (userId == null || userId == 0)
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required to like");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        boolean liked = interactionService.toggleLike(user, post);
        return ResponseEntity.ok(liked);
    }
    // Delete a post by ID
    @Transactional
    @DeleteMapping("/delete/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId) {
        interactionRepository.deleteByPostId(postId);
        commentRepository.deleteByPostId(postId);
        postRepo.deleteById(postId);
        return ResponseEntity.noContent().build();
    }
    // Edit a post
    @PutMapping("/edit/{id}")
    public ResponseEntity<Post> editPost(@PathVariable Long id, @Valid @RequestBody PostRequest updatedPost) {
        try {
            Post post = postService.getPostById(id);
            if (post == null) {
                return ResponseEntity.notFound().build();
            }

            // Update fields

            post.setTitle(updatedPost.getTitle());
            post.setContent(updatedPost.getContent());
            post.setImageUrl(updatedPost.getImageUrl());
            post.setVideoUrl(updatedPost.getVideoUrl());

            Post savedPost = postService.savePost(post);

            return ResponseEntity.ok(savedPost);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
   

    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Long> countPostsByUser(@PathVariable Long userId) {
        long count = postRepo.countByAuthorId(userId);
        return ResponseEntity.ok(count);
    }
}
