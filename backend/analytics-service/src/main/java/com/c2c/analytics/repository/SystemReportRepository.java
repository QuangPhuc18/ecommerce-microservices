package com.c2c.analytics.repository;

import com.c2c.analytics.model.SystemReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SystemReportRepository extends JpaRepository<SystemReport, UUID> {
    Page<SystemReport> findByStatus(String status, Pageable pageable);
    long countByStatus(String status);
}
