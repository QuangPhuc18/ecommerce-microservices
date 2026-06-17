package com.c2c.order.repository;

import com.c2c.order.model.OrderHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OrderHistoryRepository extends JpaRepository<OrderHistory, Long> {
    List<OrderHistory> findByOrderIdOrderByCreatedAtDesc(UUID orderId);
}
