package com.example.blog.DTO;
import java.time.LocalDateTime;
import java.util.List; // Import List

import com.example.blog.entity.*;

public class PostResponse {
    private Long id;
    private String title;
    private String content;
    private String authorName;
    private long authorId;
    private boolean liked;
    private long likes;
    // MODIFIED: Replaced single media fields with a list
    private List<String> mediaUrls; 
    
    private String avatar;
    private LocalDateTime createdAt; 
    private boolean isAppropriate;

    // Constructor
    public PostResponse(Post post, boolean liked, Long likes) {
        this.id = post.getId();
        this.isAppropriate = post.isAppropriate();
        this.createdAt = post.getCreatedAt();
        this.likes = likes;
        this.avatar = post.getUser().getAvatar();
        this.title = post.getTitle();
        this.content = post.getContent();
        this.authorName = post.getUser().getUsername(); 
        this.authorId = post.getUser().getId();
        this.liked = liked;
        // NEW/MODIFIED: Use the list of media URLs from the Post entity
        this.mediaUrls = post.getMediaUrls(); 
        // Removed imageUrl and videoUrl mapping
    }

    // Getters and setters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public String getAuthorName() { return authorName; }
    public Long getAuthorId() { return authorId; }
    public boolean isLiked() { return liked; }
    public Long getLikes() { return likes ; }
    
    // NEW/MODIFIED: Getter for the list of media URLs
    public List<String> getMediaUrls() { return mediaUrls; }
    
    // Removed getImageUrl and getVideoUrl

    public LocalDateTime getCreatedAT() { return createdAt ; }
    public boolean getAppropriate() { return isAppropriate ; }
    public String getAvatar() { return avatar ; }
    
}