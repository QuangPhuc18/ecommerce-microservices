import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Edit2, Trash2, Plus, X } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'USER', password: '' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      alert('Không thể tải danh sách người dùng!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, phone: user.phone || '', role: user.role, password: '' });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', phone: '', role: 'USER', password: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Update
        await api.put(`/users/${editingUser.id}`, formData);
        alert('Cập nhật thành công!');
      } else {
        // Create
        await api.post('/users', formData);
        alert('Tạo người dùng thành công!');
      }
      handleCloseModal();
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await api.delete(`/users/${id}`);
        alert('Xóa thành công!');
        fetchUsers();
      } catch (err) {
        console.error(err);
        alert('Không thể xóa người dùng này!');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ margin: 0 }}>Quản lý Người Dùng</h3>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Thêm User mới
        </button>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Đang tải dữ liệu...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem', width: '50px' }}>ID</th>
                <th style={{ padding: '1rem' }}>Họ Tên</th>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>Số điện thoại</th>
                <th style={{ padding: '1rem' }}>Vai trò</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>{u.id}</td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{u.name}</td>
                  <td style={{ padding: '1rem' }}>{u.email}</td>
                  <td style={{ padding: '1rem' }}>{u.phone || '-'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600,
                      backgroundColor: u.role === 'ADMIN' ? '#ffeaa7' : '#dfe6e9',
                      color: u.role === 'ADMIN' ? '#d35400' : '#2d3436'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    <button onClick={() => handleOpenModal(u)} style={{ padding: '0.5rem', border: 'none', background: '#e0f2fe', color: '#0284c7', borderRadius: '6px', cursor: 'pointer' }} title="Sửa">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(u.id)} style={{ padding: '0.5rem', border: 'none', background: '#fee2e2', color: '#ef4444', borderRadius: '6px', cursor: 'pointer' }} title="Xóa">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Cập nhật / Thêm mới */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '500px', maxWidth: '90%', padding: '2rem', position: 'relative' }}>
            <button onClick={handleCloseModal} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>{editingUser ? 'Sửa User' : 'Thêm User mới'}</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Họ Tên</label>
                <input type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email</label>
                <input type="email" className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Số điện thoại</label>
                <input type="text" className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Mật khẩu {editingUser && '(Bỏ trống nếu không đổi)'}</label>
                <input type="password" className="input-field" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!editingUser} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Phân quyền</label>
                <select className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="USER">User (Người dùng thường)</option>
                  <option value="ADMIN">Admin (Quản trị viên)</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
