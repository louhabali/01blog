package com.example.blog.controller;

import com.example.blog.entity.*;

import com.example.blog.service.*;

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
    public List<Comment> getComments(@PathVariable Long postId) {
        System.out.println("88888888888888888888888888888888888888888888888888888888888888888888888888888888888888888 "+ postId);
        Post post = postService.getPostById(postId);
        return commentService.getCommentsByPost(post);
    }

    @PostMapping
    public Comment addComment(@RequestBody CommentDTO dto) {
        User user = userService.getUserById(dto.userId);
        Post post = postService.getPostById(dto.postId);

        Comment comment = new Comment();
        comment.setContent(dto.content);
        comment.setUser(user);
        comment.setPost(post);

        return commentService.addComment(comment);
    }

    public static class CommentDTO {
        public Long userId;
        public Long postId;
        public String content;
    }
}   
