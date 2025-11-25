package com.example.blog.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "blacklisted_tokens")
public class BlacklistedToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Store the full token string. Ensure your database column can handle its length.
    @Column(name = "token", nullable = false, length = 500)
    private String token;

    // The date/time when this token naturally expires (used for cleanup)
    @Column(name = "expiry_date", nullable = false)
    private Date expiryDate;

    public BlacklistedToken() {}

    public BlacklistedToken(String token, Date expiryDate) {
        this.token = token;
        this.expiryDate = expiryDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Date getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(Date expiryDate) {
        this.expiryDate = expiryDate;
    }
}