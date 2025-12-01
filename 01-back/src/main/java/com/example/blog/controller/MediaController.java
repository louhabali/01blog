package com.example.blog.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    private final String UPLOAD_DIR = "uploads/";
    private final long MAX_FILE_SIZE = 200 * 1024 * 1024; 
    
    // Allowed MIME types: JPEG, PNG, GIF, MP4, WebM
    private final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            MediaType.IMAGE_JPEG_VALUE, 
            MediaType.IMAGE_PNG_VALUE, 
            MediaType.IMAGE_GIF_VALUE,
           "image/webp",
            "video/mp4", 
            "video/webm",
            "video/ogg"
    );

    @PostMapping("/upload")
    public String uploadFile(@RequestParam("file") MultipartFile file) {

        // --- 1. Basic Validation ---
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File size exceeds 200MB limit.");
        }

        String mimeType = file.getContentType();
        if (mimeType == null || !ALLOWED_MIME_TYPES.contains(mimeType.toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Unsupported file type: " + mimeType);
        }

     String originalFilename = Objects.requireNonNull(file.getOriginalFilename());
        String fileExtension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            fileExtension = originalFilename.substring(dotIndex); // Includes the dot, e.g., ".mp4"
        }
        
        // Generate a unique file name using UUID
        String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

        try {
            // Create directory if it doesn't exist
            Files.createDirectories(Path.of(UPLOAD_DIR));

            // Full path for the file
            Path filePath = Path.of(UPLOAD_DIR + uniqueFileName);

            // Save the file
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // --- 3. Return URL ---
            // Frontend will need to store this URL in the PostRequest DTO array.
            return "http://localhost:8087/uploads/" + uniqueFileName;

        } catch (Exception e) {
            // Log the error for debugging
            System.err.println("File upload failed: " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "File upload failed due to a server error.");
        }
    }
}