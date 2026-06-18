package com.example.chat_service.controller;

import com.example.chat_service.dto.ApiResponse;
import com.example.chat_service.dto.ChatMessageRequest;
import com.example.chat_service.dto.ChatMessageResponse;
import com.example.chat_service.dto.ChatRoomRequest;
import com.example.chat_service.dto.ChatRoomResponse;
import com.example.chat_service.service.ChatMessageService;
import com.example.chat_service.service.ChatRoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chat/rooms")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService chatRoomService;
    private final ChatMessageService chatMessageService;

    private Long getUserIdFromRequest(jakarta.servlet.http.HttpServletRequest request) {
        // Assuming JwtAuthenticationFilter sets this attribute
        return (Long) request.getAttribute("userId");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ChatRoomResponse>> createOrGetRoom(
            @Valid @RequestBody ChatRoomRequest request,
            jakarta.servlet.http.HttpServletRequest servletRequest) {
        Long userId = getUserIdFromRequest(servletRequest);
        ChatRoomResponse response = chatRoomService.createOrGetRoom(userId, request);
        return ResponseEntity.ok(ApiResponse.<ChatRoomResponse>builder()
                .status(200).message("Success").data(response).build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ChatRoomResponse>>> getUserRooms(
            jakarta.servlet.http.HttpServletRequest servletRequest) {
        Long userId = getUserIdFromRequest(servletRequest);
        List<ChatRoomResponse> response = chatRoomService.getUserRooms(userId);
        return ResponseEntity.ok(ApiResponse.<List<ChatRoomResponse>>builder()
                .status(200).message("Success").data(response).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ChatRoomResponse>> getRoomById(
            @PathVariable Long id,
            jakarta.servlet.http.HttpServletRequest servletRequest) {
        Long userId = getUserIdFromRequest(servletRequest);
        ChatRoomResponse response = chatRoomService.getRoomById(id, userId);
        return ResponseEntity.ok(ApiResponse.<ChatRoomResponse>builder()
                .status(200).message("Success").data(response).build());
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<ApiResponse<Page<ChatMessageResponse>>> getRoomMessages(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            jakarta.servlet.http.HttpServletRequest servletRequest) {
        Long userId = getUserIdFromRequest(servletRequest);
        Page<ChatMessageResponse> response = chatMessageService.getRoomMessages(id, userId, page, size);
        return ResponseEntity.ok(ApiResponse.<Page<ChatMessageResponse>>builder()
                .status(200).message("Success").data(response).build());
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(
            @PathVariable Long id,
            @Valid @RequestBody ChatMessageRequest request,
            jakarta.servlet.http.HttpServletRequest servletRequest) {
        Long userId = getUserIdFromRequest(servletRequest);
        ChatMessageResponse response = chatMessageService.sendMessage(id, userId, request);
        return ResponseEntity.ok(ApiResponse.<ChatMessageResponse>builder()
                .status(200).message("Message sent").data(response).build());
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long id,
            jakarta.servlet.http.HttpServletRequest servletRequest) {
        Long userId = getUserIdFromRequest(servletRequest);
        chatMessageService.markAsRead(id, userId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200).message("Messages marked as read").build());
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Integer>> getUnreadCount(
            jakarta.servlet.http.HttpServletRequest servletRequest) {
        Long userId = getUserIdFromRequest(servletRequest);
        int count = chatMessageService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.<Integer>builder()
                .status(200).message("Success").data(count).build());
    }
}
