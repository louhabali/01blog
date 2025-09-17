package com.example.blog.controller;

import com.example.blog.entity.User;
import com.example.blog.service.UserService;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.blog.repository.UserRepository;
import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService,UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    // GET /users - list all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/make-admin")
    public ResponseEntity<User> makeAdmin(@PathVariable Long id) {
        User adminUser = userService.makeAdmin(id);
        return ResponseEntity.ok(adminUser);
    }
    @GetMapping("/me")
public User getCurrentUser(HttpServletRequest request) {
    String email = (String) request.getAttribute("userEmail");
    return userRepository.findByUsernameOrEmail(email, email).orElseThrow();
}
}
