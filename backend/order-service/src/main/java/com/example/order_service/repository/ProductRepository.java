package com.example.order_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.order_service.entity.Order;

public interface ProductRepository extends JpaRepository<Order, Long> {}