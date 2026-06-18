package com.example.chat_service.repository;

import com.example.chat_service.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatRoomIdOrderByCreatedAtAsc(Long chatRoomId);

    Page<ChatMessage> findByChatRoomIdOrderByCreatedAtDesc(Long chatRoomId, Pageable pageable);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.chatRoom.id = :roomId AND m.senderId != :userId AND m.isRead = false")
    int countUnreadMessages(@Param("roomId") Long roomId, @Param("userId") Long userId);

    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.chatRoom.id = :roomId AND m.senderId != :userId AND m.isRead = false")
    void markMessagesAsRead(@Param("roomId") Long roomId, @Param("userId") Long userId);

    Optional<ChatMessage> findTopByChatRoomIdOrderByCreatedAtDesc(Long chatRoomId);
}
