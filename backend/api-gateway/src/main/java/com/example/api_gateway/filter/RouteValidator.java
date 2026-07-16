package com.example.api_gateway.filter;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

@Component
public class RouteValidator {

    public static final List<String> openApiEndpoints = List.of(
            "/auth/register",
            "/auth/login",
            "/users/register",
            "/users/login",
            "/products/categories",
            "/auth/refresh",
            "/eureka",
            "/v3/api-docs",
            "/swagger-ui",
            "/payment/return"
    );

    public Predicate<ServerHttpRequest> isSecured =
            request -> {
                // Cho phép tất cả GET request đến /products (xem danh sách, xem chi tiết)
                if (request.getMethod().name().equals("GET") && request.getURI().getPath().startsWith("/products")) {
                    return false;
                }
                // Cho phép tải ảnh công khai
                if (request.getMethod().name().equals("GET") && request.getURI().getPath().startsWith("/media/images")) {
                    return false;
                }
                // Cho phép GET /users (xem thông tin người bán)
                if (request.getMethod().name().equals("GET") && request.getURI().getPath().startsWith("/users")) {
                    return false;
                }
                // Cho phép GET /reviews (xem đánh giá người bán)
                if (request.getMethod().name().equals("GET") && request.getURI().getPath().startsWith("/reviews")) {
                    return false;
                }
                return openApiEndpoints
                        .stream()
                        .noneMatch(uri -> request.getURI().getPath().contains(uri));
            };

}
