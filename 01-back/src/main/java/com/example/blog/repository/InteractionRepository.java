package com.example.blog.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.example.blog.entity.Interaction;
import com.example.blog.entity.Post;
import com.example.blog.entity.User;

public interface InteractionRepository extends JpaRepository<Interaction, Long> {
    
    Optional<Interaction> findByUserAndPost(User user, Post post);
    
    long countByPostAndLikedTrue(Post post);
    
    Optional<Interaction> findByPostIdAndUserId(Long postId, Long userId);
    
    @Transactional
    @Modifying
    @Query(value = "DELETE FROM interactions WHERE post_id = :postId", nativeQuery = true)
    void deleteByPostId(@Param("postId") Long postId);
    void deleteByUserId(Long userId);
}
