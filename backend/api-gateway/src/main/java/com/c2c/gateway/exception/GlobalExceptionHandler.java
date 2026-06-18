package com.c2c.gateway.exception;

import org.springframework.boot.web.reactive.error.ErrorWebExceptionHandler;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class GlobalExceptionHandler implements ErrorWebExceptionHandler {

    @Override
    public Mono<Void> handle(org.springframework.web.server.ServerWebExchange exchange, Throwable ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("error", "Internal Server Error");
        body.put("message", ex.getMessage());

        if (ex instanceof ResponseStatusException statusException) {
            body.put("status", statusException.getStatusCode().value());
            body.put("error", statusException.getReason());
        }

        exchange.getResponse().setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

        var buffer = exchange.getResponse().bufferFactory()
                .wrap(new com.fasterxml.jackson.databind.ObjectMapper().valueToBytes(body));
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }
}
