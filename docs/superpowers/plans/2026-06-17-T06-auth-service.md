# T06: Auth Service Implementation Plan

**Goal:** Registration, login, JWT token management with Kafka event publishing.

**Tech Stack:** Spring Boot 3.2.5, Spring Security 6, JWT (jjwt), Spring Data JPA, PostgreSQL, Kafka, shared-lib

---

### Task 1: Create auth-service module structure (pom.xml, main class, config)

- [ ] **pom.xml** at `backend/auth-service/pom.xml`
- [ ] **Main class** at `backend/auth-service/src/main/java/com/c2c/auth/AuthApplication.java`
- [ ] **application.yml** at `backend/auth-service/src/main/resources/application.yml`
- [ ] Add `<module>auth-service</module>` to parent POM
- [ ] Create package dirs: controller, service, repository, model, dto/request, dto/response, config, messaging/producer, exception, security

---

### Task 2: Create Entity and Repository

- [ ] **User.java** (id UUID, email, phone, passwordHash, fullName, role enum, active, createdAt, updatedAt)
- [ ] **RefreshToken.java** (id Long, token, user, expiryDate, revoked)
- [ ] **UserRepository.java**, **RefreshTokenRepository.java**

---

### Task 3: Create DTOs

- [ ] **RegisterRequest.java** (email, phone, password, fullName)
- [ ] **LoginRequest.java** (email, password)
- [ ] **AuthResponse.java** (accessToken, refreshToken, tokenType, expiresIn)
- [ ] **TokenResponse.java** (accessToken, refreshToken, expiresIn)

---

### Task 4: Create Security config and JWT service

- [ ] **SecurityConfig.java** (Spring Security filter chain, permit auth endpoints, protect others)
- [ ] **JwtConfig.java** (@ConfigurationProperties for secret, expiration)
- [ ] **JwtService.java** (generate, validate, extract claims)
- [ ] **JwtAuthenticationFilter.java** (OncePerRequestFilter)
- [ ] **RedisConfig.java** (for token blacklist/refresh)

---

### Task 5: Create Auth Service

- [ ] **AuthService.java** (register, login, refreshToken, validateToken)
- [ ] **UserEventProducer.java** (Kafka: send UserRegisteredEvent)

---

### Task 6: Create Controllers and Exception handler

- [ ] **AuthController.java** (POST /api/v1/auth/register, POST /api/v1/auth/login)
- [ ] **TokenController.java** (POST /api/v1/auth/refresh-token)
- [ ] **GlobalExceptionHandler.java** (@ControllerAdvice)
- [ ] **CustomExceptions.java** (specific exception classes)

---

### Task 7: Create Flyway migrations

- [ ] **V1__create_users_table.sql**
- [ ] **V2__create_refresh_tokens_table.sql**

---

### Task 8: Build and verify

- [ ] `mvn clean compile -pl auth-service -am -f backend/pom.xml` → BUILD SUCCESS
