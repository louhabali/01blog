package com.example.blog.config;

import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
@Component
public class TokenBlacklist {
    private final Map<String, Long> blacklist = new ConcurrentHashMap<>();
    private final JwtUtil jwtUtil;

    public TokenBlacklist(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    public void add(String token) {
        try {
            // Get the expiration date from the token
            Date expiration = jwtUtil.extractExpiration(token); 
            if (expiration != null) {
                // Store the token string and its expiry timestamp
                blacklist.put(token, expiration.getTime());
                System.out.println("Token added to blacklist: " + token);
            }
        } catch (Exception e) {
            // Log the error, but don't crash
            System.err.println("Error parsing token for blacklist: " + e.getMessage());
        }
    }

    public boolean isBlacklisted(String token) {
        return blacklist.containsKey(token);
    }
    // run automatically every hour
    @Scheduled(fixedRate = 3600000)
    public void cleanup() {
        long now = System.currentTimeMillis();
        System.out.println("clean token blacklist");
        blacklist.entrySet().removeIf(entry -> entry.getValue() <= now);
        
        System.out.println("cleanup complete , Blacklist size: " + blacklist.size());
    }
}