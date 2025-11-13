package com.example.blog.entity;
import jakarta.persistence.*;

@Entity
@Table(name = "interactions")
public class Interaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;

    private Boolean liked = false; 
     public Long getId(){
        return this.id;
    }
    public Boolean getLiked(){
        return this.liked;
    }
    public void setLiked(boolean newliked){
        this.liked = newliked;
    }
    public User getUser() { return user; } 
    public void setUser(User user) { this.user = user; } 
    public Post getPost() { return post; }
    public void setPost(Post post) { this.post = post; }
}
