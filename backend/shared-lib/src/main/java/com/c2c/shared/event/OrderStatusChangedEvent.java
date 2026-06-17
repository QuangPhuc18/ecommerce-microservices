package com.c2c.shared.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderStatusChangedEvent implements Serializable {
    private String eventId;
    private Long orderId;
    private String orderCode;
    private String fromStatus;
    private String toStatus;
    private String reason;
    private LocalDateTime timestamp;
}
