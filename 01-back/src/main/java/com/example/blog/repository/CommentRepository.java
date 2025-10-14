package com.example.blog.repository;
import com.example.blog.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPost(Post post);
    void deleteByPostId(Long postId);
    void deleteByUserId(Long userId);
}
