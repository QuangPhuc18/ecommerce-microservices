package com.c2c.chat.service;

import com.c2c.chat.dto.ConversationResponse;
import com.c2c.chat.dto.CreateConversationRequest;
import com.c2c.chat.model.Conversation;
import com.c2c.chat.model.ConversationParticipant;
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

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;
    private final MessageRepository messageRepository;

    @Transactional
    public ConversationResponse createConversation(UUID currentUserId, CreateConversationRequest request) {
        if (currentUserId.equals(request.getRecipientId())) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Cannot create conversation with yourself");
        }

        Conversation conversation = Conversation.builder()
                .listingId(request.getListingId())
                .listingTitle(request.getListingTitle())
                .build();
        conversation = conversationRepository.save(conversation);

        participantRepository.save(ConversationParticipant.builder()
                .conversationId(conversation.getId())
                .userId(currentUserId)
                .build());

        participantRepository.save(ConversationParticipant.builder()
                .conversationId(conversation.getId())
                .userId(request.getRecipientId())
                .build());

        log.info("Conversation created: id={}, users={},{}", conversation.getId(), currentUserId, request.getRecipientId());
        return toResponse(conversation, currentUserId, 0, request.getRecipientId());
    }

    public Page<ConversationResponse> getConversations(UUID userId, int page, int size) {
        Page<Conversation> conversations = conversationRepository.findByParticipantUserId(userId, PageRequest.of(page, size));
        return conversations.map(conv -> {
            List<ConversationParticipant> participants = participantRepository.findByConversationId(conv.getId());
            UUID otherUserId = participants.stream()
                    .map(ConversationParticipant::getUserId)
                    .filter(id -> !id.equals(userId))
                    .findFirst().orElse(null);
            int unreadCount = messageRepository.countByConversationIdAndSenderIdNotAndIsReadFalse(conv.getId(), userId);
            return toResponse(conv, userId, unreadCount, otherUserId);
        });
    }

    private ConversationResponse toResponse(Conversation conv, UUID userId, int unreadCount, UUID otherUserId) {
        return ConversationResponse.builder()
                .id(conv.getId())
                .listingId(conv.getListingId())
                .listingTitle(conv.getListingTitle())
                .lastMessage(conv.getLastMessage())
                .lastMessageAt(conv.getLastMessageAt())
                .unreadCount(unreadCount)
                .otherUserId(otherUserId)
                .createdAt(conv.getCreatedAt())
                .build();
    }
}
