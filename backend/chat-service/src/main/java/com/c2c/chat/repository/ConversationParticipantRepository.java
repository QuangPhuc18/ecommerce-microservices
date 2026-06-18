package com.c2c.chat.repository;

import com.c2c.chat.model.ConversationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, Long> {
    List<ConversationParticipant> findByConversationId(UUID conversationId);
    Optional<ConversationParticipant> findByConversationIdAndUserId(UUID conversationId, UUID userId);
    List<ConversationParticipant> findByUserId(UUID userId);
    boolean existsByConversationIdAndUserId(UUID conversationId, UUID userId);
}
