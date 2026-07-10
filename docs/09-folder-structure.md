# 09. Folder Structure

This document provides a directory tree mapping of the **ĐồCũ** repository, explaining the layout of the frontend, gateway, and all backend microservices.

---

## 1. Repository Directory Tree

```
ecommerce-microservices/
│
├── .codegraph/                  # CodeGraph configuration & indexed symbol maps
├── .github/                     # GitHub Actions CI/CD workflows
│
├── docs/                        # Project Technical Documentation
│   ├── 01-project-overview.md
│   ├── 02-system-architecture.md
│   ├── 03-microservices.md
│   ├── 04-technology-stack.md
│   ├── 05-workflow.md
│   ├── 06-database.md
│   ├── 07-api-flow.md
│   ├── 08-deployment.md
│   └── 09-folder-structure.md
│
├── frontend/                    # Vite + React + Tailwind CSS SPA
│   ├── public/                  # Static public assets
│   ├── src/                     # React source files
│   │   ├── assets/              # Design styles and custom animations
│   │   ├── components/          # Reusable UI widgets
│   │   ├── contexts/            # Global state context handlers
│   │   ├── pages/               # Application page screens
│   │   └── services/            # Axios API configuration
│   │   ├── App.css              # Root application styling
│   │   ├── App.jsx              # Routing and primary layout
│   │   ├── index.css            # Main tailwind and custom design system rules
│   │   └── main.jsx             # React DOM entry point
│   ├── package.json             # NPM dependencies & run commands
│   ├── tailwind.config.js       # Tailwind CSS variables and theme properties
│   └── vite.config.js           # Vite development server settings
│
└── backend/                     # Spring Boot / Maven Multi-Module Microservices
    ├── pom.xml                  # Parent Maven Project Object Model file
    ├── docker-compose.yml       # Local Docker container orchestration manifest
    ├── init-db.sql              # MySQL initialization script for database schemas
    │
    ├── api-gateway/             # Gateway proxy service (Port 8088)
    ├── eureka-server/           # Service discovery registry (Port 8761)
    ├── user-service/            # Authentication & user profiles (Port 8085)
    ├── product-service/         # Product catalog and favorites (Port 8081)
    ├── order-service/           # Transaction processing service (Port 8082)
    ├── chat-service/            # Direct messaging chat logs (Port 8086)
    ├── media-service/           # File manager (Port 8083)
    ├── notification-service/    # Asynchronous alerts manager (Port 8087)
    ├── review-service/          # Ratings & peer reviews (Port 8089)
    └── payment-service/         # VNPay API transaction gateway (Port 8090)
```

---

## 2. Microservice Module Substructure

Every backend microservice in the `backend/` directory follows the standard Maven folder layout:

```
[service-module]/
│
├── src/
│   ├── main/
│   │   ├── java/com/example/[service_name]/
│   │   │   ├── config/          # Configurations (WebSocket, Security, RabbitMQ)
│   │   │   ├── controller/      # REST API endpoints & mapping controllers
│   │   │   ├── dto/             # Data Transfer Objects (Requests & Responses)
│   │   │   ├── entity/          # JPA database Entity files mapping to MySQL tables
│   │   │   ├── exception/       # Custom Exception definitions & Global Handler
│   │   │   ├── listener/        # AMQP RabbitMQ message consumers (if applicable)
│   │   │   ├── repository/      # Spring Data JPA Repository database interfaces
│   │   │   ├── security/        # JWT utilities & filters (if applicable)
│   │   │   └── service/         # Business logic implementation classes
│   │   │   └── [Application.java] # Main Spring Boot executable class
│   │   │
│   │   └── resources/
│   │       ├── application.properties         # Local environment properties
│   │       └── application-docker.properties  # Overrides active under container profile
│   │
│   └── test/                    # JUnit and Mockito test suites
│
├── Dockerfile                   # Container build blueprint
└── pom.xml                      # Maven module configurations & dependencies
```

---

## 3. Frontend Source Substructure

The `frontend/src/` directory contains folders grouped by architectural role:

* **`components/`**: Houses static and stateless structural components reused across pages:
  * `Navbar.jsx`: Global header navigation.
  * `BottomNav.jsx`: Mobile navigation menu.
  * `Footer.jsx`: The page footer.
  * `CategoryCarousel.jsx`: Horizontal scrolling categories list.
  * `HeroBanner.jsx`: Welcome header on main screen.
  * `ProductList.jsx`: Product grid container.
  * `AdminLayout.jsx`: Navigation layout for administrators.
* **`contexts/`**: Contains React Context Providers.
  * `AuthContext.jsx`: Restores session states from `localStorage` and decodes user properties (email, role, ID) from the JWT.
* **`pages/`**: Primary page routers containing full screen structures.
  * `Home.jsx` / `Search.jsx`: Landing page and multi-faceted product filtering catalog.
  * `ProductDetail.jsx`: Extended descriptions, product specs, reviews, and transaction actions.
  * `Chat.jsx`: Visual chat box for buyers and sellers (polls backend dynamically).
  * `ManagePosts.jsx` / `PostProduct.jsx`: Creation form and listing managers for seller inventory.
  * `SavedPosts.jsx`: Saved bookmarks list.
  * `SellerProfile.jsx`: Seller details and reputation dashboard.
  * `UserSettings.jsx`: Profile forms and avatar photo upload.
  * `Login.jsx` / `Register.jsx`: Authorization access panels.
  * `AdminUsers.jsx` / `AdminCategories.jsx` / `AdminProducts.jsx`: Admin moderation pages.
* **`services/`**: Interceptors and API setups.
  * `api.js`: Instantiates Axios with `baseURL: http://localhost:8088`. Configures a request interceptor to dynamically inject the authorization token: `Authorization: Bearer <jwt_token>`.
* **`index.css`**: Core design rules declaring CSS utility variables for the application (custom fonts, responsive grid grids, active transitions).
