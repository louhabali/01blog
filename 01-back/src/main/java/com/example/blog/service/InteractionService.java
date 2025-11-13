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
                System.out.println("INTERACTION FOUND, TOGGLING LIKE BEFORE STATE :: " +interaction.getLiked());
                interaction.setLiked(!interaction.getLiked());
                System.out.println("INTERACTION FOUND, TOGGLING LIKE AFTER STATE :: " +interaction.getLiked());
                interactionRepository.save(interaction);
                return interaction.getLiked();
            })
            .orElseGet(() -> {
                Interaction interaction = new Interaction();
                interaction.setUser(user);
                interaction.setPost(post);
                interaction.setLiked(true);
                interactionRepository.save(interaction);
                return true;
            });
            // if user interact first time
    }
    public long getLikesCount(Long postId) {
    Post post = postrepo.findById(postId).orElseThrow();
    return interactionRepository.countByPostAndLikedTrue(post);
}
}
