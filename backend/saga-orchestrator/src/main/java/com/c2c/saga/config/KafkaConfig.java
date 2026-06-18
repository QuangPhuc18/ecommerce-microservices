package com.c2c.saga.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Bean
    public NewTopic sagaEventsTopic() {
        return TopicBuilder.name("saga.events")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic paymentRequiredTopic() {
        return TopicBuilder.name("payment.required")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic orderConfirmTopic() {
        return TopicBuilder.name("order.confirmed")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic inventoryReserveTopic() {
        return TopicBuilder.name("inventory.reserve")
                .partitions(3)
                .replicas(1)
                .build();
    }
}
