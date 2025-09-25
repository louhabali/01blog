package com.example.blog.controller;

import com.example.blog.entity.Notification;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class NotificationWSController {

    @MessageMapping("/notifications")   // client sends to /app/notifications
    @SendTo("/topic/notifications")     // broadcast to /topic/notifications
    public Notification send(Notification notification) {
        return notification;
    }
}
