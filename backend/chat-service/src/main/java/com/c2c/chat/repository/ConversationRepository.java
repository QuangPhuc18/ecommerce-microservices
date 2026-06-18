package com.c2c.chat.repository;

import com.c2c.chat.model.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    @Query("SELECT c FROM Conversation c WHERE c.id IN " +
           "(SELECT cp.conversationId FROM ConversationParticipant cp WHERE cp.userId = :userId) " +
           "ORDER BY c.lastMessageAt DESC")
    Page<Conversation> findByParticipantUserId(UUID userId, Pageable pageable);
}
