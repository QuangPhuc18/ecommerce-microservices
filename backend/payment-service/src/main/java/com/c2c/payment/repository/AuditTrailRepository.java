package com.c2c.payment.repository;

import com.c2c.payment.model.AuditTrail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AuditTrailRepository extends JpaRepository<AuditTrail, Long> {
    java.util.List<AuditTrail> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
