package com.c2c.analytics.service;

import com.c2c.analytics.model.DashboardMetric;
import com.c2c.analytics.repository.DashboardMetricRepository;
import com.c2c.analytics.repository.SystemReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final DashboardMetricRepository metricRepository;
    private final SystemReportRepository reportRepository;

    public Map<String, Object> getDashboardStatistics() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", getMetricValue("total_users"));
        stats.put("totalProducts", getMetricValue("total_products"));
        stats.put("totalOrders", getMetricValue("total_orders"));
        stats.put("totalRevenue", getMetricValue("total_revenue"));
        stats.put("pendingReports", reportRepository.countByStatus("PENDING"));
        stats.put("resolvedReports", reportRepository.countByStatus("RESOLVED"));
        return stats;
    }

    public void updateMetric(String key, long value) {
        DashboardMetric metric = metricRepository.findByMetricKey(key)
                .orElse(DashboardMetric.builder().metricKey(key).build());
        metric.setMetricValue(value);
        metricRepository.save(metric);
    }

    public void incrementMetric(String key, long delta) {
        metricRepository.incrementMetric(key, delta);
    }

    private long getMetricValue(String key) {
        return metricRepository.findByMetricKey(key)
                .map(DashboardMetric::getMetricValue)
                .orElse(0L);
    }
}
