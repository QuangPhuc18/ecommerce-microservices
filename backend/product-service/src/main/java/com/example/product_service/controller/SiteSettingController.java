package com.example.product_service.controller;

import com.example.product_service.service.SiteSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/products/settings")
@RequiredArgsConstructor
public class SiteSettingController {

    private final SiteSettingService siteSettingService;

    @GetMapping
    public ResponseEntity<Map<String, String>> getAllSettings() {
        return ResponseEntity.ok(siteSettingService.getAllSettings());
    }

    @PutMapping
    public ResponseEntity<Void> updateSettings(@RequestBody Map<String, String> settings) {
        siteSettingService.updateSettings(settings);
        return ResponseEntity.ok().build();
    }
}
