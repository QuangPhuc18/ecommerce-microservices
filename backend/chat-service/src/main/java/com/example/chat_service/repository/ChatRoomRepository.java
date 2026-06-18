package com.example.chat_service.repository;

import com.example.chat_service.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    Optional<ChatRoom> findByBuyerIdAndSellerIdAndProductId(Long buyerId, Long sellerId, Long productId);

    @Query("SELECT cr FROM ChatRoom cr WHERE cr.buyerId = :userId OR cr.sellerId = :userId ORDER BY cr.updatedAt DESC")
    List<ChatRoom> findAllByUserId(@Param("userId") Long userId);
}
