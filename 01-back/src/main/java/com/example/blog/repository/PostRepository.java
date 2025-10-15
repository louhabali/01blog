package com.example.blog.repository;

import com.example.blog.entity.Post;
import com.example.blog.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUser(User user); // updated to match Post entity field
    List<Post> findByUserId(Long id);
    Optional<Post> findById(Long id);
    long countByIsAppropriateFalse(); // count hidden posts
     @Query(value = "SELECT * FROM posts ORDER BY created_at DESC LIMIT :limit OFFSET :offset", nativeQuery = true)
    List<Post> findWithOffsetLimit(@Param("offset") int offset, @Param("limit") int limit);
    void deleteByUserId(Long userId);
}
