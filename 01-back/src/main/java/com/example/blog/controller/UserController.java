package com.example.blog.controller;
import java.io.File;
import com.example.blog.entity.Post;
import com.example.blog.entity.User;
import com.example.blog.service.UserService;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.blog.repository.PostRepository;
import com.example.blog.repository.UserRepository;

import java.util.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PostRepository postrepo;
    public UserController(UserService userService,UserRepository userRepository,PostRepository postrepo) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.postrepo = postrepo;
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

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long id) {
        System.out.println("yaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaayyyyy"+id);
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("avatar", user.getAvatar());

        return ResponseEntity.ok(response);
    }
      @PostMapping("/{id}/avatar")
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @PathVariable Long id,
            @RequestParam("avatar") MultipartFile file
    ) {
        try {
            // Create uploads folder if not exists
            String uploadDir = System.getProperty("user.dir") + "/uploads/";
            File directory = new File(uploadDir);
            if (!directory.exists()) directory.mkdirs();

            // Save file with unique name
            String filename = id + "_" + file.getOriginalFilename();
            File dest = new File(uploadDir + filename);
            file.transferTo(dest);

            // Build URL for frontend
            String avatarUrl = "http://localhost:8087/uploads/" + filename;

            // Update user in DB
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            user.setAvatar(avatarUrl);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("avatarUrl", avatarUrl));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Avatar upload failed"));
        }
    }
}
