package com.example.blog.service;

import com.example.blog.entity.Interaction;
import com.example.blog.entity.Post;
import com.example.blog.entity.User;
import com.example.blog.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final InteractionRepository interactionRepository;
    public PostService(PostRepository postRepository,InteractionRepository interactionRepository) {
        this.postRepository = postRepository;
        this.interactionRepository = interactionRepository;
    }

    public Post createPost(Post post) {
        return postRepository.save(post);
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public List<Post> getPostsByUser(User user) {
        return postRepository.findByUser(user);
    }

    public void deletePost(Long id) {
        postRepository.deleteById(id);
    }

    public Post updatePost(Post post) {
        return postRepository.save(post);
    }
    public Post getPostById(Long id) {
    return postRepository.findById(id).orElseThrow(() -> new RuntimeException("Post not found"));
}

public Post savePost(Post post) {
    return postRepository.save(post);
}
public boolean isPostLikedByUser(Long postId, Long userId) {
    return interactionRepository.findByPostIdAndUserId(postId, userId)
            .map(Interaction::getState)
            .orElse(false);
}

}
