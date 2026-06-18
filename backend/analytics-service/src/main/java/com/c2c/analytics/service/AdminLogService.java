package com.c2c.analytics.service;

import com.c2c.analytics.model.AdminLog;
import com.c2c.analytics.repository.AdminLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminLogService {

    private final AdminLogRepository adminLogRepository;

    public void log(UUID adminId, String action, String entityType, String entityId, String details, String ipAddress) {
        AdminLog logEntry = AdminLog.builder()
                .adminId(adminId)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .ipAddress(ipAddress)
                .build();
        adminLogRepository.save(logEntry);
        log.info("Admin log: adminId={}, action={}", adminId, action);
    }

    public Page<AdminLog> getLogs(int page, int size) {
        return adminLogRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }
}
