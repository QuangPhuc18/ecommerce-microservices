# T01: Monorepo Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the monorepo directory structure and root configuration files for ecommerce-microservices.

**Architecture:** Single root with `backend/` (11 Java Spring Boot services + gateway/discovery/config/shared), `frontend/` (2 Next.js apps + shared lib), `infrastructure/` (Docker/K8s/Terraform/monitoring/scripts), and `docs/`. Root config via Parent POM.

**Tech Stack:** Java 21, Spring Boot 3.2.x, Maven, Next.js, Docker

**Entry point:** `docs/architecture/01-overview.md` and `docs/tasks/T01-monorepo-structure.md`

---

### Task 1: Create top-level directory structure

**Files:** Create/use placeholder files under existing dirs

- [ ] **Create backend service directories**

```bash
$dirs = @(
    "backend/auth-service", "backend/user-service", "backend/product-service", "backend/search-service",
    "backend/order-service", "backend/payment-service", "backend/chat-service", "backend/notification-service",
    "backend/analytics-service", "backend/saga-orchestrator", "backend/admin-service",
    "backend/api-gateway", "backend/discovery-service", "backend/config-server", "backend/shared-lib"
)
foreach ($d in $dirs) { New-Item -ItemType Directory -Path "D:\TrenLop\Website2\ecommerce-microservices\$d" -Force }
```

- [ ] **Create frontend directories**

```bash
New-Item -ItemType Directory -Path "D:\TrenLop\Website2\ecommerce-microservices\frontend\apps\web" -Force
New-Item -ItemType Directory -Path "D:\TrenLop\Website2\ecommerce-microservices\frontend\apps\admin" -Force
New-Item -ItemType Directory -Path "D:\TrenLop\Website2\ecommerce-microservices\frontend\shared" -Force
```

- [ ] **Remove placeholder files**

```bash
Remove-Item -LiteralPath "D:\TrenLop\Website2\ecommerce-microservices\backend\pda.txt" -Force
Remove-Item -LiteralPath "D:\TrenLop\Website2\ecommerce-microservices\frontend\phuc.txt" -Force
```

- [ ] **Create infrastructure sub-directories**

```bash
$dirs = @(
    "infrastructure\docker", "infrastructure\k8s\base", "infrastructure\k8s\services", "infrastructure\k8s\ingress", "infrastructure\k8s\monitoring",
    "infrastructure\helm", "infrastructure\terraform", "infrastructure\monitoring\prometheus", "infrastructure\monitoring\grafana", "infrastructure\monitoring\loki",
    "infrastructure\scripts"
)
foreach ($d in $dirs) { New-Item -ItemType Directory -Path "D:\TrenLop\Website2\ecommerce-microservices\$d" -Force }
```

- [ ] **Verify tree structure**

```bash
Get-ChildItem -LiteralPath "D:\TrenLop\Website2\ecommerce-microservices" -Recurse -Depth 2 | Select-Object FullName
```
Expected: all backend service directories, frontend directories, and infrastructure directories exist.

---

### Task 2: Create root pom.xml (Parent POM)

**Files:**
- Create: `D:\TrenLop\Website2\ecommerce-microservices\backend\pom.xml`

- [ ] **Write Parent POM**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.5</version>
        <relativePath/>
    </parent>

    <groupId>com.c2c</groupId>
    <artifactId>ecommerce-microservices</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>pom</packaging>

    <name>E-Commerce Microservices</name>
    <description>Parent POM for C2C E-Commerce Platform</description>

    <properties>
        <java.version>21</java.version>
        <spring-cloud.version>2023.0.2</spring-cloud.version>
        <maven-compiler-plugin.version>3.12.1</maven-compiler-plugin.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <pluginManagement>
            <plugins>
                <plugin>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-maven-plugin</artifactId>
                </plugin>
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-compiler-plugin</artifactId>
                    <version>${maven-compiler-plugin.version}</version>
                    <configuration>
                        <source>${java.version}</source>
                        <target>${java.version}</target>
                    </configuration>
                </plugin>
            </plugins>
        </pluginManagement>
    </build>
