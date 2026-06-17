# T04: Service Discovery (Eureka Server) Implementation Plan

**Goal:** Create Eureka Server for service registration and discovery.

**Tech Stack:** Spring Boot 3.2.5, Spring Cloud Netflix Eureka, Java 21

---

### Task 1: Create discovery-service module

- [ ] Create `backend/discovery-service/pom.xml`

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
    <artifactId>discovery-service</artifactId>
    <packaging>jar</packaging>
    <name>Discovery Service</name>
    <description>Eureka Service Registry</description>

    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
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

- [ ] Create `backend/discovery-service/src/main/java/com/c2c/discovery/DiscoveryApplication.java`

```java
package com.c2c.discovery;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer
public class DiscoveryApplication {
    public static void main(String[] args) {
        SpringApplication.run(DiscoveryApplication.class, args);
    }
}
```

- [ ] Create `backend/discovery-service/src/main/resources/application.yml`

```yaml
server:
  port: 8761

spring:
  application:
    name: discovery-service

eureka:
  instance:
    hostname: localhost
  client:
    register-with-eureka: false
    fetch-registry: false
  server:
    enable-self-preservation: false
```

- [ ] Add `<module>discovery-service</module>` to parent POM
