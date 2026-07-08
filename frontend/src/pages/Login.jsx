import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/login', { email, password });
      // API returns token in res.data or res.data.token depending on your backend
      const token = res.data.token || res.data; 
      login(token);
      navigate('/');
    } catch (err) {
      setError('Sai email hoặc mật khẩu!');
    }
  };

  return (
    <div className="flex-center animate-fade-in" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.8rem' }}>Đăng Nhập</h2>
        {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email</label>
            <input type="email" required className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Nhập email của bạn" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Mật khẩu</label>
            <input type="password" required className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>Đăng Nhập Ngay</button>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Chưa có tài khoản? <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
