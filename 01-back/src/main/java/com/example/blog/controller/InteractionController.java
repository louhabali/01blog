package com.example.blog.controller;
import com.example.blog.repository.*;
import com.example.blog.service.*;
import org.springframework.web.bind.annotation.*;
import com.example.blog.entity.*;
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
    public boolean toggleLike(@PathVariable Long postId, @RequestParam Long userId) {
        System.out.println("sssssssssssssssssssssssssssssssssssssssssssssssssssssssssss");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        return interactionService.toggleLike(user, post);
    }
    @GetMapping("/count/{postId}")
public long getLikesCount(@PathVariable Long postId) {
    return interactionService.getLikesCount(postId);
}
}
