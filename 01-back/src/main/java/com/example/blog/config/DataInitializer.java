package com.example.blog.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.example.blog.entity.User;
import com.example.blog.repository.UserRepository;

@Configuration
public class DataInitializer {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    CommandLineRunner init(UserRepository userRepository, PasswordEncoder encoder) {
        return args -> {
            if (userRepository.findByEmail("admin@blog.com").isEmpty()) {
                User admin = new User();
                admin.setEmail("admin@blog.com");
                admin.setUsername("Admin");
                admin.setPassword(encoder.encode("admin123")); // bcrypt password
                admin.setRole("ADMIN"); // just "ADMIN"
                admin.setEnabled(true);;
                userRepository.save(admin);
                System.out.println("✅ Admin created: admin@blog.com / admin123");
            }
        };
    }
}
