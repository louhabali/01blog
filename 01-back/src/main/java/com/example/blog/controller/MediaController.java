package com.example.blog.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    @PostMapping("/upload")
    public String uploadFile(@RequestParam("file") MultipartFile file) {
        // Path inside container (matches Docker volume)
        String uploadDir = "/app/uploads/";

        try {
            // Create directory if it doesn't exist
            Files.createDirectories(Path.of(uploadDir));

            // Full path for the file
            Path filePath = Path.of(uploadDir + file.getOriginalFilename());

            // Save the file
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return URL for frontend
            return "http://localhost:8087/uploads/" + file.getOriginalFilename();

        } catch (Exception e) {
            throw new RuntimeException("File upload failed", e);
        }
    }
}
