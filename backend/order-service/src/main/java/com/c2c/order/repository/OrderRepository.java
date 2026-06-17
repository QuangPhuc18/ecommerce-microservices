package com.c2c.order.repository;

import com.c2c.order.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    Optional<Order> findByOrderNumber(String orderNumber);
    Page<Order> findByBuyerId(UUID buyerId, Pageable pageable);
    Page<Order> findBySellerId(UUID sellerId, Pageable pageable);
}
