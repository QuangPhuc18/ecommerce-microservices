# Admin Dashboard & Testing UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal**: Establish a premium dark-themed Admin Dashboard SPA using Vite, React, and Vanilla CSS inside `frontend/apps/admin`, along with backend security integration changes, to test the existing microservices.

**Architecture**: 
- A single-page dashboard with a sidebar and tabs: Dashboard, Products, Reports, Orders, Logs, and Auth/Sandbox.
- Backend security changes: automatic `ROLE_ADMIN` promotion for emails containing `admin` in `auth-service`, and gateway-header validation filter in `analytics-service`.
- Axios instances configured with the base URL `http://localhost:8080` to communicate directly with the Spring Cloud API Gateway.

**Tech Stack**: Vite, React 18, TypeScript, Vanilla CSS (dark glassmorphic theme), Lucide React (icons), Spring Boot, Java 21.

## Global Constraints
- Target workspace folder for frontend is `frontend/apps/admin`
- Target base gateway API URL is `http://localhost:8080`
- Stylings must use custom CSS properties (Vanilla CSS) for a premium dark mode interface. No Tailwind CSS.

---

### Task 1: Enable Admin Role Auto-Promotion in `auth-service`

**Files**:
- Modify: `backend/auth-service/src/main/java/com/c2c/auth/service/AuthService.java:43-50`

**Interfaces**:
- Consumes: User registration requests via POST `/api/v1/auth/register`
- Produces: Registers users as `ROLE_ADMIN` if the email contains the substring `admin`

- [ ] **Step 1: Write the role promotion code**
Modify `AuthService.java` around line 43 to assign `User.Role.ROLE_ADMIN` dynamically based on the email.
```java
        var user = User.builder()
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getEmail().contains("admin") ? User.Role.ROLE_ADMIN : User.Role.ROLE_USER)
                .active(true)
                .build();
```

- [ ] **Step 2: Compile backend**
Run: `mvn clean compile -pl auth-service` in `backend` directory.
Expected: Compilation passes with no errors.

- [ ] **Step 3: Commit changes**
```bash
git add backend/auth-service/src/main/java/com/c2c/auth/service/AuthService.java
git commit -m "feat(auth): assign ROLE_ADMIN automatically if email contains admin"
```

---

### Task 2: Ingest Gateway Auth Headers in `analytics-service`

**Files**:
- Create: `backend/analytics-service/src/main/java/com/c2c/analytics/security/GatewayHeaderAuthFilter.java`
- Modify: `backend/analytics-service/src/main/java/com/c2c/analytics/config/SecurityConfig.java`

**Interfaces**:
- Consumes: `X-User-Id` and `X-User-Role` headers from API Gateway requests.
- Produces: Populates Spring Security `SecurityContext` with the resolved user ID and role authority.

- [ ] **Step 1: Create GatewayHeaderAuthFilter**
Write the filter file: `backend/analytics-service/src/main/java/com/c2c/analytics/security/GatewayHeaderAuthFilter.java`
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

