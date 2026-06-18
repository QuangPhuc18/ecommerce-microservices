package com.c2c.payment.repository;

import com.c2c.payment.model.Transaction;
import com.c2c.payment.model.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    Page<Transaction> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    Optional<Transaction> findByOrderIdAndType(UUID orderId, TransactionType type);
}
