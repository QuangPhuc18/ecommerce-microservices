# Kiến trúc Frontend

## Tổng quan
- **Framework**: Next.js 14+ với App Router.
- **Ngôn ngữ**: TypeScript.
- **Giao diện**: React kết hợp Tailwind CSS và Shadcn/ui.
- **State Management**: Zustand (client state) + TanStack Query (server state / cache).
- **API Client**: Axios, WebSocket (Socket.io) cho chat.
- **Middleware**: Xác thực, giới hạn tốc độ, geo-routing (tùy chọn).
- **Kiến trúc**: Server Components (RSC) kết hợp Client Components, có BFF (Backend for Frontend) qua API Routes.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND ARCHITECTURE                                 │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                         NEXT.JS 14+ (App Router)                          │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                         │
│          ┌───────────────────────────┼───────────────────────────┐            │
│          │                           │                           │            │
│          ▼                           ▼                           ▼            │
│  ┌───────────────┐   ┌───────────────┐   ┌───────────────┐                    │
│  │  Server       │   │  Client       │   │  Middleware   │                    │
│  │  Components   │   │  Components   │   │               │                    │
│  │  (RSC)        │   │  (CSR)        │   │  • Auth       │                    │
│  └───────────────┘   └───────────────┘   │  • Rate Limit │                    │
│          │                   │           │  • Geo        │                    │
│          │                   │           └───────────────┘                    │
│          ▼                   ▼                                                │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                      STATE MANAGEMENT (Zustand)                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │  Auth Store  │  │  Product     │  │  Chat Store  │  │  UI Store    │ │ │
│  │  │              │  │  Store       │  │              │  │              │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                         │
│                                      ▼                                         │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                         API CLIENT LAYER                                 │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │   Axios      │  │   React      │  │   SWR/       │  │  WebSocket   │ │ │
│  │  │  Instance    │  │   Query      │  │  TanStack    │  │  Client      │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                         │
│                                      ▼                                         │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                      BFF (Backend for Frontend)                          │ │
│  │  • API Routes (Next.js) • Data Aggregation • Response Transformation     │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                         │
│                                      ▼                                         │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                       API GATEWAY (Spring Cloud Gateway)                  │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                         │
│          ┌───────────────────────────┼───────────────────────────┐            │
│          │                           │                           │            │
│          ▼                           ▼                           ▼            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth       │  │   Product    │  │   Order      │  │   Chat       │      │
│  │   Service    │  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Cấu trúc thư mục
frontend/apps/web/src/
├── app/
│ ├── (auth)/ # Nhóm route không có header/footer (trang đăng nhập, đăng ký)
│ │ ├── login/page.tsx
│ │ ├── register/page.tsx
│ │ └── forgot-password/page.tsx
│ │
│ ├── (main)/ # Nhóm route có layout chính (header, footer)
│ │ ├── layout.tsx # Layout wrapper (Header + Footer)
│ │ ├── page.tsx # Trang chủ
│ │ ├── product/
│ │ │ ├── [slug]/page.tsx # Chi tiết sản phẩm (SEO-friendly)
│ │ │ ├── create/page.tsx # Đăng tin mới
│ │ │ └── edit/[id]/page.tsx # Chỉnh sửa sản phẩm
│ │ ├── category/[slug]/page.tsx # Danh sách sản phẩm theo danh mục
│ │ ├── search/page.tsx # Kết quả tìm kiếm + bộ lọc
│ │ ├── profile/
│ │ │ ├── page.tsx # Hồ sơ cá nhân
│ │ │ └── [id]/page.tsx # Hồ sơ của người dùng khác
│ │ ├── chat/
│ │ │ ├── page.tsx # Danh sách hội thoại
│ │ │ └── [conversationId]/page.tsx # Khung chat realtime
│ │ ├── orders/
│ │ │ ├── page.tsx # Lịch sử đơn hàng
│ │ │ └── [id]/page.tsx # Chi tiết đơn hàng
│ │ └── favorites/page.tsx # Sản phẩm đã yêu thích
│ │
│ ├── admin/ # Khu vực quản trị (yêu cầu role ADMIN)
│ │ ├── layout.tsx # Layout admin (sidebar + header)
│ │ ├── dashboard/page.tsx # Dashboard thống kê
│ │ ├── users/
│ │ │ ├── page.tsx # Quản lý người dùng
│ │ │ └── [id]/page.tsx # Chi tiết người dùng
│ │ ├── products/
│ │ │ ├── page.tsx # Quản lý sản phẩm (duyệt, ẩn)
│ │ │ └── [id]/page.tsx # Chi tiết sản phẩm (admin)
│ │ ├── orders/page.tsx # Quản lý đơn hàng
│ │ ├── reports/page.tsx # Báo cáo, thống kê
│ │ └── settings/page.tsx # Cấu hình hệ thống
│ │
│ └── api/ # BFF (Backend for Frontend) – API Routes
│ ├── auth/
│ │ ├── login/route.ts # Proxy đăng nhập
│ │ └── register/route.ts # Proxy đăng ký
│ ├── products/
│ │ ├── route.ts # GET (list), POST (create)
│ │ └── [id]/route.ts # GET, PUT, DELETE
│ ├── orders/route.ts # Lấy danh sách / tạo đơn
│ ├── chat/route.ts # Lấy danh sách hội thoại
│ └── search/route.ts # Tìm kiếm sản phẩm (aggregation)
│
├── components/ # React components
│ ├── ui/ # Shadcn/ui cơ bản (Button, Input, Card, Dialog...)
│ ├── layout/ # Layout components (Header, Footer, Sidebar)
│ ├── product/ # ProductCard, ProductList, ProductForm, ImageUploader
│ ├── order/ # OrderCard, CheckoutForm, OrderStatusBadge
│ ├── chat/ # ChatList, ChatWindow, MessageBubble
│ └── common/ # Loader, ErrorBoundary, EmptyState, Pagination
│
├── lib/ # Logic nghiệp vụ, cấu hình, utilities
│ ├── api/ # Axios instance và các API client
│ │ ├── axios.ts # Axios config (baseURL, interceptors)
│ │ ├── auth-api.ts # Auth endpoints
│ │ ├── product-api.ts
│ │ ├── order-api.ts
│ │ ├── chat-api.ts
│ │ └── search-api.ts
│ ├── hooks/ # Custom React hooks
│ │ ├── useAuth.ts
│ │ ├── useSearch.ts # Debounced search
│ │ ├── useCart.ts # (nếu có giỏ hàng)
│ │ ├── useWebSocket.ts # Chat connection
│ │ └── usePagination.ts
│ ├── store/ # Zustand stores
│ │ ├── auth-store.ts # user, token, isAuthenticated
│ │ ├── product-store.ts # product list, filters, pagination
│ │ ├── chat-store.ts # conversations, messages, unread count
│ │ └── ui-store.ts # theme, sidebar open, toast
│ ├── types/ # TypeScript type definitions
│ │ ├── user.ts
│ │ ├── product.ts
│ │ ├── order.ts
│ │ └── api.ts # Generic API response types
│ └── utils/ # Helper functions
│ ├── format.ts # formatCurrency, formatDate
│ ├── validation.ts # validateEmail, validatePhone
│ └── constants.ts # app constants (roles, order status)
│
├── middleware/ # Next.js middleware (chạy trên server)
│ ├── auth.ts # Kiểm tra JWT, bảo vệ route admin/profile
│ └── rate-limit.ts # Giới hạn request dựa trên IP (tùy chọn)
│
├── styles/ # CSS files
│ ├── globals.css # Base styles + Tailwind imports
│ └── tailwind.css # Tailwind directives
│
└── config/ # App configuration
├── site.config.ts # Metadata, site name, description
└── api.config.ts # API gateway base URL, timeout, retry


## Ghi chú quan trọng
- **Server Components**: Các page và layout mặc định là Server Components (RSC) để tối ưu SEO và tốc độ tải.
- **Client Components**: Các component cần tương tác (form, button, chat) sử dụng `'use client'` directive.
- **Middleware**: Xác thực được thực hiện ở middleware trước khi route đến page, giúp bảo vệ route admin và profile.
- **API Routes (BFF)**: Đóng vai trò trung gian, tập hợp dữ liệu từ nhiều microservice, giảm số lượng request từ client.
- **State Management**: Dùng Zustand cho global state (auth, chat, UI), TanStack Query cho server-state (cache data từ API).
- **WebSocket**: Chat sử dụng Socket.io client kết nối đến backend Chat Service.

## Tài liệu liên quan
- [Tổng quan kiến trúc](01-overview.md)
- [Backend Services](02-backend-services.md)
- [Cơ chế giao tiếp](05-communication.md)