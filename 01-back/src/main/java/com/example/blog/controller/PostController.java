package com.example.blog.controller;

import com.example.blog.entity.Post;
import com.example.blog.entity.User;
import com.example.blog.service.PostService;
import com.example.blog.repository.UserRepository;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

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
    public Post createPost(@RequestBody Map<String, Object> body) {
        System.out.println("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ ");
        String title = (String) body.get("title");
        String content = (String) body.get("content");
        Number authorIdNumber = (Number) body.get("authorId");
        Long authorId = authorIdNumber.longValue();

        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = new Post();
        post.setTitle(title);
        post.setContent(content);
        post.setUser(author); // updated

        return postService.createPost(post);
    }

    @GetMapping("/all")
    public List<Post> getAllPosts() {
        return postService.getAllPosts();
    }

    @GetMapping("/user/{userId}")
    public List<Post> getPostsByUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return postService.getPostsByUser(user);
    }
}