- [ ] **Step 2: Update SecurityConfig in `analytics-service`**
Modify `backend/analytics-service/src/main/java/com/c2c/analytics/config/SecurityConfig.java` to inject the filter and add it to the filter chain.
```java
package com.c2c.analytics.config;

import com.c2c.analytics.security.GatewayHeaderAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final GatewayHeaderAuthFilter gatewayHeaderAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/reports/**").authenticated()
                .requestMatchers("/actuator/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(gatewayHeaderAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

- [ ] **Step 3: Compile analytics-service**
Run: `mvn clean compile -pl analytics-service` in `backend` directory.
Expected: Compilation passes successfully.

- [ ] **Step 4: Commit**
```bash
git add backend/analytics-service/src/main/java/com/c2c/analytics/security/GatewayHeaderAuthFilter.java backend/analytics-service/src/main/java/com/c2c/analytics/config/SecurityConfig.java
git commit -m "feat(analytics): add gateway header authentication filter"
```

---

### Task 3: Initialize Vite React TypeScript App in `frontend/apps/admin`

**Files**:
- Create: All config and initial setup files in `frontend/apps/admin/`

- [ ] **Step 1: Run Vite initialization**
Initialize a new Vite + React + TS project:
Run: `npx -y create-vite@latest frontend/apps/admin --template react-ts` inside root workspace.
Expected: Vite folder created successfully.

- [ ] **Step 2: Install dependencies**
Run: `npm install` inside `frontend/apps/admin` to set up initial packages, then run: `npm install lucide-react` for icons.
Expected: Installation completes.

- [ ] **Step 3: Run the dev server to verify**
Run: `npm run dev -- --port 3001` in `frontend/apps/admin` and verify Vite page is accessible.

- [ ] **Step 4: Commit**
```bash
git add frontend/apps/admin
git commit -m "chore(admin): initialize Vite React TypeScript app"
```

---

### Task 4: Setup CSS Global Styles & Theme Variables

**Files**:
- Modify: `frontend/apps/admin/src/index.css`
- Modify: `frontend/apps/admin/src/main.tsx`

- [ ] **Step 1: Write Custom Premium Dark-Mode CSS**
Overwrite `frontend/apps/admin/src/index.css` with the design token values and dark-mode styling:
```css
:root {
  --bg-primary: #0b0f19;
  --bg-secondary: #131c2e;
  --bg-surface: #1e293b;
  --border-color: #334155;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --success: #10b981;
  --success-bg: rgba(16, 185, 129, 0.1);
  --warning: #f59e0b;
  --warning-bg: rgba(245, 158, 11, 0.1);
  --danger: #ef4444;
  --danger-bg: rgba(239, 68, 68, 0.1);
  
  --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

* {
  box-sizing: border-box;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: var(--bg-primary);
}
::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: var(--radius-sm);
}
```

- [ ] **Step 2: Clean up unused files**
Delete:
- `frontend/apps/admin/src/App.css`
Update `frontend/apps/admin/src/main.tsx` to remove App.css import.

- [ ] **Step 3: Commit**
```bash
git add frontend/apps/admin/src/index.css frontend/apps/admin/src/main.tsx
git commit -m "style(admin): add premium dark mode design system in css variables"
```

---

### Task 5: Implement App Core Logic, Authentication & Sandbox Seeder

**Files**:
- Create: `frontend/apps/admin/src/App.tsx`

**Interfaces**:
- Handles registration/login using `http://localhost:8080/api/v1/auth/register` and `/login`.
- Stores JWT token in `localStorage`.
- Includes a "Developer Sandbox" to seed mock data via endpoint requests.

- [ ] **Step 1: Implement App.tsx**
Overwrite `frontend/apps/admin/src/App.tsx` with the complete client implementation. This file contains the sidebar layout, active tab routing, and authentication views.

