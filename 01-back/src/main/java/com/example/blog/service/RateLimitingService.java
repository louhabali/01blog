package com.example.blog.service;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitingService {

    // Cache to store buckets for each IP address
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    public Bucket resolveBucket(String clientIp) {
        return cache.computeIfAbsent(clientIp, this::newBucket);
    }

    private Bucket newBucket(String clientIp) {
        // Allow 300 requests per 1 minute
        // "Capacity" is the max burst allowed (300)
        // "Refill" adds 300 tokens back every 1 minute
        long capacity = 300; 
        Refill refill = Refill.greedy(300, Duration.ofMinutes(1));
        
        Bandwidth limit = Bandwidth.classic(capacity, refill);

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
}