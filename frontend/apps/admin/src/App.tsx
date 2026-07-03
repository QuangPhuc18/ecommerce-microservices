import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshCw,
  ClipboardList as OrderIcon
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  
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
  const [seedOrderProductId, setSeedOrderProductId] = useState('');
  const [seedOrderQuantity, setSeedOrderQuantity] = useState('1');

  const handleLogout = useCallback(() => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setProducts([]);
    setReports([]);
    setOrders([]);
    setLogs([]);
  }, []);

  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...(options.headers || {}),
      'Authorization': `Bearer ${token}`
    };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401 || res.status === 403) {
      handleLogout();
      throw new Error('Unauthorized or Session Expired');
    }
    return res;
  }, [token, handleLogout]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setDashboardError(null);
    try {
      const [statRes, prodRes, repRes, orderRes, logsRes] = await Promise.all([
        fetchWithAuth(`${API_BASE_URL}/api/v1/admin/statistics`),
        fetchWithAuth(`${API_BASE_URL}/api/v1/products?page=0&size=50`),
        fetchWithAuth(`${API_BASE_URL}/api/v1/reports?page=0&size=50`),
        fetchWithAuth(`${API_BASE_URL}/api/v1/orders/admin?page=0&size=50`),
        fetchWithAuth(`${API_BASE_URL}/api/v1/admin/logs?page=0&size=50`)
      ]);

      if (statRes.ok) {
        const stats = await statRes.json();
        setStatistics(stats);
      }
      if (prodRes.ok) {
        const pData = await prodRes.json();
        setProducts(pData.products || []);
      }
      if (repRes.ok) {
        const rData = await repRes.json();
        setReports(rData.content || []);
      }
      if (orderRes.ok) {
        const oData = await orderRes.json();
        setOrders(oData.orders || []);
      }
      if (logsRes.ok) {
        const lData = await logsRes.json();
        setLogs(lData.content || []);
      }
    } catch (err: any) {
      console.error(err);
      setDashboardError(err.message || 'Failed to fetch dashboard data. Make sure all microservices are online.');
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token, fetchDashboardData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        let errMsg = 'Invalid email or password';
        try {
          const errData = await res.json();
          if (errData && errData.message) {
            errMsg = errData.message;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }
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
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, phone, fullName })
      });
      if (!res.ok) {
        let errMsg = 'Registration failed. Ensure email ends with @c2c.com and contains admin for ROLE_ADMIN';
        try {
          const errData = await res.json();
          if (errData && errData.message) {
            errMsg = errData.message;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      localStorage.setItem('admin_token', data.accessToken);
      setToken(data.accessToken);
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed');
    }
  };

  // Moderation Mutations
  const updateProductStatus = async (productId: number, newStatus: string) => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/products/${productId}`, {
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
      const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/products/${productId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note: 'Admin updated order status' })
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
      const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/reports/${reportId}/resolve`, {
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
      const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/products`, {
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
        const prodData = await res.json();
        if (prodData && prodData.id) {
          setSeedOrderProductId(prodData.id.toString());
        }
        fetchDashboardData();
        alert('Product seeded successfully!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const seedReport = async (prodId: number) => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/reports`, {
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

  const seedOrder = async () => {
    if (!seedOrderProductId) {
      alert('Please specify a Product ID to seed an order!');
      return;
    }
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: parseInt(seedOrderProductId),
          quantity: parseInt(seedOrderQuantity),
          shippingAddress: {
            fullName: 'Test Buyer',
            phone: '0987654321',
            address: '123 Test St',
            ward: 'Ward 1',
            district: 'District 1',
            province: 'Province 1'
          }
        })
      });
      if (res.ok) {
        fetchDashboardData();
        alert('Order seeded successfully!');
      } else {
        const errorText = await res.text();
        alert(`Failed to seed order: ${errorText}`);
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
                  <label htmlFor="reg-fullname" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Full Name</label>
                  <input id="reg-fullname" type="text" required value={fullName} onChange={e => setFullName(e.target.value)} style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label htmlFor="reg-phone" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Phone</label>
                  <input id="reg-phone" type="text" required placeholder="10-20 chars" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }} />
                </div>
              </>
            )}
            <div>
              <label htmlFor="auth-email" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email</label>
              <input id="auth-email" type="email" required placeholder={isRegister ? 'Must end with @c2c.com' : 'admin@c2c.com'} value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label htmlFor="auth-password" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Password</label>
              <input id="auth-password" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }} />
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
              { id: 'orders', label: 'Orders', icon: OrderIcon },
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
          {dashboardError && (
            <div style={{ color: 'var(--danger)', background: 'var(--danger-bg)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '14px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {dashboardError}
            </div>
          )}
          {activeTab === 'dashboard' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                {[
                  { label: 'Total Users', value: statistics.totalUsers || 0, icon: UserCheck, color: 'var(--primary)' },
                  { label: 'Total Products', value: statistics.totalProducts || 0, icon: ShoppingBag, color: 'var(--success)' },
                  { label: 'Total Orders', value: statistics.totalOrders || 0, icon: OrderIcon, color: 'var(--warning)' },
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
                          aria-label="Update product status"
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
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              background: 'var(--danger-bg)',
                              color: 'var(--danger)',
                              border: '1px solid rgba(239,68,68,0.2)',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={14} style={{ marginRight: '4px' }} />
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

          {activeTab === 'orders' && (
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '16px' }}>Order ID</th>
                    <th style={{ padding: '16px' }}>Order Number</th>
                    <th style={{ padding: '16px' }}>Total Amount</th>
                    <th style={{ padding: '16px' }}>Buyer ID</th>
                    <th style={{ padding: '16px' }}>Status</th>
                    <th style={{ padding: '16px' }}>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '16px', fontSize: '13px' }}>{order.id}</td>
                      <td style={{ padding: '16px', fontWeight: 'bold' }}>{order.orderNumber}</td>
                      <td style={{ padding: '16px' }}>{order.totalAmount} USD</td>
                      <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '13px' }}>{order.buyerId}</td>
                      <td style={{ padding: '16px' }}>
                        <select 
                          aria-label="Update order status"
                          value={order.status} 
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          style={{
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            padding: '6px 12px',
                            borderRadius: '4px'
                          }}
                        >
                          {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'].map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '13px' }}>{new Date(order.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No orders found.</td>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
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

                {/* Order Seeder */}
                <div style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0, marginBottom: '20px' }}>
                    <PlusCircle size={22} color="var(--success)" />
                    Seed Test Order
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Product ID to Order</label>
                      <input type="number" value={seedOrderProductId} placeholder="Seeded product ID" onChange={e => setSeedOrderProductId(e.target.value)} style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Quantity</label>
                      <input type="number" min="1" value={seedOrderQuantity} onChange={e => setSeedOrderQuantity(e.target.value)} style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }} />
                    </div>
                    <button 
                      onClick={seedOrder}
                      style={{
                        padding: '12px',
                        background: 'var(--success)',
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
                      Seed Order
                    </button>
                  </div>
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
                    Use the order seeder to submit a test order. It requires a valid Product ID. Seeding an order triggers the Saga transaction coordinator across the services.
                  </p>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '14px' }}>
                    Once seeded, you can view the new products in the <strong>Products</strong> tab, view the orders in the <strong>Orders</strong> tab, or resolve reports in the <strong>Reports</strong> tab.
                  </p>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-primary)', borderLeft: '4px solid var(--primary)', borderRadius: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <strong>API Gateway Target:</strong> {API_BASE_URL}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
