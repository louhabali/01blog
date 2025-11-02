package com.example.blog.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
@RestController
@RequestMapping("/api/media")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class MediaController {

    @PostMapping("/upload")
public String uploadFile(@RequestParam("file") MultipartFile file) {
    // Absolute path inside your project
    String uploadDir = System.getProperty("user.dir") + "/uploads/";  
    File directory = new File(uploadDir);
    if (!directory.exists()) {
        directory.mkdirs();
    }

    String filePath = uploadDir + file.getOriginalFilename();
    try {
        file.transferTo(new File(filePath));
    } catch (Exception e) {
        
        throw new RuntimeException("File upload failed", e);
    }

    // Return URL that frontend can use
    return "http://localhost:8087/uploads/" + file.getOriginalFilename();
}
}
