package com.example.blog.controller;

import com.example.blog.entity.Notification;
import com.example.blog.entity.User;
import com.example.blog.repository.UserRepository;
import com.example.blog.service.NotificationService;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService svc;
    private final UserRepository ur;

    public NotificationController(NotificationService svc, UserRepository ur) {
        this.svc = svc;
        this.ur = ur;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Notification>> list(@PathVariable long userId, Principal p) {
        if (p == null) {
            System.out.println("PRINCIPAL NULL");

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String username = p.getName();
        Optional<User> u = ur.findByUsername(username);
        if (u.isEmpty()) {
            System.out.println("userprincipal NULL");

            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        if (u.get().getId() != userId) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "you dont have access here");
        }
        List<Notification> notifications = svc.getNotificationsFor(u.get().getId());

        // 4. Return the list with a 200 OK status
        return ResponseEntity.ok(notifications);
    }

    @PostMapping("/mark-as-seen")
    public void markSeen() {
        svc.markAllAsSeen();
    }

}
