package com.example.blog.controller;

import com.example.blog.entity.*;

import com.example.blog.service.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts/{postId}/comments")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class CommentController {

    private final CommentService commentService;
    private final UserService userService;
    private final PostService postService;

    public CommentController(CommentService commentService, UserService userService, PostService postService) {
        this.commentService = commentService;
        this.userService = userService;
        this.postService = postService;
    }

  @GetMapping
public List<Comment> getComments(
        @PathVariable Long postId,
        @RequestParam(defaultValue = "10") int limit,
        @RequestParam(defaultValue = "0") int offset) {

    return commentService.getCommentsByPostWithLimit(postId, limit, offset);
}

    @PostMapping
    public ResponseEntity<?> addComment(@RequestBody CommentDTO dto) {
        if (dto.userId == null || dto.userId == 0) {
             return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                             .body("You must log in to submit a report");
        }
        User user = userService.getUserById(dto.userId);
        Post post = postService.getPostById(dto.postId);

        Comment comment = new Comment();
        comment.setContent(dto.content);
        comment.setUser(user);
        comment.setPost(post);
        
        commentService.addComment(comment);
        return ResponseEntity.ok(comment);
    }

    public static class CommentDTO {
        public Long userId;
        public Long postId;
        public String content;
    }
}   