</project>
```

- [ ] **Verify POM compiles**

Run: `mvn clean compile -f backend\pom.xml`
Expected: BUILD SUCCESS

---

### Task 3: Create root .gitignore

**Files:**
- Create: `D:\TrenLop\Website2\ecommerce-microservices\.gitignore`

- [ ] **Write .gitignore**

```gitignore
# Java
target/
*.class
*.jar
*.war
*.ear
*.logs
hs_err_pid*
replay_pid*

# Maven
!/.mvn/wrapper/maven-wrapper.jar

# Node
node_modules/
.next/
out/
dist/

# IDE
.idea/
*.iml
*.iws
*.ipr
.vscode/
*.sublime-*

# OS
.DS_Store
Thumbs.db
*.swp
*~

# Docker
infrastructure/docker/.env

# Environment
.env
.env.local
.env.*.local

# Logs
*.log
```

---

### Task 4: Create root .editorconfig

**Files:**
- Create: `D:\TrenLop\Website2\ecommerce-microservices\.editorconfig`

- [ ] **Write .editorconfig**

```ini
root = true

[*]
indent_style = space
indent_size = 2
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
end_of_line = lf

[*.java]
indent_size = 4

[{*.java,*.xml,*.yml,*.yaml,*.properties}]
indent_size = 2

[{Makefile,*.mk}]
indent_style = tab

[*.md]
trim_trailing_whitespace = false
```

---

### Task 5: Create root README.md

**Files:**
- Create: `D:\TrenLop\Website2\ecommerce-microservices\README.md`

- [ ] **Write README.md**

```markdown
# E-Commerce Microservices Platform

A C2C (Customer-to-Customer) e-commerce platform built with microservices architecture.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Java 21, Spring Boot 3.2, Spring Cloud 2023 |
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Database | PostgreSQL 16, Redis 7, Elasticsearch 8 |
| Messaging | Apache Kafka, RabbitMQ |
| Infrastructure | Docker, Kubernetes, Terraform |
| Observability | Prometheus, Grafana, ELK Stack, Jaeger |

## Architecture

See [docs/architecture/](docs/architecture/) for full system design.

## Prerequisites

- Java 21+
- Maven 3.9+
- Node.js 20+
- Docker & Docker Compose

## Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd ecommerce-microservices

# Build backend
cd backend
mvn clean compile
```

## Project Structure

```
ecommerce-microservices/
├── backend/          # Java Spring Boot microservices (11 services)
│   ├── parent pom.xml
│   ├── auth-service/
│   ├── user-service/
│   ├── product-service/
│   ├── search-service/
│   ├── order-service/
│   ├── payment-service/
│   ├── chat-service/
│   ├── notification-service/
│   ├── analytics-service/
│   ├── saga-orchestrator/
│   ├── admin-service/
│   ├── api-gateway/
│   ├── discovery-service/
│   ├── config-server/
│   └── shared-lib/
├── frontend/         # Next.js applications
│   ├── apps/web/     # Main web app
│   ├── apps/admin/   # Admin dashboard
│   └── shared/       # Shared UI, types, hooks
├── infrastructure/   # Docker, K8s, Terraform, Monitoring
└── docs/             # Architecture, tasks, API docs
```

## License

MIT
```

---

### Task 6: Verify final state

- [ ] **Run Maven compile to verify Parent POM**

Run: `mvn clean compile -f backend\pom.xml`
Expected: BUILD SUCCESS

- [ ] **Check all files exist**

```bash
Test-Path -LiteralPath "D:\TrenLop\Website2\ecommerce-microservices\.gitignore"
Test-Path -LiteralPath "D:\TrenLop\Website2\ecommerce-microservices\.editorconfig"
Test-Path -LiteralPath "D:\TrenLop\Website2\ecommerce-microservices\README.md"
Test-Path -LiteralPath "D:\TrenLop\Website2\ecommerce-microservices\backend\pom.xml"
```
Expected: all True

- [ ] **Final git status check**

```bash
git status
```
Expected: new untracked files shown, no old placeholder files
