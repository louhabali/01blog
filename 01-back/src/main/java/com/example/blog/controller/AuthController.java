package com.example.blog.controller;
import java.util.*;
import com.example.blog.config.*;
import com.example.blog.entity.User;
import com.example.blog.repository.UserRepository;
import com.example.blog.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.*;
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
public ResponseEntity<?> register(@RequestBody User user) {
    // 1. Check if username or email already exists
    if (userRepository.findByUsername(user.getUsername()).isPresent()) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Username already taken"));
    }

    if (userRepository.findByEmail(user.getEmail()).isPresent()) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Email already taken"));
    }

    // 2. Hash password (use your UserService)
    userService.register(user);

    // 3. Save user
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
                String token = jwtUtil.generateToken(optionalUser.get().getEmail());

                Cookie cookie = new Cookie("jwt", token);
                cookie.setHttpOnly(true);
                cookie.setPath("/");
                cookie.setMaxAge(24 * 60 * 60);
                response.addCookie(cookie);

                return ResponseEntity.ok().body("{\"message\":\"Login successful\"}");
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
            return ResponseEntity.ok("{\"loggedIn\":true,\"role\":\"" + role + "\"}");
        }
        return ResponseEntity.ok("{\"loggedIn\":false,\"role\":\"" + role + "\" }");
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

