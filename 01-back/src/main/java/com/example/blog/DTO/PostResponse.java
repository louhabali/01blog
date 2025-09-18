package com.example.blog.DTO;
import com.example.blog.entity.*;
//DTO => 
public class PostResponse {
    private Long id;
    private String title;
    private String content;
    private String authorName;
    private long authorId;
    private boolean liked;

    // Constructor
    public PostResponse(Post post, boolean liked) {
        this.id = post.getId();
        this.title = post.getTitle();
        this.content = post.getContent();
        this.authorName = post.getUser().getUsername(); 
        this.authorId = post.getUser().getId();
        this.liked = liked;
    }

    // Getters and setters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public String getAuthorName() { return authorName; }
    public Long getAuthorId() { return authorId; }
    public boolean isLiked() { return liked; }
}
