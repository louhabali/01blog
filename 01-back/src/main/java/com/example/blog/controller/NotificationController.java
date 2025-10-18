package com.example.blog.controller;

import com.example.blog.entity.Notification;
import com.example.blog.service.NotificationService;

import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class NotificationController {

    private final NotificationService svc;

    public NotificationController(NotificationService svc) {
        this.svc = svc;
    }

    @GetMapping("/{userId}")
    public List<Notification> list(@PathVariable Long userId) {
        System.out.println("+++++++++++++++++++++++++++++USEEERIDDDD "+ userId);
        return svc.getNotificationsFor(userId);
    }
    @PostMapping("/mark-as-seen")
    public void markSeen() {
        svc.markAllAsSeen();
    }
}
