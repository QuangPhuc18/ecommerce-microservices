package com.c2c.auth.security;

import com.c2c.auth.config.JwtConfig;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class JwtService {
    private final JwtConfig jwtConfig;

    public String generateAccessToken(UUID userId, String email, String role) {
        return buildToken(userId, email, role, jwtConfig.getAccessTokenExpiration());
    }

    public String generateRefreshToken(UUID userId, String email) {
        return buildToken(userId, email, null, jwtConfig.getRefreshTokenExpiration());
    }

    private String buildToken(UUID userId, String email, String role, long expiration) {
        var builder = Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey());
        if (role != null) {
            builder.claim("role", role);
        }
        return builder.compact();
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(extractClaims(token).getSubject());
    }

    public String extractEmail(String token) {
        return extractClaims(token).get("email", String.class);
    }

    public boolean isValid(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(
                java.util.Base64.getEncoder().encodeToString(jwtConfig.getSecret().getBytes())
        );
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
