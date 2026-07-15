import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';

function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
  const [formData, setFormData] = useState({ imageUrl: '', targetUrl: '', isActive: true });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await api.get('/products/banners');
      setBanners(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({ 
        imageUrl: banner.imageUrl, 
        targetUrl: banner.targetUrl || '', 
        isActive: banner.isActive 
      });
      setPreviewUrl(banner.imageUrl);
    } else {
      setEditingBanner(null);
      setFormData({ imageUrl: '', targetUrl: '', isActive: true });
      setPreviewUrl('');
    }
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imageUrl && !selectedFile) {
      alert("Vui lòng chọn ảnh!");
      return;
    }

    try {
      let finalImageUrl = formData.imageUrl;
      
      // Upload file first if a new file is selected
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append('files', selectedFile);
        
        const uploadRes = await api.post('/media/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (uploadRes.data && uploadRes.data.urls && uploadRes.data.urls.length > 0) {
          finalImageUrl = `http://localhost:8088${uploadRes.data.urls[0]}`;
        }
      }

      const payload = {
        ...formData,
        imageUrl: finalImageUrl
      };

      if (editingBanner) {
        await api.put(`/products/banners/${editingBanner.id}`, payload);
        alert('Cập nhật Banner thành công!');
      } else {
        await api.post('/products/banners', payload);
        alert('Thêm Banner mới thành công!');
      }
      setShowModal(false);
      fetchBanners();
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa Banner này?')) {
      try {
        await api.delete(`/products/banners/${id}`);
        alert('Xóa thành công!');
        fetchBanners();
      } catch (err) {
        console.error(err);
        alert('Không thể xóa Banner này!');
      }
    }
  };

  const toggleStatus = async (banner) => {
    try {
      await api.put(`/products/banners/${banner.id}`, {
        ...banner,
        isActive: !banner.isActive
      });
      fetchBanners();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ margin: 0 }}>Quản lý Banner</h3>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Thêm Banner mới
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
                <th style={{ padding: '1rem', width: '300px' }}>Hình ảnh</th>
                <th style={{ padding: '1rem' }}>Đường dẫn (Target URL)</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Trạng thái</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {banners.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{b.id}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ width: '250px', height: '80px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {b.imageUrl ? (
                        <img src={b.imageUrl} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <ImageIcon size={24} color="#94a3b8" />
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    {b.targetUrl ? <a href={b.targetUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)' }}>{b.targetUrl}</a> : <i>Không có</i>}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button 
                      onClick={() => toggleStatus(b)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        border: 'none',
                        borderRadius: '20px',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        background: b.isActive ? '#dcfce7' : '#fee2e2',
                        color: b.isActive ? '#16a34a' : '#ef4444',
                      }}
                    >
                      {b.isActive ? 'Đang bật' : 'Đang tắt'}
                    </button>
                  </td>
                  <td style={{ padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', height: '112px' }}>
                    <button onClick={() => handleOpenModal(b)} style={{ padding: '0.5rem', border: 'none', background: '#e0f2fe', color: '#0284c7', borderRadius: '6px', cursor: 'pointer' }} title="Sửa">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(b.id)} style={{ padding: '0.5rem', border: 'none', background: '#fee2e2', color: '#ef4444', borderRadius: '6px', cursor: 'pointer' }} title="Xóa">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {banners.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Chưa có banner nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>{editingBanner ? 'Sửa Banner' : 'Thêm Banner Mới'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Hình ảnh Banner *</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '0.5rem' }}
                  required={!editingBanner}
                />
                {previewUrl && (
                  <div style={{ marginTop: '0.5rem', borderRadius: '8px', overflow: 'hidden', height: '150px' }}>
                    <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#f1f5f9' }} />
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Link đích (Target URL)</label>
                <input 
                  type="text" 
                  value={formData.targetUrl} 
                  onChange={e => setFormData({...formData, targetUrl: e.target.value})} 
                  placeholder="https://... (nơi người dùng sẽ đến khi click vào banner)"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.isActive} 
                  onChange={e => setFormData({...formData, isActive: e.target.checked})} 
                />
                <label htmlFor="isActive" style={{ fontWeight: 'bold', cursor: 'pointer' }}>Kích hoạt (Hiển thị trên trang chủ)</label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--border-color)', background: 'transparent', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold' }}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 'bold' }}>Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBanners;
