package com.example.media_service.controller;

import com.example.media_service.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;
    
    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadFiles(@RequestParam("files") MultipartFile[] files) {
        List<String> fileUrls = new ArrayList<>();
        
        for (MultipartFile file : files) {
            String fileName = mediaService.storeFile(file);
            // Construct the URL to access the file
            String fileUrl = "/media/images/" + fileName;
            fileUrls.add(fileUrl);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", 200);
        response.put("message", "Files uploaded successfully");
        response.put("urls", fileUrls);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/images/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(fileName);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                String contentType = "application/octet-stream";
                if (fileName.toLowerCase().endsWith(".png")) contentType = "image/png";
                else if (fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".jpeg")) contentType = "image/jpeg";
                else if (fileName.toLowerCase().endsWith(".gif")) contentType = "image/gif";

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
