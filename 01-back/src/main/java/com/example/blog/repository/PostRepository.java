package com.example.blog.repository;

import com.example.blog.entity.Post;
import com.example.blog.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
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
                AND (
                    (CAST(:lastPostCreatedAt AS timestamp) IS NULL) OR
                    (created_at < :lastPostCreatedAt) OR
                    (created_at = :lastPostCreatedAt AND id > :lastPostId)
                )
                ORDER BY created_at DESC, id ASC
                LIMIT :limit
            """, nativeQuery = true)
    List<Post> findGlobalFeed(
            @Param("limit") int limit,
            @Param("showAll") boolean showAll,
            @Param("lastPostCreatedAt") LocalDateTime lastPostCreatedAt,
            @Param("lastPostId") Long lastPostId);

    @Query(value = """
                SELECT p.*
                FROM posts p
                LEFT JOIN subscriptions s
                ON s.followed_id = p.user_id
                WHERE (
                    s.follower_id = :currentUserId
                    OR p.user_id = :currentUserId
                )
                AND (:showAll = true OR p.is_appropriate = true)
                AND (
                    (CAST(:lastPostCreatedAt AS timestamp) IS NULL) OR
                    (p.created_at < :lastPostCreatedAt) OR
                    (p.created_at = :lastPostCreatedAt AND p.id > :lastPostId)
                )
                ORDER BY p.created_at DESC , p.id ASC
                LIMIT :limit
            """, nativeQuery = true)
    List<Post> findWithOffsetLimitofsubscribed(
            @Param("limit") int limit,
            @Param("showAll") boolean showAll,
            @Param("currentUserId") Long currentUserId,
            @Param("lastPostCreatedAt") LocalDateTime lastPostCreatedAt,
            @Param("lastPostId") Long lastPostId);

    void deleteByUserId(Long userId);

    @Query(value = """
            SELECT * FROM posts WHERE (user_id = :userId AND is_appropriate = true)
            AND (
                (CAST(:lastPostCreatedAt AS timestamp) IS NULL) OR
                (created_at < :lastPostCreatedAt) OR
                (created_at = :lastPostCreatedAt AND id > :lastPostId)
            )
            ORDER BY created_at DESC , id ASC
            LIMIT :limit 
            """, nativeQuery = true)
    List<Post> findPostsByUserWithPagination(@Param("userId") Long userId,
            @Param("limit") int limit,
            @Param("lastPostCreatedAt") LocalDateTime lastPostCreatedAt,
            @Param("lastPostId") Long lastPostId
    );

    @Query("SELECT COUNT(p) FROM Post p WHERE p.user.id = :userId AND p.isAppropriate = true")
    long countByAuthorId(@Param("userId") Long userId);
}
