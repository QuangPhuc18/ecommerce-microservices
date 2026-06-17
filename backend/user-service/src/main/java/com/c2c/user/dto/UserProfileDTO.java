package com.c2c.user.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileDTO {
    private UUID userId;
    private String fullName;
    private String avatarUrl;
    private String phone;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
