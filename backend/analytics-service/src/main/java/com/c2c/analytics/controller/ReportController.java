package com.c2c.analytics.controller;

import com.c2c.analytics.model.SystemReport;
import com.c2c.analytics.service.ReportService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<SystemReport> createReport(@Valid @RequestBody CreateReportRequest request) {
        UUID reporterId = UUID.randomUUID();
        SystemReport report = reportService.createReport(reporterId, request.getProductId(), request.getReason(), request.getDescription());
        return ResponseEntity.status(HttpStatus.CREATED).body(report);
    }

    @GetMapping
    public ResponseEntity<Page<SystemReport>> getReports(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(reportService.getReports(status, page, size));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<SystemReport> resolveReport(@PathVariable UUID id) {
        UUID adminId = UUID.randomUUID();
        return ResponseEntity.ok(reportService.resolveReport(id, adminId));
    }
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class CreateReportRequest {
    @NotNull
    private Long productId;

    @NotBlank
    private String reason;

    private String description;
}
