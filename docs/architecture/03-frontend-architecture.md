# Kiến trúc Frontend

## Tổng quan
Frontend sử dụng **Next.js 14+** với App Router, hỗ trợ Server Components và Client Components. Kiến trúc tổng thể như sau:

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
│ ├── (auth)/ # Routes không có header/footer
│ │ ├── login/page.tsx
│ │ ├── register/page.tsx
│ │ └── forgot-password/page.tsx
│ ├── (main)/ # Routes có layout chính (header, footer)
│ │ ├── layout.tsx
│ │ ├── page.tsx # Trang chủ
│ │ ├── product/
│ │ │ ├── [slug]/page.tsx # Chi tiết sản phẩm
│ │ │ ├── create/page.tsx # Đăng tin
│ │ │ └── edit/[id]/page.tsx
│ │ ├── category/[slug]/page.tsx
│ │ ├── search/page.tsx
│ │ ├── profile/
│ │ │ ├── page.tsx
│ │ │ └── [id]/page.tsx
│ │ ├── chat/
│ │ │ ├── page.tsx # Danh sách hội thoại
│ │ │ └── [conversationId]/page.tsx
│ │ ├── orders/
│ │ │ ├── page.tsx
│ │ │ └── [id]/page.tsx
│ │ └── favorites/page.tsx
│ ├── admin/ # Admin routes (phân quyền)
│ │ ├── layout.tsx
│ │ ├── dashboard/page.tsx
│ │ ├── users/
│ │ │ ├── page.tsx
│ │ │ └── [id]/page.tsx
│ │ ├── products/
│ │ │ ├── page.tsx
│ │ │ └── [id]/page.tsx
│ │ ├── orders/page.tsx
│ │ ├── reports/page.tsx
│ │ └── settings/page.tsx
│ └── api/ # BFF - API Routes
│ ├── auth/
│ │ ├── login/route.ts
│ │ └── register/route.ts
│ ├── products/
│ │ ├── route.ts
│ │ └── [id]/route.ts
│ ├── orders/route.ts
│ ├── chat/route.ts
│ └── search/route.ts
├── components/
│ ├── ui/ # Shadcn UI (Button, Input, Card...)
│ ├── layout/ # Header, Footer, Sidebar
│ ├── product/ # ProductCard, ProductList, ProductForm
│ ├── order/ # OrderCard, CheckoutForm
│ ├── chat/ # ChatList, ChatWindow
│ └── common/ # Loader, ErrorBoundary
├── lib/
│ ├── api/ # Axios instance, các API client (auth-api, product-api...)
│ ├── hooks/ # Custom hooks: useAuth, useSearch, useWebSocket...
│ ├── store/ # Zustand stores (auth-store, product-store, chat-store, ui-store)
│ ├── types/ # TypeScript types (user, product, order, api)
│ └── utils/ # format, validation, constants
├── middleware/ # Next.js middleware (auth, rate-limit)
├── styles/ # globals.css, tailwind.css
└── config/ # site.config.ts, api.config.ts