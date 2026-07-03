# Design Spec: Basic Admin Dashboard & Testing Interface

**Date**: 2026-07-03  
**Status**: Pending Review  
**Topic**: Admin Dashboard UI & Microservice Testing Tool

---

## 1. Context & Objectives

To test the existing microservices (Auth, User, Product, Order, Analytics, and Reports), we need a premium, responsive Admin Dashboard. Since the repository has no frontend initialization yet, we will:
1. Build a Vite React TypeScript Single Page Application (SPA) in `frontend/apps/admin` using Vanilla CSS for high-performance visual fidelity.
2. Enable automatic `ROLE_ADMIN` assignment for test registration when the email contains `admin`.
3. Add a header-trusting authentication filter to `analytics-service` so it accepts the identity and roles injected by the API Gateway.
4. Implement a comprehensive dashboard UI that allows testing login/registration, product status updates, order status tracking, report resolutions, and viewing admin logs.
5. Create a Mock Seeding UI component to generate test data (products, orders, and reports) on-demand.

---

## 2. Backend Enhancements

### 2.1 Auto-Assign ADMIN Role in `auth-service`
Modify `com.c2c.auth.service.AuthService`'s `register` method to assign `User.Role.ROLE_ADMIN` if the register request's email contains the substring `admin`.

```java
// In AuthService.java
var user = User.builder()
        .email(request.getEmail())
        .phone(request.getPhone())
        .passwordHash(passwordEncoder.encode(request.getPassword()))
        .fullName(request.getFullName())
        .role(request.getEmail().contains("admin") ? User.Role.ROLE_ADMIN : User.Role.ROLE_USER)
        .active(true)
        .build();
```

### 2.2 Ingest Gateway Auth Headers in `analytics-service`
Currently, `analytics-service` has no JWT filter. It will reject `/api/v1/admin/**` requests since there is no security context setup. We will create a `GatewayHeaderAuthFilter` that reads headers injected by the API Gateway (`X-User-Id` and `X-User-Role`) and updates Spring Security's context.

**File**: `backend/analytics-service/src/main/java/com/c2c/analytics/security/GatewayHeaderAuthFilter.java`
```java
package com.c2c.analytics.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
public class GatewayHeaderAuthFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String userIdStr = request.getHeader("X-User-Id");
        String roleStr = request.getHeader("X-User-Role");

        if (StringUtils.hasText(userIdStr)) {
            UUID userId = UUID.fromString(userIdStr);
            String role = StringUtils.hasText(roleStr) ? roleStr : "ROLE_USER";
            var authorities = List.of(new SimpleGrantedAuthority(role));
            var authentication = new UsernamePasswordAuthenticationToken(userId, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        chain.doFilter(request, response);
    }
}
```

Register this filter in `SecurityConfig.java` before `UsernamePasswordAuthenticationFilter.class`.

---

## 3. Frontend Architecture

### 3.1 Setup Details
- **Directory**: `frontend/apps/admin`
- **Build tool**: Vite + TypeScript
- **Dependencies**: React, Lucide React (for icons)
- **Styling**: Vanilla CSS with custom properties (CSS variables) for layout, color palette, and micro-interactions.

### 3.2 Visual Design System (CSS)
We will establish a dark-mode theme:
- Primary Background: `#0f172a` (slate-900)
- Card/Surface Background: `#1e293b` (slate-800) with a light border and glassmorphism backdrop-filter
- Primary Accent: `#3b82f6` (blue-500)
- Success State: `#10b981` (emerald-500)
- Warning State: `#f59e0b` (amber-500)
- Error State: `#ef4444` (red-500)
- Fonts: Inter/system-ui

---

## 4. UI Component Layout & Features

The app will offer a responsive side navigation menu to switch between tabs:

1. **Dashboard Tab**:
   - High-level metric cards: Total Products, Total Active Products, Open Reports, System Logs.
   - Dynamic charts/visual progress indicators using vanilla CSS.
2. **Products Tab**:
   - List of products.
   - Status update control: select box to toggle `ACTIVE`, `INACTIVE`, `SOLD`, `HIDDEN`.
   - Delete product button.
3. **Reports Tab**:
   - List of product complaints.
   - Action to "Resolve" reports.
4. **Orders Tab**:
   - List of orders with status change options to test Saga transactions.
5. **System Logs Tab**:
   - Live activity logs fetched from `/api/v1/admin/logs`.
6. **Authentication & Sandbox Tab**:
   - Registration and Login forms to easily authenticate as an Admin user.
   - Mock Seeder section containing buttons to instantly insert mock products, mock complaints, and mock orders via API calls to populate testing scenarios.

---

## 5. Verification & Validation Steps

1. Verify that building `backend` compiles successfully after modifications.
2. Verify that registering with an email containing `admin` yields a token with `ROLE_ADMIN`.
3. Verify that requests from the API Gateway containing `X-User-Role: ROLE_ADMIN` can successfully access `/api/v1/admin/statistics` through the gateway route.
4. Run Vite React local dev server and test all frontend operations.
