package com.example.notification_service.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String CHAT_EXCHANGE = "chat.exchange";
    public static final String CHAT_QUEUE = "chat.notification.queue";
    
    public static final String PRODUCT_EXCHANGE = "product.exchange";
    public static final String PRODUCT_QUEUE = "product.notification.queue";
    
    public static final String USER_EXCHANGE = "user.exchange";
    public static final String USER_FOLLOWED_QUEUE = "user.followed.queue";
    
    // Config for Chat Queue binding
    @Bean
    public TopicExchange chatExchange() {
        return new TopicExchange(CHAT_EXCHANGE);
    }

    @Bean
    public Queue chatQueue() {
        return new Queue(CHAT_QUEUE);
    }

    @Bean
    public Binding chatBinding(Queue chatQueue, TopicExchange chatExchange) {
        return BindingBuilder.bind(chatQueue).to(chatExchange).with("chat.notification.#");
    }

    // Config for Product Queue binding
    @Bean
    public TopicExchange productExchange() {
        return new TopicExchange(PRODUCT_EXCHANGE);
    }

    @Bean
    public Queue productQueue() {
        return new Queue(PRODUCT_QUEUE);
    }

    @Bean
    public Binding productBinding(Queue productQueue, TopicExchange productExchange) {
        return BindingBuilder.bind(productQueue).to(productExchange).with("product.created");
    }

    // Config for User Queue binding
    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(USER_EXCHANGE);
    }

    @Bean
    public Queue userFollowedQueue() {
        return new Queue(USER_FOLLOWED_QUEUE);
    }

    @Bean
    public Binding userFollowedBinding(Queue userFollowedQueue, TopicExchange userExchange) {
        return BindingBuilder.bind(userFollowedQueue).to(userExchange).with("user.followed");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
