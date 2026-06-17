# T02: Docker Compose Local Environment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create Docker Compose configuration for local development with PostgreSQL, Redis, Kafka, Elasticsearch, and Kibana.

**Architecture:** Single `docker-compose.yml` in `infrastructure/docker/` with 6 services (postgres, redis, kafka+zookeeper, elasticsearch, kibana). Healthcheck ordering ensures dependencies start correctly. `.env.example` for secrets.

**Tech Stack:** Docker Compose 2.x, postgres:16-alpine, bitnami/kafka, redis:7-alpine, elasticsearch:8.11, kibana:8.11

---

### Task 1: Create `.env.example`

**Files:**
- Create: `infrastructure/docker/.env.example`

- [ ] **Write .env.example**

```bash
# PostgreSQL
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
POSTGRES_DB=user_db

# Redis
REDIS_PASSWORD=redis123

# Kafka
KAFKA_BROKER_ID=1
KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181

# Elasticsearch
ELASTIC_PASSWORD=elastic123

# Ports
POSTGRES_PORT=5432
REDIS_PORT=6379
KAFKA_PORT=9092
ELASTIC_PORT=9200
KIBANA_PORT=5601
```

---

### Task 2: Create `docker-compose.yml`

**Files:**
- Create: `infrastructure/docker/docker-compose.yml`

- [ ] **Write docker-compose.yml**

```yaml
version: "3.8"

networks:
  ecommerce-network:
    driver: bridge

services:
  postgres_db:
    image: postgres:16-alpine
    container_name: ecommerce-postgres
    restart: unless-stopped
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-admin}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-admin123}
      POSTGRES_DB: ${POSTGRES_DB:-user_db}
      POSTGRES_MULTIPLE_DBS: user_db,product_db,order_db,payment_db,chat_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-multiple-dbs.sh:/docker-entrypoint-initdb.d/init-multiple-dbs.sh
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-admin} -d ${POSTGRES_DB:-user_db}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    networks:
      - ecommerce-network

  redis_cache:
    image: redis:7-alpine
    container_name: ecommerce-redis
    restart: unless-stopped
    ports:
      - "${REDIS_PORT:-6379}:6379"
    command: ["redis-server", "--requirepass", "${REDIS_PASSWORD:-redis123}"]
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - ecommerce-network

  zookeeper:
    image: bitnami/zookeeper:3.8
    container_name: ecommerce-zookeeper
    restart: unless-stopped
    ports:
      - "2181:2181"
    environment:
      ALLOW_ANONYMOUS_LOGIN: "yes"
    volumes:
      - zookeeper_data:/bitnami/zookeeper
    networks:
      - ecommerce-network

  kafka:
    image: bitnami/kafka:3.6
    container_name: ecommerce-kafka
    restart: unless-stopped
    ports:
      - "${KAFKA_PORT:-9092}:9092"
    environment:
      KAFKA_BROKER_ID: ${KAFKA_BROKER_ID:-1}
      KAFKA_CFG_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_CFG_LISTENERS: PLAINTEXT://:9092
      KAFKA_CFG_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      ALLOW_PLAINTEXT_LISTENER: "yes"
    volumes:
      - kafka_data:/bitnami/kafka
    depends_on:
      zookeeper:
        condition: service_started
    healthcheck:
      test: ["CMD", "kafka-topics.sh", "--bootstrap-server", "localhost:9092", "--list"]
      interval: 15s
      timeout: 10s
      retries: 10
      start_period: 30s
    networks:
      - ecommerce-network

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.2
    container_name: ecommerce-elasticsearch
    restart: unless-stopped
    ports:
      - "${ELASTIC_PORT:-9200}:9200"
    environment:
      discovery.type: single-node
      xpack.security.enabled: "false"
      ES_JAVA_OPTS: -Xms512m -Xmx512m
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9200/_cluster/health"]
      interval: 15s
      timeout: 10s
      retries: 10
      start_period: 60s
    networks:
      - ecommerce-network

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.2
    container_name: ecommerce-kibana
    restart: unless-stopped
    ports:
      - "${KIBANA_PORT:-5601}:5601"
    environment:
      ELASTICSEARCH_HOSTS: http://elasticsearch:9200
    depends_on:
      elasticsearch:
        condition: service_healthy
    networks:
      - ecommerce-network

volumes:
  postgres_data:
  redis_data:
  zookeeper_data:
  kafka_data:
  elasticsearch_data:
```

---

### Task 3: Create init script for multiple PostgreSQL databases

**Files:**
- Create: `infrastructure/docker/scripts/init-multiple-dbs.sh`

- [ ] **Write init-multiple-dbs.sh**

```bash
#!/bin/bash
set -e

if [ -n "$POSTGRES_MULTIPLE_DBS" ]; then
  for db in $(echo "$POSTGRES_MULTIPLE_DBS" | tr ',' ' '); do
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
      SELECT 'CREATE DATABASE $db'
      WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$db')\gexec
EOSQL
  done
fi
```

- [ ] **Make script executable**

```bash
git update-index --chmod=+x infrastructure/docker/scripts/init-multiple-dbs.sh
```

---

### Task 4: Verify Docker Compose

- [ ] **Validate docker-compose.yml syntax**

```bash
docker-compose -f infrastructure/docker/docker-compose.yml config
```
Expected: prints resolved config, no errors

- [ ] **Start services**

```bash
docker-compose -f infrastructure/docker/docker-compose.yml up -d
```
Expected: all containers start successfully

- [ ] **Check container status**

```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```
Expected: all 6 containers (ecommerce-postgres, ecommerce-redis, ecommerce-zookeeper, ecommerce-kafka, ecommerce-elasticsearch, ecommerce-kibana) showing healthy status

- [ ] **Stop containers when done**

```bash
docker-compose -f infrastructure/docker/docker-compose.yml down
```
