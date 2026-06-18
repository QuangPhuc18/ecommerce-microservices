package com.c2c.chat.service;

import com.c2c.chat.dto.MessageRequest;
import com.c2c.chat.dto.MessageResponse;
import com.c2c.chat.model.Conversation;
import com.c2c.chat.model.Message;
import com.c2c.chat.repository.ConversationParticipantRepository;
import com.c2c.chat.repository.ConversationRepository;
import com.c2c.chat.repository.MessageRepository;
import com.c2c.shared.exception.BusinessException;
import com.c2c.shared.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;

    @Transactional
    public MessageResponse sendMessage(UUID senderId, MessageRequest request) {
        if (!participantRepository.existsByConversationIdAndUserId(request.getConversationId(), senderId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Not a participant of this conversation");
        }

        Message message = Message.builder()
                .conversationId(request.getConversationId())
                .senderId(senderId)
                .content(request.getContent())
                .messageType(request.getMessageType() != null ? request.getMessageType() : "TEXT")
                .clientGeneratedId(request.getClientGeneratedId())
                .build();
        message = messageRepository.save(message);

        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new BusinessException(ErrorCode.INTERNAL_ERROR, "Conversation not found"));
        conversation.setLastMessage(request.getContent());
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        return toResponse(message);
    }

    public Page<MessageResponse> getMessages(UUID conversationId, UUID userId, int page, int size) {
        if (!participantRepository.existsByConversationIdAndUserId(conversationId, userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Not a participant of this conversation");
        }
        Page<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId, PageRequest.of(page, size));
        return messages.map(this::toResponse);
    }

    @Transactional
    public int markAsRead(UUID conversationId, UUID userId) {
        if (!participantRepository.existsByConversationIdAndUserId(conversationId, userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Not a participant of this conversation");
        }
        int updated = messageRepository.markAsRead(conversationId, userId);

        participantRepository.findByConversationIdAndUserId(conversationId, userId)
                .ifPresent(p -> {
                    p.setLastReadAt(LocalDateTime.now());
                    participantRepository.save(p);
                });

        return updated;
    }

    public int getUnreadCount(UUID conversationId, UUID userId) {
        return messageRepository.countByConversationIdAndSenderIdNotAndIsReadFalse(conversationId, userId);
    }

    private MessageResponse toResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .conversationId(message.getConversationId())
                .senderId(message.getSenderId())
                .content(message.getContent())
                .messageType(message.getMessageType())
                .isRead(message.isRead())
                .clientGeneratedId(message.getClientGeneratedId())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
