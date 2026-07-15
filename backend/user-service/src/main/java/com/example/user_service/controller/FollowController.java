package com.example.user_service.controller;

import com.example.user_service.entity.Follow;
import com.example.user_service.repository.FollowRepository;
import com.example.user_service.repository.UserRepository;
import com.example.user_service.config.RabbitMQConfig;
import com.example.user_service.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/follows")
@RequiredArgsConstructor
public class FollowController {

    private final FollowRepository followRepository;
    private final RabbitTemplate rabbitTemplate;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> toggleFollow(@RequestBody Map<String, Long> payload) {
        Long followerId = payload.get("followerId");
        Long followingId = payload.get("followingId");

        if (followerId == null || followingId == null) {
            return ResponseEntity.badRequest().body("Thiếu followerId hoặc followingId");
        }

        if (followerId.equals(followingId)) {
            return ResponseEntity.badRequest().body("Không thể tự theo dõi chính mình");
        }

        Optional<Follow> existingFollow = followRepository.findByFollowerIdAndFollowingId(followerId, followingId);
        
        Map<String, Object> response = new HashMap<>();
        
        if (existingFollow.isPresent()) {
            // Unfollow
            followRepository.delete(existingFollow.get());
            response.put("followed", false);
            return ResponseEntity.ok(response);
        } else {
            // Follow
            Follow follow = new Follow();
            follow.setFollowerId(followerId);
            follow.setFollowingId(followingId);
            followRepository.save(follow);
            
            // Send Notification message
            try {
                User follower = userRepository.findById(followerId).orElse(null);
                if (follower != null) {
                    Map<String, Object> message = new HashMap<>();
                    message.put("followingId", followingId);
                    message.put("followerName", follower.getName() != null ? follower.getName() : follower.getEmail());
                    rabbitTemplate.convertAndSend(RabbitMQConfig.USER_EXCHANGE, "user.followed", message);
                }
            } catch (Exception e) {
                System.err.println("Failed to send follow notification: " + e.getMessage());
            }
            
            response.put("followed", true);
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkFollow(
            @RequestParam Long followerId,
            @RequestParam Long followingId) {
        boolean isFollowing = followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("followed", isFollowing);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/followers/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getFollowers(@PathVariable Long userId) {
        List<Follow> follows = followRepository.findByFollowingId(userId);
        
        List<Map<String, Object>> followerDetails = follows.stream().map(follow -> {
            Map<String, Object> details = new HashMap<>();
            details.put("followerId", follow.getFollowerId());
            
            // Lấy thông tin user
            userRepository.findById(follow.getFollowerId()).ifPresent(user -> {
                details.put("name", user.getName());
                details.put("avatarUrl", user.getAvatarUrl());
                details.put("email", user.getEmail());
            });
            
            return details;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(followerDetails);
    }
}
