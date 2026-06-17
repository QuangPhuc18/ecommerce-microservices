package com.c2c.user.repository;

import com.c2c.user.model.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {
    List<UserAddress> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
