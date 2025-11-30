package com.example.blog.controller;

import com.example.blog.entity.*;

import com.example.blog.service.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/posts/{postId}/comments")
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
        if (dto.content.length() > 100){
             return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                             .body("Content cannot exceed 100 chars.");
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

    @PutMapping("/{commentId}")
    public ResponseEntity<?> editComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @RequestBody CommentDTO dto) {
            
        Comment existing = commentService.getCommentById(commentId);
        if (existing == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Comment not found");
        }

        if (!existing.getUser().getId().equals(dto.userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only edit your own comments");
        }
        if (dto.content.length() > 100){
             return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                             .body("Content cannot exceed 100 chars.");
        }
        existing.setContent(dto.content);
        commentService.updateComment(existing);

        return ResponseEntity.ok(existing);
    }
      @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @RequestParam Long userId) {

        Comment existing = commentService.getCommentById(commentId);
        if (existing == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Comment not found");
        }

        if (!existing.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only delete your own comments");
        }

        commentService.deleteComment(commentId);
        return ResponseEntity.ok(Map.of("message", "Comment deleted successfully"));
    }

    public static class CommentDTO {
        public Long userId;
        public Long postId;
        public String content;
    }
}   
