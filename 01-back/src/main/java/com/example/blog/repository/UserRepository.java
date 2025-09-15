package com.example.blog.repository;

import com.example.blog.entity.User;


import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;


public interface UserRepository extends JpaRepository<User, Long> {

    // Find a user by username OR email
    Optional<User> findByUsernameOrEmail(String username, String email);

}