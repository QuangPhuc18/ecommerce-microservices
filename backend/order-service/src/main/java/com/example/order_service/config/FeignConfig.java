package com.example.order_service.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate template) {
                ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                if (attributes != null) {
                    String authHeader = attributes.getRequest().getHeader("Authorization");
                    if (authHeader != null) {
                        template.header("Authorization", authHeader);
                    }
                    String userIdHeader = attributes.getRequest().getHeader("X-User-Id");
                    if (userIdHeader != null) {
                        template.header("X-User-Id", userIdHeader);
                    }
                    String userRoleHeader = attributes.getRequest().getHeader("X-User-Role");
                    if (userRoleHeader != null) {
                        template.header("X-User-Role", userRoleHeader);
                    }
                }
            }
        };
    }
}
