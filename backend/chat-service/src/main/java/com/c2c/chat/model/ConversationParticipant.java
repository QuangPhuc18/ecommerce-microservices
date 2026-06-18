package com.c2c.chat.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "conversation_participants",
       uniqueConstraints = @UniqueConstraint(columnNames = {"conversation_id", "user_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private UUID conversationId;

    @Column(nullable = false)
    private UUID userId;

    private LocalDateTime lastReadAt;

    private UUID lastReadMessageId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
    }
}
