package com.example.blog.DTO;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List; // Import List

public class PostRequest {
    // Removed @NotBlank to allow posts with only media
    @Size(min = 5 , max = 100, message = "Title cannot be less than 5 or exceed 100 characters")
    private String title;

    @Size(min=5 ,max = 1000, message = "Content cannot be less than 5 or  exceed 1000 characters")
    private String content;

    // MODIFIED: Replaced single media fields with a list
    private List<String> mediaUrls;

    private LocalDateTime createdAt;
    private Long authorId;

    // ✅ Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    // NEW/MODIFIED: Getter and Setter for the list of media URLs
    public List<String> getMediaUrls() { return mediaUrls; }
    public void setMediaUrls(List<String> mediaUrls) { this.mediaUrls = mediaUrls; }

    // Removed getImageUrl/setVideoUrl

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }
}