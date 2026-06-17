package com.c2c.user.controller;

import com.c2c.user.dto.AddressDTO;
import com.c2c.user.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users/addresses")
@RequiredArgsConstructor
public class AddressController {
    private final AddressService addressService;

    private UUID resolveUserId(@RequestHeader("X-User-Id") String userId) {
        return UUID.fromString(userId);
    }

    @GetMapping
    public ResponseEntity<List<AddressDTO>> getAddresses(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(addressService.getAddresses(resolveUserId(userId)));
    }

    @PostMapping
    public ResponseEntity<AddressDTO> createAddress(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody AddressDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(addressService.createAddress(resolveUserId(userId), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressDTO> updateAddress(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable Long id,
            @RequestBody AddressDTO dto) {
        return ResponseEntity.ok(addressService.updateAddress(id, resolveUserId(userId), dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable Long id) {
        addressService.deleteAddress(id, resolveUserId(userId));
        return ResponseEntity.noContent().build();
    }
}