*(Full source code is provided below to ensure no placeholders)*:
```tsx
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  AlertTriangle, 
  FileText, 
  Terminal, 
  UserCheck, 
  LogOut, 
  PlusCircle, 
  Database,
  Trash2,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

interface UserInfo {
  userId: string;
  email: string;
  role: string;
}

interface Product {
  id: number;
  title: string;
  price: number;
  status: string;
  sellerName: string;
  createdAt: string;
}

interface Report {
  id: string;
  productId: number;
  reason: string;
  description: string;
  status: string;
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  buyerId: string;
  createdAt: string;
}

interface LogEntry {
  id: string;
  action: string;
  performedBy: string;
  details: string;
  timestamp: string;
}

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [authError, setAuthError] = useState('');
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  // Dashboard & Lists Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [statistics, setStatistics] = useState<any>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  // Seed form variables
  const [seedProductTitle, setSeedProductTitle] = useState('Test iPhone 15 Pro');
  const [seedProductPrice, setSeedProductPrice] = useState('1200.00');

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('http://localhost:8080/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('Invalid email or password');
      const data = await res.json();
      localStorage.setItem('admin_token', data.accessToken);
      setToken(data.accessToken);
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('http://localhost:8080/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, phone, fullName })
      });
      if (!res.ok) throw new Error('Registration failed. Ensure email contains admin for ROLE_ADMIN');
      const data = await res.json();
      localStorage.setItem('admin_token', data.accessToken);
      setToken(data.accessToken);
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setProducts([]);
    setReports([]);
    setOrders([]);
    setLogs([]);
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...(options.headers || {}),
      'Authorization': `Bearer ${token}`
    };
    return fetch(url, { ...options, headers });
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Statistics
      const statRes = await fetchWithAuth('http://localhost:8080/api/v1/admin/statistics');
      if (statRes.ok) {
        const stats = await statRes.json();
        setStatistics(stats);
      }

      // Products
      const prodRes = await fetchWithAuth('http://localhost:8080/api/v1/products?page=0&size=50');
      if (prodRes.ok) {
        const pData = await prodRes.json();
        setProducts(pData.products || []);
      }

      // Reports
      const repRes = await fetchWithAuth('http://localhost:8080/api/v1/reports?page=0&size=50');
      if (repRes.ok) {
        const rData = await repRes.json();
        setReports(rData.content || []);
      }

      // Logs
      const logsRes = await fetchWithAuth('http://localhost:8080/api/v1/admin/logs?page=0&size=50');
      if (logsRes.ok) {
        const lData = await logsRes.json();
        setLogs(lData.content || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Moderation Mutations
  const updateProductStatus = async (productId: number, newStatus: string) => {
    try {
      const res = await fetchWithAuth(`http://localhost:8080/api/v1/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetchWithAuth(`http://localhost:8080/api/v1/products/${productId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resolveReport = async (reportId: string) => {
    try {
      const res = await fetchWithAuth(`http://localhost:8080/api/v1/reports/${reportId}/resolve`, {
        method: 'PUT'
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Seeding tools
  const seedProduct = async () => {
    try {
      const res = await fetchWithAuth('http://localhost:8080/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: seedProductTitle,
          description: 'Automatically generated test description.',
          price: parseFloat(seedProductPrice),
          currency: 'USD',
          categoryId: 1,
          attributes: { color: 'Black', storage: '256GB' }
        })
      });
      if (res.ok) {
        fetchDashboardData();
        alert('Product seeded successfully!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const seedReport = async (prodId: number) => {
    try {
      const res = await fetchWithAuth('http://localhost:8080/api/v1/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: prodId,
          reason: 'SPAM',
          description: 'Reported during automated testing dashboard action.'
        })
      });
      if (res.ok) {
        fetchDashboardData();
        alert('Product report seeded successfully!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!token) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '20px' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '40px', borderRadius: 'var(--radius-lg)', width: '450px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
            {isRegister ? 'Register Admin Portal' : 'Admin Panel Login'}
          </h2>
          
          {authError && (
            <div style={{ color: 'var(--danger)', background: 'var(--danger-bg)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '14px', border: '1px solid rgba(239,68,68,0.2)' }}>
              {authError}
            </div>
          )}

          <form onSubmit={isRegister ? handleRegister : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {isRegister && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Full Name</label>
                  <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Phone</label>
                  <input type="text" required placeholder="10-20 chars" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }} />
                </div>
              </>
            )}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email</label>
              <input type="email" required placeholder={isRegister ? 'Must contain admin@c2c.com' : 'admin@c2c.com'} value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Password</label>
              <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }} />
            </div>
            
            <button type="submit" style={{ padding: '14px', background: 'var(--primary)', border: 'none', color: 'white', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              {isRegister ? 'Register' : 'Login'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)' }}>
            {isRegister ? 'Already have an account?' : "Don't have an admin?"} {' '}
            <span onClick={() => setIsRegister(!isRegister)} style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}>
              {isRegister ? 'Login' : 'Register Admin'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: '280px', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 40px 0', color: 'white' }}>
            <Database color="var(--primary)" size={28} />
            Admin Dashboard
          </h2>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'products', label: 'Products', icon: ShoppingBag },
              { id: 'reports', label: 'Reports', icon: AlertTriangle },
              { id: 'logs', label: 'System Logs', icon: FileText },
              { id: 'sandbox', label: 'Sandbox Seeder', icon: Terminal }
            ].map(tab => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'var(--primary)' : 'transparent',
                    color: isSelected ? 'white' : 'var(--text-secondary)',
                    fontWeight: isSelected ? 'bold' : 'normal',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <button 
          onClick={handleLogout} 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: 'var(--danger-bg)',
            color: 'var(--danger)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer'
          }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Header */}
        <header style={{ height: '70px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', background: 'var(--bg-secondary)' }}>
          <h3 style={{ margin: 0, textTransform: 'capitalize' }}>{activeTab} Management</h3>
          <button 
            onClick={fetchDashboardData} 
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={16} className={loading ? 'spin-anim' : ''} />
            Refresh
          </button>
        </header>

        {/* Content Tabs */}
        <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          {activeTab === 'dashboard' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                {[
                  { label: 'Total Users', value: statistics.totalUsers || 0, icon: UserCheck, color: 'var(--primary)' },
                  { label: 'Total Products', value: statistics.totalProducts || 0, icon: ShoppingBag, color: 'var(--success)' },
                  { label: 'Total Orders', value: statistics.totalOrders || 0, icon: FileText, color: 'var(--warning)' },
                  { label: 'Total Revenue', value: `${statistics.totalRevenue || 0} USD`, icon: Database, color: 'var(--danger)' }
                ].map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <div key={i} style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{card.label}</span>
                        <Icon size={24} color={card.color} />
                      </div>
                      <h2 style={{ margin: 0, fontSize: '2rem' }}>{card.value}</h2>
                    </div>
                  );
                })}
              </div>

              <h3 style={{ marginBottom: '20px' }}>Recent Reports</h3>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '16px' }}>Product ID</th>
                      <th style={{ padding: '16px' }}>Reason</th>
                      <th style={{ padding: '16px' }}>Description</th>
                      <th style={{ padding: '16px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.slice(0, 5).map(rep => (
                      <tr key={rep.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '16px' }}>{rep.productId}</td>
                        <td style={{ padding: '16px' }}><span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', background: 'var(--warning-bg)', color: 'var(--warning)' }}>{rep.reason}</span></td>
                        <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{rep.description}</td>
                        <td style={{ padding: '16px' }}>{rep.status}</td>
                      </tr>
                    ))}
                    {reports.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No open reports found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '16px' }}>ID</th>
                    <th style={{ padding: '16px' }}>Title</th>
                    <th style={{ padding: '16px' }}>Price</th>
                    <th style={{ padding: '16px' }}>Seller</th>
                    <th style={{ padding: '16px' }}>Status</th>
                    <th style={{ padding: '16px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(prod => (
                    <tr key={prod.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '16px' }}>{prod.id}</td>
                      <td style={{ padding: '16px', fontWeight: 'bold' }}>{prod.title}</td>
                      <td style={{ padding: '16px' }}>{prod.price} USD</td>
                      <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{prod.sellerName}</td>
                      <td style={{ padding: '16px' }}>
                        <select 
                          value={prod.status} 
                          onChange={(e) => updateProductStatus(prod.id, e.target.value)}
                          style={{
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            padding: '6px 12px',
                            borderRadius: '4px'
                          }}
                        >
                          {['ACTIVE', 'INACTIVE', 'SOLD', 'HIDDEN'].map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button 
                            onClick={() => seedReport(prod.id)}
                            style={{ padding: '6px 12px', background: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Report
                          </button>
                          <button 
                            onClick={() => deleteProduct(prod.id)}
                            style={{ padding: '6px 12px', background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No products in database. Go to Sandbox to seed.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reports' && (
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '16px' }}>Report ID</th>
                    <th style={{ padding: '16px' }}>Product ID</th>
                    <th style={{ padding: '16px' }}>Reason</th>
                    <th style={{ padding: '16px' }}>Description</th>
                    <th style={{ padding: '16px' }}>Status</th>
                    <th style={{ padding: '16px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map(rep => (
                    <tr key={rep.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '16px', fontSize: '13px' }}>{rep.id}</td>
                      <td style={{ padding: '16px' }}>{rep.productId}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                          {rep.reason}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{rep.description}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          fontSize: '12px', 
                          background: rep.status === 'RESOLVED' ? 'var(--success-bg)' : 'var(--danger-bg)', 
                          color: rep.status === 'RESOLVED' ? 'var(--success)' : 'var(--danger)' 
                        }}>
                          {rep.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {rep.status !== 'RESOLVED' && (
                          <button 
                            onClick={() => resolveReport(rep.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              background: 'var(--success-bg)',
                              color: 'var(--success)',
                              border: '1px solid rgba(16,185,129,0.2)',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <CheckCircle size={14} />
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No reports found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'logs' && (
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '16px' }}>Timestamp</th>
                    <th style={{ padding: '16px' }}>Action</th>
                    <th style={{ padding: '16px' }}>Performed By</th>
                    <th style={{ padding: '16px' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '13px' }}>{new Date(log.timestamp).toLocaleString()}</td>
                      <td style={{ padding: '16px', fontWeight: 'bold' }}>{log.action}</td>
                      <td style={{ padding: '16px' }}>{log.performedBy}</td>
                      <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '13px' }}>{log.details}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No admin action logs recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'sandbox' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              {/* Product Seeder */}
              <div style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0, marginBottom: '20px' }}>
                  <PlusCircle size={22} color="var(--primary)" />
                  Seed Test Product
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Product Name</label>
                    <input type="text" value={seedProductTitle} onChange={e => setSeedProductTitle(e.target.value)} style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Price (USD)</label>
                    <input type="number" value={seedProductPrice} onChange={e => setSeedProductPrice(e.target.value)} style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }} />
                  </div>
                  <button 
                    onClick={seedProduct}
                    style={{
                      padding: '12px',
                      background: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Database size={16} />
                    Seed Product
                  </button>
                </div>
              </div>

              {/* Info panel */}
              <div style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Developer Help</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '14px' }}>
                    This Sandbox tab triggers simulated user actions inside the microservice network. Use the product seeder to instantly create products in the <code>product-service</code> database.
                  </p>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '14px' }}>
                    Once seeded, you can view the new products in the <strong>Products</strong> tab, submit mock reports against them, or test changing their moderation status.
                  </p>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-primary)', borderLeft: '4px solid var(--primary)', borderRadius: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <strong>API Gateway Target:</strong> http://localhost:8080
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Remove default boilerplate in App.tsx**
Ensure the above code is fully written, overwriting Vite's boilerplate `App.tsx`.

- [ ] **Step 3: Commit**
```bash
git add frontend/apps/admin/src/App.tsx
git commit -m "feat(admin): implement App view with auth and developer sandbox seeder"
```

---

### Task 6: Add CSS Styling Keyframe Animations

**Files**:
- Modify: `frontend/apps/admin/src/index.css`

- [ ] **Step 1: Write spinning animation styles**
Add keyframe animations to the bottom of `frontend/apps/admin/src/index.css`:
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin-anim {
  animation: spin 1s linear infinite;
}
```

- [ ] **Step 2: Commit**
```bash
git add frontend/apps/admin/src/index.css
git commit -m "style(admin): add spin animation style for refreshing status"
```
