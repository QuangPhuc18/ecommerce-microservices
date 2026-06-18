package com.c2c.chat.repository;

import com.c2c.chat.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    Page<Message> findByConversationIdOrderByCreatedAtAsc(UUID conversationId, Pageable pageable);

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.conversationId = :conversationId AND m.senderId <> :userId AND m.isRead = false")
    int markAsRead(UUID conversationId, UUID userId);

    int countByConversationIdAndSenderIdNotAndIsReadFalse(UUID conversationId, UUID userId);
}
