package com.example.blog.repository;

import com.example.blog.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Date;
import java.util.List;

@Repository
public interface BlacklistedTokenRepository extends JpaRepository<BlacklistedToken, Long> {

    /**
     * Checks if a token is present in the blacklist.
     */
    boolean existsByToken(String token);

    /**
     * Finds all tokens that have expired (before the current time).
     */
    List<BlacklistedToken> findAllByExpiryDateBefore(Date now);
}