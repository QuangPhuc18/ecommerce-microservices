package com.c2c.gateway.config;

import com.c2c.gateway.filter.AuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class GatewayConfig {

    private final AuthenticationFilter authenticationFilter;

    @Bean
    public RouteLocator customRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("auth-service", r -> r
                        .path("/api/v1/auth/**", "/api/v1/tokens/**")
                        .filters(f -> f.filter(authenticationFilter.apply(new AuthenticationFilter.Config())))
                        .uri("lb://auth-service"))
                .route("user-service", r -> r
                        .path("/api/v1/users/**", "/api/v1/profiles/**", "/api/v1/addresses/**")
                        .filters(f -> f.filter(authenticationFilter.apply(new AuthenticationFilter.Config())))
                        .uri("lb://user-service"))
                .route("product-service", r -> r
                        .path("/api/v1/products/**", "/api/v1/categories/**", "/api/v1/images/**", "/api/v1/favorites/**")
                        .filters(f -> f.filter(authenticationFilter.apply(new AuthenticationFilter.Config())))
                        .uri("lb://product-service"))
                .route("search-service", r -> r
                        .path("/api/v1/search/**", "/api/v1/suggestions/**")
                        .uri("lb://search-service"))
                .route("order-service", r -> r
                        .path("/api/v1/orders/**", "/api/v1/seller/orders/**")
                        .filters(f -> f.filter(authenticationFilter.apply(new AuthenticationFilter.Config())))
                        .uri("lb://order-service"))
                .route("payment-service", r -> r
                        .path("/api/v1/payments/**")
                        .filters(f -> f.filter(authenticationFilter.apply(new AuthenticationFilter.Config())))
                        .uri("lb://payment-service"))
                .route("chat-service", r -> r
                        .path("/api/v1/chats/**", "/ws/**")
                        .filters(f -> f.filter(authenticationFilter.apply(new AuthenticationFilter.Config())))
                        .uri("lb://chat-service"))
                .route("notification-service", r -> r
                        .path("/api/v1/notifications/**")
                        .filters(f -> f.filter(authenticationFilter.apply(new AuthenticationFilter.Config())))
                        .uri("lb://notification-service"))
                .route("analytics-service", r -> r
                        .path("/api/v1/reports/**", "/api/v1/admin/**")
                        .filters(f -> f.filter(authenticationFilter.apply(new AuthenticationFilter.Config())))
                        .uri("lb://analytics-service"))
                .route("saga-orchestrator", r -> r
                        .path("/api/v1/sagas/**")
                        .filters(f -> f.filter(authenticationFilter.apply(new AuthenticationFilter.Config())))
                        .uri("lb://saga-orchestrator"))
                .build();
    }
}
