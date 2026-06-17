# T05: Config Server Implementation Plan

**Goal:** Create Spring Cloud Config Server for centralized configuration management.

**Tech Stack:** Spring Boot 3.2.5, Spring Cloud Config, Java 21

---

### Task 1: Create config-server module

- [ ] Create `backend/config-server/pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.c2c</groupId>
        <artifactId>ecommerce-microservices</artifactId>
        <version>1.0.0-SNAPSHOT</version>
        <relativePath>../pom.xml</relativePath>
    </parent>
    <artifactId>config-server</artifactId>
    <packaging>jar</packaging>
    <name>Config Server</name>
    <description>Centralized Configuration Server</description>

    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-config-server</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

- [ ] Create `backend/config-server/src/main/java/com/c2c/config/ConfigServerApplication.java`

```java
package com.c2c.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.config.server.EnableConfigServer;

@SpringBootApplication
@EnableConfigServer
public class ConfigServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConfigServerApplication.class, args);
    }
}
```

- [ ] Create `backend/config-server/src/main/resources/application.yml`

```yaml
server:
  port: 8888

spring:
  application:
    name: config-server
  profiles:
    active: native
  cloud:
    config:
      server:
        native:
          search-locations: classpath:/config-repo/

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

- [ ] Create config files in `backend/config-server/src/main/resources/config-repo/`:
  - `auth-service.yml`, `user-service.yml`, `product-service.yml`, `order-service.yml`, `payment-service.yml`
  - `chat-service.yml`, `notification-service.yml`, `analytics-service.yml`, `search-service.yml`

Each config file contains common defaults:

**auth-service.yml:**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/user_db
    username: admin
    password: admin123
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
  kafka:
    bootstrap-servers: localhost:9092

jwt:
  secret: ${JWT_SECRET:defaultSecretKeyForDevEnvironmentChangeInProduction}
  expiration: 86400000
```

**user-service.yml:**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/user_db
    username: admin
    password: admin123
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
  kafka:
    bootstrap-servers: localhost:9092
```

**product-service.yml:**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/product_db
    username: admin
    password: admin123
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
  elasticsearch:
    uris: http://localhost:9200
  kafka:
    bootstrap-servers: localhost:9092
```

**order-service.yml:**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/order_db
    username: admin
    password: admin123
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
  kafka:
    bootstrap-servers: localhost:9092
```

**payment-service.yml:**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/payment_db
    username: admin
    password: admin123
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
  kafka:
    bootstrap-servers: localhost:9092
```

**chat-service.yml:**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/chat_db
    username: admin
    password: admin123
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
  kafka:
    bootstrap-servers: localhost:9092
```

**search-service.yml:**
```yaml
spring:
  elasticsearch:
    uris: http://localhost:9200
  kafka:
    bootstrap-servers: localhost:9092
```

**notification-service.yml:**
```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
```

**analytics-service.yml:**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/user_db
    username: admin
    password: admin123
  jpa:
    hibernate:
      ddl-auto: validate
  kafka:
    bootstrap-servers: localhost:9092
```

- [ ] Add `<module>config-server</module>` to parent POM
