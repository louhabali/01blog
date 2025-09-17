package com.example.blog.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import com.example.blog.entity.*;
public interface InteractionRepository extends JpaRepository<Interaction, Long> {
    Optional<Interaction> findByUserAndPost(User user, Post post);
     long countByPostAndLikedTrue(Post post);
      Optional<Interaction> findByPostIdAndUserId(Long postId, Long userId);
}
