package com.example.blog.entity;
import jakarta.persistence.*;

@Entity
@Table(
    name = "subscriptions",
    uniqueConstraints = @UniqueConstraint(columnNames = {"follower_id", "followed_id"})
)
public class Subscription {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The one who follows
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "follower_id", nullable = false)
    private User follower;

    // The one being followed
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "followed_id", nullable = false)
    private User followed;

    public Subscription() {}

    public Subscription(User follower, User followed) {
        this.follower = follower;
        this.followed = followed;
    }

    public Long getId() { return id; }
    public User getFollower() { return follower; }
    public void setFollower(User follower) { this.follower = follower; }
    public User getFollowed() { return followed; }
    public void setFollowed(User followed) { this.followed = followed; }
}
