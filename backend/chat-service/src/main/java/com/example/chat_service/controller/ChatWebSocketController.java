package com.example.chat_service.controller;

import com.example.chat_service.dto.ChatMessageRequest;
import com.example.chat_service.dto.ChatMessageResponse;
import com.example.chat_service.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatMessageService chatMessageService;

    @MessageMapping("/chat.send/{roomId}")
    @SendTo("/topic/chat/{roomId}")
    public ChatMessageResponse sendMessage(@DestinationVariable Long roomId, 
                                          @Payload ChatMessageRequest request,
                                          SimpMessageHeaderAccessor headerAccessor) {
        // Real-world: Extract userId from Principal or token attached to websocket session
        // For simplicity assuming senderId is passed or extracted here:
        Long senderId = (Long) headerAccessor.getSessionAttributes().get("userId");
        if (senderId == null) {
            // fallback for testing if no auth interceptor is set
            senderId = 1L; 
        }
        
        return chatMessageService.sendMessage(roomId, senderId, request);
    }
}
