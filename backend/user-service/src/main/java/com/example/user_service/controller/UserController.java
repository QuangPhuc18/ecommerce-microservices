package com.example.user_service.controller;

import com.example.user_service.dto.AuthResponse;
import com.example.user_service.dto.LoginRequest;
import com.example.user_service.dto.RegisterRequest;
import com.example.user_service.entity.User;
import com.example.user_service.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.createUser(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/me/deduct-balance")
    public ResponseEntity<String> deductBalance(
            @RequestParam("amount") double amount,
            @RequestAttribute("userId") Long userId) {
        User user = userService.getUserById(userId);
        if (user.getBalance() < amount) {
            return ResponseEntity.badRequest().body("Số dư không đủ");
        }
        user.setBalance(user.getBalance() - amount);
        userService.updateUser(userId, user);
        return ResponseEntity.ok("Thanh toán thành công");
    }

    @PutMapping("/internal/deduct-balance")
    public ResponseEntity<String> internalDeductBalance(
            @RequestParam("amount") double amount,
            @RequestParam("userId") Long userId) {
        User user = userService.getUserById(userId);
        if (user.getBalance() < amount) {
            return ResponseEntity.badRequest().body("Số dư không đủ");
        }
        user.setBalance(user.getBalance() - amount);
        userService.updateUser(userId, user);
        return ResponseEntity.ok("Thanh toán thành công");
    }
}