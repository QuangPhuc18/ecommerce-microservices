package com.example.user_service;

import com.example.user_service.entity.User;
import com.example.user_service.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByEmail("admin@chotot.com")) {
                User admin = new User();
                admin.setEmail("admin@chotot.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setName("Quản trị viên");
                admin.setRole("ADMIN");
                userRepository.save(admin);
                System.out.println("Đã tạo tài khoản Admin mặc định: admin@chotot.com / admin123");
            }
            
            // Cấp quyền Admin cho tài khoản quangphuc22@gmail.com
            userRepository.findByEmail("quangphuc22@gmail.com").ifPresent(user -> {
                if (!"ADMIN".equals(user.getRole())) {
                    user.setRole("ADMIN");
                    userRepository.save(user);
                    System.out.println("Đã cấp quyền ADMIN cho tài khoản: quangphuc22@gmail.com");
                }
            });
        };
    }
}