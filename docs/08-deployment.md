# 08. Deployment

This document describes the containerization, environment configuration, networks, volumes, and execution steps for deploying the **ĐồCũ** secondhand e-commerce platform.

---

## 1. Containerization (Docker)

Each microservice contains a lightweight, single-stage `Dockerfile` located in its respective module directory.

### Dockerfile Design
```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE <PORT>
ENTRYPOINT ["java", "-jar", "app.jar"]
```
* **Base Image**: `eclipse-temurin:21-jre-alpine` (providing Java 21 Runtime Environment on Alpine Linux to minimize image sizes).
* **Port Exposure**: Exposes the port matching the service configuration.
* **Build Dependency**: The Docker image builds rely on pre-compiled JAR binaries located in the `target/` directories, which are generated during the Maven build phase on the host machine.

---

## 2. Local Orchestration (Docker Compose)

The backend services and infrastructure are orchestrated using the master `backend/docker-compose.yml` file.

### 2.1 Services & Ports Mapping
| Container Name | Service Image / Context | Internal Port | External Port | Role |
| --- | --- | --- | --- | --- |
| `microservice-mysql` | `mysql:8.0` | `3306` | `3307` | Central Database Engine (User, Product, Order, Chat, Notifications, Review DBs). |
| `microservice-redis` | `redis:alpine` | `6379` | `6379` | User Refresh Token Storage. |
| `microservice-elasticsearch` | `elasticsearch:8.10.2` | `9200` | `9200` | Full-text search catalog (Inactive fallback). |
| `microservice-rabbitmq` | `rabbitmq:3-management` | `5672`, `15672` | `5672`, `15672` | AMQP Message broker & dashboard. |
| `microservice-eureka` | `./eureka-server` | `8761` | `8761` | Netflix Eureka Service Registry. |
| `microservice-gateway` | `./api-gateway` | `8088` | `8088` | Spring Cloud API Gateway (Public entrance). |
| `microservice-user` | `./user-service` | `8085` | `8085` | User authentication & profiles. |
| `microservice-product` | `./product-service` | `8081` | `8081` | Product lists & categories catalog. |
| `microservice-order` | `./order-service` | `8082` | `8082` | Transacts orders. |
| `microservice-chat` | `./chat-service` | `8086` | `8086` | Text & media messaging. |
| `microservice-media` | `./media-service` | `8083` | `8083` | Image storage & serving. |
| `microservice-notification` | `./notification-service` | `8087` | `8087` | User alerts manager. |
| `microservice-review` | `./review-service` | `8089` | `8089` | Seller reviews & ratings. |
| `microservice-payment` | `./payment-service` | `8090` | `8090` | VNPay transaction controller. |

### 2.2 Network Topology
All containers run inside a single custom bridge network:
* **Network Name**: `microservice-network`
* **Driver**: `bridge`
* **Purpose**: Allows microservices to reference infrastructure containers using their container names (e.g. `mysql:3306`, `rabbitmq:5672`, `eureka-server:8761`) instead of host IP addresses.

### 2.3 Volume Mounts
To prevent loss of user data during container recycles, two named volumes are declared:
1. `mysql_data`: Mounts `/var/lib/mysql` inside `microservice-mysql` to persist all SQL tables and records.
2. `media_data`: Mounts `/app/uploads` in `microservice-media` to persist user-uploaded product images and avatars.

---

## 3. Kubernetes Status

> [!NOTE]
> Currently, there are no Kubernetes configuration manifests (K8s) included in this repository. Deployment is organized exclusively using Docker Compose.

---

## 4. Environment Configuration & Profiles

The system uses **Spring Boot Profiles** to distinguish between local (development) and containerized (docker) configurations:

### Docker Profile
When launching containers via Docker Compose, the environment variable `SPRING_PROFILES_ACTIVE=docker` is injected. This activates `application-docker.properties` in each microservice, changing local targets:
* **Local Mode**: Databases resolve to `jdbc:mysql://localhost:3306/...` and RabbitMQ to `localhost`.
* **Docker Mode**: Databases resolve to `jdbc:mysql://mysql:3306/...` and RabbitMQ to `rabbitmq`.

---

## 5. Build and Execution Guide

### Prerequisites
* Java 21 Development Kit (JDK) installed.
* Apache Maven installed.
* Docker & Docker Desktop running.
* Node.js (for frontend execution).

### Step-by-Step Run Process

#### Step 1: Compile the Backend
Navigate to the `backend/` directory and compile all Spring Boot modules into executable JARs:
```bash
cd backend
mvn clean package -DskipTests
```
This generates the required `.jar` files inside the `target/` folder of each microservice module.

#### Step 2: Launch the Infrastructure and Services
Run Docker Compose in detached mode to download images, compile contexts, and spin up the containers:
```bash
docker compose up --build -d
```
Verify that all containers are healthy:
```bash
docker compose ps
```

#### Step 3: Run the React Frontend
Navigate to the `frontend/` directory, install packages, and launch the Vite development server:
```bash
cd ../frontend
npm install
npm run dev
```
By default, the frontend will be served at `http://localhost:5173`.
All frontend API requests will route to `http://localhost:8088` (the API Gateway).
The Eureka registry control dashboard can be viewed at `http://localhost:8761`.
The RabbitMQ broker dashboard is available at `http://localhost:15672` (guest / guest credentials).
