package com.example.api_gateway.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;

@Component
public class JwtUtil {

    @Value("${jwt.secret:}")
    private String jwtSecret;

    private SecretKey secretKey;

    @PostConstruct
    public void init() {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            this.secretKey = Jwts.SIG.HS256.key().build();
        } else {
            byte[] keyBytes = Base64.getDecoder().decode(jwtSecret);
            this.secretKey = Keys.hmacShaKeyFor(keyBytes);
        }
    }

    public void validateToken(final String token) {
        Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token);
    }
    
    public Claims getClaims(final String token) {
        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload();
    }
}
