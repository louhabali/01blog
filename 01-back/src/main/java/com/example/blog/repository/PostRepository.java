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
    @Query(value = """
    SELECT * FROM posts
    WHERE (:showAll = true OR is_appropriate = true)
    ORDER BY created_at DESC
    LIMIT :limit OFFSET :offset
""", nativeQuery = true)
List<Post> findWithOffsetLimit(
    @Param("offset") int offset,
    @Param("limit") int limit,
    @Param("showAll") boolean showAll
);
    @Query(value = """
    SELECT p.*
    FROM posts p
    JOIN subscriptions s 
    ON s.followed_id = p.user_id
    WHERE s.follower_id = :currentUserId
    AND (:showAll = true OR p.is_appropriate = true)
    ORDER BY p.created_at DESC
    LIMIT :limit OFFSET :offset
""", nativeQuery = true)
List<Post> findWithOffsetLimitofsubscribed(
    @Param("offset") int offset,
    @Param("limit") int limit,
    @Param("showAll") boolean showAll,
    @Param("currentUserId") Long currentUserId
);
    void deleteByUserId(Long userId);
   
    @Query(value = """
    SELECT * FROM posts WHERE (user_id = :userId AND is_appropriate = true) 
    ORDER BY created_at DESC LIMIT :limit OFFSET :offset
    """, nativeQuery = true)
List<Post> findPostsByUserWithPagination(@Param("userId") Long userId,
                                         @Param("offset") int offset,
                                         @Param("limit") int limit);
    @Query("SELECT COUNT(p) FROM Post p WHERE p.user.id = :userId")
long countByAuthorId(@Param("userId") Long userId);
}
