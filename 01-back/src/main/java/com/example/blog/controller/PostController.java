package com.example.blog.controller;

import com.example.blog.entity.Post;
import com.example.blog.DTO.*;
import com.example.blog.entity.User;
import com.example.blog.service.InteractionService;
import com.example.blog.service.PostService;
import com.example.blog.repository.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public PostController(PostService postService, UserRepository userRepository,InteractionRepository interactionRepository,PostRepository postrepo,InteractionService interactionService) {
        this.postService = postService;
        this.userRepository = userRepository;
        this.interactionRepository = interactionRepository;
        this.postrepo = postrepo;
        this.interactionService = interactionService;
       
    }

    @PostMapping("/create")
    public Post createPost(@RequestBody Map<String, Object> body) {
        System.out.println("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ ");
        String title = (String) body.get("title");
        String content = (String) body.get("content");
        String imageUrl = (String) body.get("imageUrl");
        String videoUrl = (String) body.get("videoUrl");
        String createdAtStr = (String) body.get("createdAt");
         OffsetDateTime offsetDateTime = OffsetDateTime.parse(createdAtStr);
    LocalDateTime createdAt = offsetDateTime.toLocalDateTime();
        Number authorIdNumber = (Number) body.get("authorId");
        Long authorId = authorIdNumber.longValue();

        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = new Post();
        post.setTitle(title);
        post.setContent(content);
        post.setImageUrl(imageUrl);
        post.setCreatedAt(createdAt);
        post.setVideoUrl(videoUrl);
        post.setUser(author); // updated

        
        return postService.createPost(post);
    }

   @GetMapping("/all")
public List<PostResponse> getAllPosts(@RequestParam Long currentUserId) {
    System.out.println("Current User ID: 999999999999 -------9999999999999999999999999 ----" + currentUserId);
    return postService.getAllPosts().stream()
            .map(post -> {
                boolean liked = postService.isPostLikedByUser(post.getId(), currentUserId);
                Long likes = interactionService.getLikesCount(post.getId());
                return new PostResponse(post, liked,likes);
            })
            .toList();
}
    @GetMapping("/all/{id}")
public List<PostResponse> getAllPostsOfUser(@PathVariable Long id,@RequestParam Long currentUserId) {
    User currentuser= userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));;
    return postService.getPostsByUser(currentuser).stream()
            .map(post -> {
                boolean liked = postService.isPostLikedByUser(post.getId(), currentUserId);
                Long likes = interactionService.getLikesCount(post.getId());
                return new PostResponse(post, liked,likes);
            })
            .toList();
}
 @PutMapping("/edit/{id}")
    public ResponseEntity<Post> editPost(@PathVariable Long id, @RequestBody Post updatedPost) {
        try {
            Post post = postService.getPostById(id);
            if (post == null) {
                return ResponseEntity.notFound().build();
            }

            // Update fields
            System.out.println("ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ "  + updatedPost.getImageUrl());
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
    interactionRepository.deleteByPostId(postId);

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
