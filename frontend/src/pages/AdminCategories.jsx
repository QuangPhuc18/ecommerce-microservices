import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Edit2, Trash2, Plus, X } from 'lucide-react';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', iconName: '' });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      alert('Không thể tải danh sách danh mục!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, iconName: category.iconName });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', iconName: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/products/categories/${editingCategory.id}`, formData);
        alert('Cập nhật danh mục thành công!');
      } else {
        await api.post('/products/categories', formData);
        alert('Tạo danh mục thành công!');
      }
      handleCloseModal();
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        await api.delete(`/products/categories/${id}`);
        alert('Xóa thành công!');
        fetchCategories();
      } catch (err) {
        console.error(err);
        alert('Không thể xóa danh mục này!');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ margin: 0 }}>Quản lý Danh mục</h3>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Thêm Danh mục mới
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
                <th style={{ padding: '1rem' }}>Tên Danh mục</th>
                <th style={{ padding: '1rem' }}>Tên Icon (lucide-react)</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>{c.id}</td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: '1rem' }}>{c.iconName}</td>
                  <td style={{ padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    <button onClick={() => handleOpenModal(c)} style={{ padding: '0.5rem', border: 'none', background: '#e0f2fe', color: '#0284c7', borderRadius: '6px', cursor: 'pointer' }} title="Sửa">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} style={{ padding: '0.5rem', border: 'none', background: '#fee2e2', color: '#ef4444', borderRadius: '6px', cursor: 'pointer' }} title="Xóa">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    Chưa có danh mục nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Cập nhật / Thêm mới */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '500px', maxWidth: '90%', padding: '2rem', position: 'relative' }}>
            <button onClick={handleCloseModal} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>{editingCategory ? 'Sửa Danh mục' : 'Thêm Danh mục mới'}</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Tên Danh mục</label>
                <input type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Ví dụ: Xe cộ" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Tên Icon</label>
                <input type="text" className="input-field" value={formData.iconName} onChange={e => setFormData({...formData, iconName: e.target.value})} required placeholder="Ví dụ: Car (từ lucide-react)" />
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

export default AdminCategories;
