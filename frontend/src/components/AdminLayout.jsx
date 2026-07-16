import React, { useContext } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { LayoutDashboard, Users, ShoppingBag, List, Settings, LogOut } from 'lucide-react';
import '../index.css';

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user || user.role !== 'ADMIN') {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'white', margin: '2rem auto', maxWidth: '500px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: '#e74c3c' }}>gpp_bad</span>
        <h2 style={{ marginTop: '1rem', color: '#1c1b1b' }}>Không có quyền truy cập</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>Bạn không có quyền Quản trị viên để xem trang này.</p>
        <button style={{ backgroundColor: '#feb700', color: '#6b4b00', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate('/')}>Về trang chủ</button>
      </div>
    );
  }

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Tổng quan' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Quản lý Người dùng' },
    { path: '/admin/categories', icon: <List size={20} />, label: 'Quản lý Danh mục' },
    { path: '/admin/products', icon: <ShoppingBag size={20} />, label: 'Quản lý Sản phẩm' },
    { path: '/admin/banners', icon: <LayoutDashboard size={20} />, label: 'Quản lý Banner' },
    { path: '/admin/settings', icon: <Settings size={20} />, label: 'Cấu hình Website' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-body)' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: '#fff', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>Chợ Tốt Admin</h2>
        </div>
        
        <nav style={{ padding: '1rem', flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {menuItems.map(item => (
              <li key={item.path}>
                <Link 
                  to={item.path}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
                    borderRadius: 'var(--radius-md)', textDecoration: 'none',
                    color: location.pathname === item.path ? 'white' : 'var(--text-secondary)',
                    backgroundColor: location.pathname === item.path ? 'var(--primary-color)' : 'transparent',
                    fontWeight: location.pathname === item.path ? '600' : 'normal',
                    transition: 'all 0.2s'
                  }}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => { logout(); navigate('/login'); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'transparent', border: 'none', color: '#e74c3c', cursor: 'pointer', borderRadius: 'var(--radius-md)' }}
          >
            <LogOut size={20} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{ height: '70px', backgroundColor: '#fff', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>
            {menuItems.find(i => i.path === location.pathname)?.label || 'Bảng điều khiển'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user?.name?.charAt(0) || 'A'}
            </div>
            <span style={{ fontWeight: '500' }}>{user?.name || 'Admin'}</span>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
