package com.example.blog.service;
import java.util.*;

import com.example.blog.entity.User;
import com.example.blog.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
     public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    public User getUserById(long id){
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        User user = optionalUser.get();
        return user;
    }
    public User makeAdmin(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setRole("ADMIN");
        return userRepository.save(user);
    }
    // loginooooooooooooo
    public boolean login(String identifier, String password) {
        // identifier can be username or email
        Optional<User> userOpt = userRepository.findByUsernameOrEmail(identifier, identifier);

        return userOpt.map(user -> encoder.matches(password, user.getPassword()))
                      .orElse(false);
    }

    public User register(User user) {
        // encode password before saving
        user.setPassword(encoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
}
