package com.example.user_service.listener;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class OrderNotificationListener {

    // Lắng nghe hàng đợi có tên 'order_queue' (phải khớp với tên bên order-service gửi)
    @RabbitListener(queuesToDeclare = @org.springframework.amqp.rabbit.annotation.Queue("order_queue"))
    public void handleOrderNotification(String message) {
        log.info("======================================================");
        log.info("NHẬN THÔNG BÁO TỪ RABBITMQ: {}", message);
        log.info("Đang tiến hành xử lý ngầm: Gửi Email xác nhận cho khách hàng...");
        log.info("======================================================");
    }
}