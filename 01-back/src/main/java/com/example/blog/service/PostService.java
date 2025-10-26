package com.example.blog.service;

import com.example.blog.entity.*;
import com.example.blog.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final InteractionRepository interactionRepository;
    private final SubscriptionRepository subrepo;
    private final NotificationRepository notifrepo;
    private final NotificationService notifservice;
    private final UserRepository userRepository;

    public PostService(UserRepository userRepository, NotificationService notifservice,NotificationRepository notifrepo,SubscriptionRepository subrepo,PostRepository postRepository,InteractionRepository interactionRepository) {
        this.postRepository = postRepository;
        this.interactionRepository = interactionRepository;
        this.subrepo =subrepo;
        this.notifrepo = notifrepo;
        this.notifservice = notifservice;
        this.userRepository = userRepository;
    }

    public Post createPost(Post post) {
        User author = post.getUser(); 
        Post savedPost = postRepository.save(post);
    List<User> followers = subrepo.findFollowersByFollowed(author);
    
    // 2️⃣ Loop through followers and create a notification for each
    for (User follower : followers) {
        Notification n = new Notification();
        n.setRecipientId(follower.getId()); // the follower
        n.setActorId(author.getId());              // the one who posted
        n.setType("POST");
        n.setPostId(savedPost.getId());
        n.setMessage(savedPost.getUser().getUsername() + " has posted a new update!");

        // Save to DB
        n = notifrepo.save(n);

        // Push in real time (optional)
       
        notifservice.pushNotification(userRepository.getById(n.getRecipientId()).getUsername() ,n);
    }
        return savedPost;
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
    // Save the post first
    
    Post savedPost = postRepository.save(post);
    return savedPost;
}
public boolean isPostLikedByUser(Long postId, Long userId) {
    return interactionRepository.findByPostIdAndUserId(postId, userId)
            .map(Interaction::getState)
            .orElse(false);
}

}
