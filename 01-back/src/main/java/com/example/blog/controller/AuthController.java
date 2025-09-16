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

    public AuthController(UserService userService,
                          UserRepository userRepository,
                          JwtUtil jwtUtil) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil; 
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
        if (email != null) {
            return ResponseEntity.ok("{\"loggedIn\":true, \"email\":\"" + email + "\"}");
        }
        return ResponseEntity.ok("{\"loggedIn\":false}");
    }

@PostMapping("/logout")
public ResponseEntity<?> logout(HttpServletResponse response) {
    ResponseCookie cookie = ResponseCookie.from("jwt", "")
            .httpOnly(true)
            .path("/")
            .maxAge(0)
            .build();
    response.addHeader("Set-Cookie", cookie.toString());

    return ResponseEntity.ok(Map.of("message", "Logged out"));
}
}

