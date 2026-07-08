import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/register', formData);
      navigate('/login');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!');
      }
    }
  };

  return (
    <div className="flex-center animate-fade-in" style={{ minHeight: 'calc(100vh - 80px)', padding: '2rem 0' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.8rem' }}>Tạo Tài Khoản</h2>
        {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Họ và tên</label>
            <input type="text" name="name" required className="input-field" onChange={handleChange} placeholder="Nguyễn Văn A" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email</label>
            <input type="email" name="email" required className="input-field" onChange={handleChange} placeholder="email@example.com" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Mật khẩu</label>
            <input type="password" name="password" required className="input-field" onChange={handleChange} placeholder="Tạo mật khẩu an toàn" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Số điện thoại</label>
            <input type="text" name="phone" className="input-field" onChange={handleChange} placeholder="090..." />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Địa chỉ</label>
            <input type="text" name="address" className="input-field" onChange={handleChange} placeholder="TP.HCM" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>Đăng Ký</button>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Đã có tài khoản? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
