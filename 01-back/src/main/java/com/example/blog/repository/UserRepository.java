package com.example.blog.repository;

import com.example.blog.entity.User;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.*;


public interface UserRepository extends JpaRepository<User, Long> {

    // Find a user by username OR email
    Optional<User> findByUsernameOrEmail(String username, String email);
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findById(long id);
    long countByEnabledFalse(); // count banned users
   @Query(value = """
            SELECT * FROM users 
            WHERE (CAST(:lastUserId AS bigint) IS NULL) OR (id > :lastUserId) 
            ORDER BY id ASC 
            LIMIT :limit
            """, nativeQuery = true)
    List<User> findNextPage(
            @Param("limit") int limit,
            @Param("lastUserId") Long lastUserId);

        List<User> findByUsernameContainingIgnoreCase(String username);
}