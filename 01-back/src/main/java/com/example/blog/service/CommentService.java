package com.example.blog.service;
import com.example.blog.entity.*;

import com.example.blog.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;

    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    public Comment addComment(Comment comment) {
        return commentRepository.save(comment);
    }

   public List<Comment> getCommentsByPostWithLimit(Long postId, int limit, int offset) {
        return commentRepository.findCommentsByPostWithLimit(postId, limit, offset);
    }
    public Comment getCommentById(Long id) {
        return commentRepository.findById(id).orElse(null);
    }

    public void updateComment(Comment comment) {
        commentRepository.save(comment);
    }

    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }
}
