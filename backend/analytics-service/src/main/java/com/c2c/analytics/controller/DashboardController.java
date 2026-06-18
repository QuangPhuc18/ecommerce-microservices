package com.c2c.analytics.controller;

import com.c2c.analytics.model.AdminLog;
import com.c2c.analytics.service.AdminLogService;
import com.c2c.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class DashboardController {

    private final AnalyticsService analyticsService;
    private final AdminLogService adminLogService;

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        return ResponseEntity.ok(analyticsService.getDashboardStatistics());
    }

    @GetMapping("/logs")
    public ResponseEntity<Page<AdminLog>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminLogService.getLogs(page, size));
    }
}
