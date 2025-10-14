package com.example.blog.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
public class Post {

 @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // << this is important
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;
     @Column(nullable=false ,columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean isAppropriate = true;

@ManyToOne
@JoinColumn(name = "user_id",referencedColumnName = "id")
private User user;
private String imageUrl;   // e.g. "http://localhost:8080/uploads/pic.jpg"
private String videoUrl;   // e.g. "http://localhost:8080/uploads/clip.mp4"
private LocalDateTime createdAt = LocalDateTime.now();
@PrePersist
protected void onCreate() {
  this.createdAt = LocalDateTime.now();
}

// getters and setters
public Long getId() { return id; }
public void setId(Long id) { this.id = id; }

public String getTitle() { return title; }
public void setTitle(String title) { this.title = title; }

public String getContent() { return content; }
public void setContent(String content) { this.content = content; }

public LocalDateTime getCreatedAt() { return createdAt; }
public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

public User getUser() { return user; } // updated
public void setUser(User user) { this.user = user; } // updated
public String getImageUrl() { return imageUrl; }
public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

public String getVideoUrl() { return videoUrl; }
public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
public boolean isAppropriate() { return isAppropriate; }
public void setisAppropriate(boolean hidden) { this.isAppropriate = hidden; }
}
