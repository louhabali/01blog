package com.example.blog.DTO;

import java.time.LocalDateTime;

public record NotificationDTO(
    Long id,
    Long actorId,
    String type,
    String message,
    Long postId,
    LocalDateTime createdAt,
    boolean seen
) {}