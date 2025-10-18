package com.example.blog.controller;

import com.example.blog.entity.Post;
import com.example.blog.DTO.*;
import com.example.blog.entity.User;
import com.example.blog.service.InteractionService;
import com.example.blog.service.PostService;

import jakarta.validation.Valid;

import com.example.blog.repository.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/posts")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class PostController {

    private final PostService postService;
    private final PostRepository postrepo;
    private final UserRepository userRepository;
    private final InteractionRepository interactionRepository;
    private final InteractionService interactionService;
    private final CommentRepository commentRepository;

    public PostController(PostService postService, UserRepository userRepository,
            InteractionRepository interactionRepository, PostRepository postrepo,
            InteractionService interactionService , CommentRepository commentRepository) {
        this.postService = postService;
        this.userRepository = userRepository;
        this.interactionRepository = interactionRepository;
        this.postrepo = postrepo;
        this.interactionService = interactionService;
        this.commentRepository = commentRepository;

    }

 @PostMapping("/create")
public ResponseEntity<?> createPost(@Valid @RequestBody PostRequest request) {
    // find author safely
    User author = userRepository.findById(request.getAuthorId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

    // create new Post entity
    Post post = new Post();
    post.setTitle(request.getTitle());
    post.setContent(request.getContent());
    post.setImageUrl(request.getImageUrl());
    post.setVideoUrl(request.getVideoUrl());
    post.setCreatedAt(request.getCreatedAt() != null ? request.getCreatedAt() : LocalDateTime.now());
    post.setUser(author);

    // save post
    Post savedPost = postService.createPost(post);

    return ResponseEntity.status(HttpStatus.CREATED).body(savedPost);
}

    @GetMapping("/all")
    public List<PostResponse> getAllPosts(@RequestParam Long currentUserId,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10") int limit) {
        List<Post> posts = postrepo.findWithOffsetLimit(offset, limit);
        return posts.stream()
                .map(post -> {
                    boolean liked = postService.isPostLikedByUser(post.getId(), currentUserId);
                    Long likes = interactionService.getLikesCount(post.getId());
                    return new PostResponse(post, liked, likes);
                })
                .toList();
    }

    @GetMapping("/all/{id}")
    public List<PostResponse> getAllPostsOfUser(@PathVariable Long id, @RequestParam Long currentUserId) {
        User currentuser = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        ;
        return postService.getPostsByUser(currentuser).stream()
                .map(post -> {
                    boolean liked = postService.isPostLikedByUser(post.getId(), currentUserId);
                    Long likes = interactionService.getLikesCount(post.getId());
                    return new PostResponse(post, liked, likes);
                })
                .toList();
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<Post> editPost(@PathVariable Long id,@Valid @RequestBody PostRequest updatedPost) {
        try {
            Post post = postService.getPostById(id);
            if (post == null) {
                return ResponseEntity.notFound().build();
            }

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

    @Transactional
    @DeleteMapping("/delete/{postId}")
    public ResponseEntity<List<Post>> deletePost(@PathVariable Long postId) {
        // 1. Delete all interactions related to the post
        System.out.println("2222222222222222222222222222222222222222222222222 :  " + postId);
        
        interactionRepository.deleteByPostId(postId);
        commentRepository.deleteByPostId(postId);
        // 2. Delete the post itself
        postrepo.deleteById(postId);

        // 3. Return updated posts list (optional)
        List<Post> posts = postrepo.findAll();
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/user/{userId}")
    public List<Post> getPostsByUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return postService.getPostsByUser(user);
    }
}
