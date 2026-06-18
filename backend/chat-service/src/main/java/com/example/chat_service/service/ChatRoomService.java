package com.example.chat_service.service;

import com.example.chat_service.dto.ChatRoomRequest;
import com.example.chat_service.dto.ChatRoomResponse;
import com.example.chat_service.entity.ChatMessage;
import com.example.chat_service.entity.ChatRoom;
import com.example.chat_service.exception.ResourceNotFoundException;
import com.example.chat_service.exception.UnauthorizedException;
import com.example.chat_service.repository.ChatMessageRepository;
import com.example.chat_service.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;

    @Transactional
    public ChatRoomResponse createOrGetRoom(Long buyerId, ChatRoomRequest request) {
        if (buyerId.equals(request.getSellerId())) {
            throw new IllegalArgumentException("Buyer and seller cannot be the same");
        }

        Optional<ChatRoom> existingRoom = chatRoomRepository.findByBuyerIdAndSellerIdAndProductId(
                buyerId, request.getSellerId(), request.getProductId());

        ChatRoom room = existingRoom.orElseGet(() -> {
            ChatRoom newRoom = ChatRoom.builder()
                    .buyerId(buyerId)
                    .sellerId(request.getSellerId())
                    .productId(request.getProductId())
                    .build();
            return chatRoomRepository.save(newRoom);
        });

        return mapToResponse(room, buyerId);
    }

    @Transactional(readOnly = true)
    public List<ChatRoomResponse> getUserRooms(Long userId) {
        List<ChatRoom> rooms = chatRoomRepository.findAllByUserId(userId);
        return rooms.stream()
                .map(room -> mapToResponse(room, userId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ChatRoomResponse getRoomById(Long roomId, Long userId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat room not found"));

        if (!room.getBuyerId().equals(userId) && !room.getSellerId().equals(userId)) {
            throw new UnauthorizedException("You don't have access to this chat room");
        }

        return mapToResponse(room, userId);
    }

    private ChatRoomResponse mapToResponse(ChatRoom room, Long userId) {
        String lastMessageContent = "";
        Optional<ChatMessage> lastMsgOpt = chatMessageRepository.findTopByChatRoomIdOrderByCreatedAtDesc(room.getId());
        if (lastMsgOpt.isPresent()) {
            lastMessageContent = lastMsgOpt.get().getContent();
        }

        int unreadCount = chatMessageRepository.countUnreadMessages(room.getId(), userId);

        return ChatRoomResponse.builder()
                .id(room.getId())
                .buyerId(room.getBuyerId())
                .sellerId(room.getSellerId())
                .productId(room.getProductId())
                .createdAt(room.getCreatedAt())
                .updatedAt(room.getUpdatedAt())
                .lastMessage(lastMessageContent)
                .unreadCount(unreadCount)
                .build();
    }
}
