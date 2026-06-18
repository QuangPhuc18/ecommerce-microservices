package com.c2c.analytics.service;

import com.c2c.analytics.model.SystemReport;
import com.c2c.analytics.repository.SystemReportRepository;
import com.c2c.shared.exception.BusinessException;
import com.c2c.shared.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final SystemReportRepository reportRepository;

    @Transactional
    public SystemReport createReport(UUID reporterId, Long productId, String reason, String description) {
        SystemReport report = SystemReport.builder()
                .reporterId(reporterId)
                .productId(productId)
                .reason(reason)
                .description(description)
                .build();
        report = reportRepository.save(report);
        log.info("Report created: id={}, productId={}, reporterId={}", report.getId(), productId, reporterId);
        return report;
    }

    public Page<SystemReport> getReports(String status, int page, int size) {
        if (status != null && !status.isEmpty()) {
            return reportRepository.findByStatus(status, PageRequest.of(page, size));
        }
        return reportRepository.findAll(PageRequest.of(page, size));
    }

    @Transactional
    public SystemReport resolveReport(UUID reportId, UUID adminId) {
        SystemReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND, "Report not found"));
        report.setStatus("RESOLVED");
        report.setResolvedBy(adminId);
        report.setResolvedAt(LocalDateTime.now());
        report = reportRepository.save(report);
        log.info("Report resolved: id={}, by admin={}", reportId, adminId);
        return report;
    }
}
