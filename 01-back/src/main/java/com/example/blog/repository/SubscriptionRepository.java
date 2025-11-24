package com.example.blog.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.blog.entity.Subscription;
import com.example.blog.entity.User;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    Optional<Subscription> findByFollowerAndFollowed(User follower, User followed);

    boolean existsByFollowerAndFollowed(User follower, User followed);

    void deleteByFollowerAndFollowed(User follower, User followed);
    @Query("SELECT s.follower FROM Subscription s WHERE s.followed = :author")
    List<User> findFollowersByFollowed(@Param("author") User author);
    Long countByFollowed(User user);  // count followers
    Long countByFollower(User user);  // count following
    void deleteByFollowerId(Long userId);
    void deleteByFollowedId(Long userId);
}