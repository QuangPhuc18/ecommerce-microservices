package com.c2c.analytics.repository;

import com.c2c.analytics.model.AdminLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AdminLogRepository extends JpaRepository<AdminLog, Long> {
    Page<AdminLog> findByAdminIdOrderByCreatedAtDesc(UUID adminId, Pageable pageable);
    Page<AdminLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
