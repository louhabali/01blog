package com.example.blog.config;

import com.example.blog.entity.*;
import com.example.blog.repository.BlacklistedTokenRepository;
import java.util.Date;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional; // 💡 Import this for cleanup

@Component
public class TokenBlacklist {
    
    private final JwtUtil jwtUtil;
    private final BlacklistedTokenRepository tokenRepository;

    public TokenBlacklist(JwtUtil jwtUtil, BlacklistedTokenRepository tokenRepository) {
        this.jwtUtil = jwtUtil;
        this.tokenRepository = tokenRepository;
    }

    public void add(String token) {
        try {
            // 1. Get the expiration date from the token
            Date expiration = jwtUtil.extractExpiration(token);
            
            if (expiration != null) {
                // 2. Create and save the new BlacklistedToken entity
                BlacklistedToken blacklistedToken = new BlacklistedToken(token, expiration);
                tokenRepository.save(blacklistedToken);
                System.out.println("Token added to DB blacklist: " + token);
            }
        } catch (Exception e) {
            System.err.println("Error parsing or saving token for blacklist: " + e.getMessage());
        }
    }

    public boolean isBlacklisted(String token) {
        // Check if the token exists in the database table
        return tokenRepository.existsByToken(token);
    }
    
    // Cleanup must be transactional to ensure operations are atomic
    @Transactional
    @Scheduled(fixedRate = 3600000) // Every hour
    public void cleanup() {
        Date now = new Date();
        System.out.println("Starting database token blacklist cleanup...");
        // Find all tokens whose expiry date is before the current time
        List<BlacklistedToken> expiredTokens = tokenRepository.findAllByExpiryDateBefore(now);
        // Delete them from the database
        tokenRepository.deleteAll(expiredTokens);
        System.out.println("Cleanup complete. Deleted " + expiredTokens.size() + " expired tokens.");
    }
}