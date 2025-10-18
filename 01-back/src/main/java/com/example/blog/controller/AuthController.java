package com.example.blog.controller;
import java.util.*;

import com.example.blog.DTO.RegisterRequest;
import com.example.blog.config.*;
import com.example.blog.entity.User;
import com.example.blog.repository.UserRepository;
import com.example.blog.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.*;
import jakarta.validation.Valid;
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final TokenBlacklist tokenBlacklist;
    public AuthController(UserService userService,
                          UserRepository userRepository,
                          JwtUtil jwtUtil ,TokenBlacklist tokenBlacklist) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil; 
        this.tokenBlacklist = tokenBlacklist;
    }

   @PostMapping("/register")
public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {

    if (userRepository.findByUsername(request.getUsername()).isPresent()) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("username", "Username already taken"));
    }

    if (userRepository.findByEmail(request.getEmail()).isPresent()) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("email", "Email already taken"));
    }

    User user = new User();
    user.setUsername(request.getUsername());
    user.setEmail(request.getEmail());
    user.setPassword(request.getPassword());
    userService.register(user);

    User savedUser = userRepository.save(user);

    return ResponseEntity.status(HttpStatus.CREATED)
            .body(Map.of("message", "User registered successfully", "userId", savedUser.getId()));
}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user, HttpServletResponse response) {

        Optional<User> optionalUser = userRepository.findByUsernameOrEmail(user.getEmail(), user.getEmail());
        if (optionalUser.isPresent()) {
            boolean success = userService.login(optionalUser.get().getEmail(), user.getPassword());
            if (success) {
                Map<String, Object> res = new HashMap<>();
                res.put("message", "Login successful");
                res.put("banned", !optionalUser.get().isEnabled()); 
                if (optionalUser.get().isEnabled() == true) {
                    String token = jwtUtil.generateToken(optionalUser.get().getEmail());
                    Cookie cookie = new Cookie("jwt", token);
                    cookie.setHttpOnly(true);
                    cookie.setPath("/");
                    cookie.setMaxAge(24 * 60 * 60);
                    response.addCookie(cookie);
                }
                // send is the user banned or not
                return ResponseEntity.ok(res);
                //return ResponseEntity.ok().body("{\"message\":\"Login successful\"}");
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("{\"message\":\"Invalid credentials\"}");
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkAuth(HttpServletRequest request) {
        String email = (String) request.getAttribute("userEmail");
        String role = "USER";
        
        if (email != null) {
            // return role and isloggedIn
            User u = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
            role = u.getRole();
            HashMap<String, Object> res = new HashMap<>();
            res.put("loggedIn", true);
            res.put("role", role);
            res.put("currentUserId", u.getId());
            return ResponseEntity.ok(res);
        }
        return ResponseEntity.ok(Map.of("loggedIn", false));
    }

@PostMapping("/logout")
public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
    // extract the JWT token from the cookies
    if (request.getCookies() != null) {
        for (Cookie cookie : request.getCookies()) {
            if ("jwt".equals(cookie.getName())) {
                String token = cookie.getValue();

                // 🧱 add token to blacklist
                tokenBlacklist.add(token);

                break;
            }
        }
    }

    // remove the cookie
    ResponseCookie cookie = ResponseCookie.from("jwt", "")
            .httpOnly(true)
            .path("/")
            .maxAge(0)
            .build();
    response.addHeader("Set-Cookie", cookie.toString());

    return ResponseEntity.ok(Map.of("message", "Logged out"));
}
}

