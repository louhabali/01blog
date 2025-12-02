package com.example.blog.repository;
import com.example.blog.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    @Query(value = "SELECT * FROM comment WHERE post_id = :postId ORDER BY created_at DESC LIMIT :limit OFFSET :offset", 
       nativeQuery = true)
List<Comment> findCommentsByPostWithLimit(
    @Param("postId") Long postId,
    @Param("limit") int limit,
    @Param("offset") int offset
);

    void deleteByPostId(Long postId);
    void deleteByUserId(Long userId);
    void deleteByPost_UserId(Long userId);
}
