package com.example.blog.service;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.blog.entity.*;
import com.example.blog.repository.*;
@Service
public class InteractionService {

    private final InteractionRepository interactionRepository;
     private final PostRepository postrepo;

    public InteractionService(InteractionRepository interactionRepository,PostRepository postr) {
        this.interactionRepository = interactionRepository;
        this.postrepo = postr;
    }

    @Transactional
    public boolean toggleLike(User user, Post post) {
        return interactionRepository.findByUserAndPost(user, post)
            .map(interaction -> {
                interaction.setState(!interaction.getState());
                interactionRepository.save(interaction);
                return interaction.getState();
            })
            .orElseGet(() -> {
                Interaction interaction = new Interaction();
                interaction.setUser(user);
                interaction.setPost(post);
                interaction.setState(true);
                interactionRepository.save(interaction);
                return true;
            });
    }
    public long getLikesCount(Long postId) {
    Post post = postrepo.findById(postId).orElseThrow();
    return interactionRepository.countByPostAndLikedTrue(post);
}
}
