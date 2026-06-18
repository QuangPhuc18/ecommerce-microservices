package com.c2c.analytics.repository;

import com.c2c.analytics.model.DashboardMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface DashboardMetricRepository extends JpaRepository<DashboardMetric, Long> {
    Optional<DashboardMetric> findByMetricKey(String metricKey);

    @Modifying
    @Query("UPDATE DashboardMetric m SET m.metricValue = m.metricValue + :delta WHERE m.metricKey = :key")
    int incrementMetric(String key, long delta);
}
