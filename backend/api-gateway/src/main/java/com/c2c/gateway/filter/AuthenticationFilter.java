package com.c2c.gateway.filter;

import com.c2c.gateway.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@Slf4j
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    private final JwtUtil jwtUtil;

    public AuthenticationFilter(JwtUtil jwtUtil) {
        super(Config.class);
        this.jwtUtil = jwtUtil;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            var cleanRequest = exchange.getRequest().mutate()
                    .headers(headers -> {
                        headers.remove("X-User-Id");
                        headers.remove("X-User-Role");
                    })
                    .build();
            var cleanExchange = exchange.mutate().request(cleanRequest).build();

            String path = cleanExchange.getRequest().getURI().getPath();

            if (jwtUtil.isPublicPath(path)) {
                return chain.filter(cleanExchange);
            }

            String authHeader = cleanExchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
                log.warn("Missing or invalid Authorization header for path: {}", path);
                ServerHttpResponse response = cleanExchange.getResponse();
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return response.setComplete();
            }

            String token = authHeader.substring(7);

            if (!jwtUtil.isValid(token)) {
                log.warn("Invalid JWT token for path: {}", path);
                ServerHttpResponse response = cleanExchange.getResponse();
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return response.setComplete();
            }

            try {
                String userId = jwtUtil.extractUserId(token).toString();
                String role = jwtUtil.extractRole(token);
                cleanExchange = cleanExchange.mutate()
                        .request(r -> r.header("X-User-Id", userId)
                                       .header("X-User-Role", role != null ? role : "ROLE_USER"))
                        .build();
            } catch (Exception e) {
                log.error("Failed to extract user info from token", e);
            }

            return chain.filter(cleanExchange);
        };
    }

    public static class Config {
    }
}
