package com.example.chat_service.service;

import com.example.chat_service.dto.ChatMessageRequest;
import com.example.chat_service.dto.ChatMessageResponse;
import com.example.chat_service.entity.ChatMessage;
import com.example.chat_service.entity.ChatRoom;
import com.example.chat_service.exception.ResourceNotFoundException;
import com.example.chat_service.exception.UnauthorizedException;
import com.example.chat_service.repository.ChatMessageRepository;
import com.example.chat_service.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    public ChatMessageResponse sendMessage(Long roomId, Long senderId, ChatMessageRequest request) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat room not found"));

        if (!room.getBuyerId().equals(senderId) && !room.getSellerId().equals(senderId)) {
            throw new UnauthorizedException("You don't have access to this chat room");
        }

        ChatMessage message = ChatMessage.builder()
                .chatRoom(room)
                .senderId(senderId)
                .content(request.getContent())
                .messageType(request.getMessageType())
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(message);

        room.setUpdatedAt(LocalDateTime.now());
        chatRoomRepository.save(room);

        // Optional: Send notification via RabbitMQ
        Long receiverId = room.getBuyerId().equals(senderId) ? room.getSellerId() : room.getBuyerId();
        String notification = String.format("User %d sent message to User %d in room %d", senderId, receiverId, roomId);
        rabbitTemplate.convertAndSend("chat.exchange", "chat.notification.new", notification);

        return mapToResponse(savedMessage);
    }

    @Transactional(readOnly = true)
    public Page<ChatMessageResponse> getRoomMessages(Long roomId, Long userId, int page, int size) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat room not found"));

        if (!room.getBuyerId().equals(userId) && !room.getSellerId().equals(userId)) {
            throw new UnauthorizedException("You don't have access to this chat room");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<ChatMessage> messages = chatMessageRepository.findByChatRoomIdOrderByCreatedAtDesc(roomId, pageable);

        return messages.map(this::mapToResponse);
    }

    @Transactional
    public void markAsRead(Long roomId, Long userId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat room not found"));

        if (!room.getBuyerId().equals(userId) && !room.getSellerId().equals(userId)) {
            throw new UnauthorizedException("You don't have access to this chat room");
        }

        chatMessageRepository.markMessagesAsRead(roomId, userId);
    }

    public int getUnreadCount(Long userId) {
        // Find all rooms for user, sum unread messages. 
        // More optimal: custom query in repository, but this is simple logic for now.
        return chatRoomRepository.findAllByUserId(userId).stream()
                .mapToInt(room -> chatMessageRepository.countUnreadMessages(room.getId(), userId))
                .sum();
    }

    public ChatMessageResponse mapToResponse(ChatMessage message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .chatRoomId(message.getChatRoom().getId())
                .senderId(message.getSenderId())
                .content(message.getContent())
                .messageType(message.getMessageType())
                .isRead(message.getIsRead())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
