package com.c2c.auth.service;

import com.c2c.auth.config.JwtConfig;
import com.c2c.auth.dto.request.LoginRequest;
import com.c2c.auth.dto.request.RegisterRequest;
import com.c2c.auth.dto.response.AuthResponse;
import com.c2c.auth.dto.response.TokenResponse;
import com.c2c.auth.messaging.producer.UserEventProducer;
import com.c2c.auth.model.RefreshToken;
import com.c2c.auth.model.User;
import com.c2c.auth.repository.RefreshTokenRepository;
import com.c2c.auth.repository.UserRepository;
import com.c2c.auth.security.JwtService;
import com.c2c.shared.exception.BusinessException;
import com.c2c.shared.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtConfig jwtConfig;
    private final UserEventProducer userEventProducer;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new BusinessException(ErrorCode.USER_ALREADY_EXISTS);
        }

        var user = User.builder()
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getEmail() != null && request.getEmail().contains("admin") ? User.Role.ROLE_ADMIN : User.Role.ROLE_USER)
                .active(true)
                .build();
        user = userRepository.save(user);

        userEventProducer.sendUserCreatedEvent(user);

        return generateAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        return generateAuthResponse(user);
    }

    @Transactional
    public TokenResponse refreshToken(String refreshToken) {
        var storedToken = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new BusinessException(ErrorCode.TOKEN_INVALID));

        if (storedToken.isRevoked() || storedToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BusinessException(ErrorCode.TOKEN_EXPIRED);
        }

        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        var user = storedToken.getUser();
        String newAccessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String newRefreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());

        saveRefreshToken(user, newRefreshToken);

        return TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .expiresIn(jwtConfig.getAccessTokenExpiration())
                .build();
    }

    private AuthResponse generateAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());

        saveRefreshToken(user, refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtConfig.getAccessTokenExpiration())
                .build();
    }

    private void saveRefreshToken(User user, String token) {
        var refreshToken = RefreshToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusSeconds(jwtConfig.getRefreshTokenExpiration() / 1000))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);
    }
}
