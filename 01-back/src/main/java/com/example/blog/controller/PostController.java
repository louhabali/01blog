package com.example.blog.controller;

import com.example.blog.entity.Post;
import com.example.blog.entity.User;
import com.example.blog.service.PostService;
import com.example.blog.repository.UserRepository;

import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/posts")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class PostController {

    private final PostService postService;
    private final UserRepository userRepository;

    public PostController(PostService postService, UserRepository userRepository) {
        this.postService = postService;
        this.userRepository = userRepository;
    }

    @PostMapping("/create")
    public Post createPost(@RequestBody Post post, HttpServletRequest request) {
        String email = (String) request.getAttribute("userEmail"); // from JWT filter
        User author = userRepository.findByUsernameOrEmail(email,email).orElseThrow();
        post.setUser_id(author);
        return postService.createPost(post);
    }

    @GetMapping("/all")
    public List<Post> getAllPosts() {
        return postService.getAllPosts();
    }

    @GetMapping("/me")
    public List<Post> getMyPosts(HttpServletRequest request) {
        String email = (String) request.getAttribute("userEmail");
        User user = userRepository.findByUsernameOrEmail(email,email).orElseThrow();
        return postService.getPostsByUser(user);
    }
}
