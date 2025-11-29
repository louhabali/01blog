package com.example.blog.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List; // Import List

import com.example.blog.handlers.MediaUrlListConverter;

@Entity
@Table(name = "posts")
public class Post {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Size(max = 500)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @Column(nullable=false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean isAppropriate = true;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;
    
    // MODIFIED: Replaced imageUrl and videoUrl with a list of media URLs
    @Convert(converter = MediaUrlListConverter.class)
    @Column(columnDefinition = "TEXT") // Use TEXT for the potentially long JSON string
    private List<String> mediaUrls;

    private LocalDateTime createdAt = LocalDateTime.now();
    
    @PrePersist
    protected void onCreate() {
      this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    // NEW/MODIFIED: Getter and Setter for the list of media URLs
    public List<String> getMediaUrls() { return mediaUrls; }
    public void setMediaUrls(List<String> mediaUrls) { this.mediaUrls = mediaUrls; }

    public boolean isAppropriate() { return isAppropriate; }
    public void setisAppropriate(boolean appropriate) { this.isAppropriate = appropriate; }
    

}