package com.c2c.user.controller;

import com.c2c.user.dto.UserProfileDTO;
import com.c2c.user.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final ProfileService profileService;

    // Mocked auth: extract userId from header for now
    private UUID resolveUserId(@RequestHeader("X-User-Id") String userId) {
        return UUID.fromString(userId);
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDTO> getProfile(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(profileService.getProfile(resolveUserId(userId)));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileDTO> updateProfile(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody UserProfileDTO dto) {
        return ResponseEntity.ok(profileService.updateProfile(resolveUserId(userId), dto));
    }
}
