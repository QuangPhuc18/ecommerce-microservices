import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Edit2, Trash2, Plus, X, CheckCircle, XCircle } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({ 
    name: '', description: '', price: 0, category: '', 
    location: '', itemCondition: 'NEW', status: 'AVAILABLE', approved: true 
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      // Spring Data JPA returns a Page object, the array is in res.data.content
      setProducts(res.data.content || res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      alert('Không thể tải danh sách sản phẩm!');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ 
        name: product.name, 
        description: product.description || '', 
        price: product.price, 
        category: product.category,
        location: product.location || '',
        itemCondition: product.itemCondition || 'NEW',
        status: product.status || 'AVAILABLE',
        approved: product.approved
      });
    } else {
      setEditingProduct(null);
      setFormData({ 
        name: '', description: '', price: 0, category: '', 
        location: '', itemCondition: 'NEW', status: 'AVAILABLE', approved: true 
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData);
        alert('Cập nhật sản phẩm thành công!');
      } else {
        await api.post('/products', formData);
        alert('Thêm sản phẩm thành công!');
      }
      handleCloseModal();
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài đăng này? Hành động này không thể hoàn tác!')) {
      try {
        await api.delete(`/products/${id}`);
        alert('Xóa thành công!');
        fetchProducts();
      } catch (err) {
        console.error(err);
        alert('Không thể xóa bài đăng này!');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ margin: 0 }}>Quản lý Sản phẩm / Bài đăng</h3>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Thêm Sản phẩm
        </button>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Đang tải dữ liệu...</div>
        ) : (
          <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem', width: '50px' }}>ID</th>
                <th style={{ padding: '1rem' }}>Tên sản phẩm</th>
                <th style={{ padding: '1rem' }}>Danh mục</th>
                <th style={{ padding: '1rem' }}>Giá (VND)</th>
                <th style={{ padding: '1rem' }}>Trạng thái</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Duyệt</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>{p.id}</td>
                  <td style={{ padding: '1rem', fontWeight: 500, maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</td>
                  <td style={{ padding: '1rem' }}>{p.category}</td>
                  <td style={{ padding: '1rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>{p.price?.toLocaleString()} đ</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600,
                      backgroundColor: p.status === 'AVAILABLE' ? '#dcfce7' : p.status === 'PENDING' ? '#fef3c7' : p.status === 'REJECTED' ? '#fee2e2' : '#f3f4f6',
                      color: p.status === 'AVAILABLE' ? '#166534' : p.status === 'PENDING' ? '#92400e' : p.status === 'REJECTED' ? '#991b1b' : '#374151'
                    }}>
                      {p.status === 'AVAILABLE' ? 'Đang bán' : p.status === 'PENDING' ? 'Chờ duyệt' : p.status === 'REJECTED' ? 'Bị từ chối' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    {p.approved ? (
                       <CheckCircle size={20} color="#10b981" title="Đã duyệt" />
                    ) : p.status === 'REJECTED' ? (
                       <XCircle size={20} color="#ef4444" title="Bị từ chối" />
                    ) : (
                       <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>⏳</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    <button onClick={() => handleOpenModal(p)} style={{ padding: '0.5rem', border: 'none', background: '#e0f2fe', color: '#0284c7', borderRadius: '6px', cursor: 'pointer' }} title="Sửa">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} style={{ padding: '0.5rem', border: 'none', background: '#fee2e2', color: '#ef4444', borderRadius: '6px', cursor: 'pointer' }} title="Xóa">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    Chưa có sản phẩm nào.
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
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative' }}>
            <button onClick={handleCloseModal} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>{editingProduct ? 'Sửa Sản phẩm' : 'Thêm Sản phẩm mới'}</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Tên sản phẩm</label>
                <input type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Giá (VND)</label>
                  <input type="number" className="input-field" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Danh mục</label>
                  <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    {/* Fallback in case categories API is empty */}
                    <option value="Điện thoại">Điện thoại</option>
                    <option value="Xe cộ">Xe cộ</option>
                  </select>
                </div>
              </div>

              {editingProduct && editingProduct.imageUrls && editingProduct.imageUrls.length > 0 && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Hình ảnh sản phẩm</label>
                  <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {editingProduct.imageUrls.map((url, idx) => (
                      <img key={idx} src={url} alt="product" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Trạng thái bán</label>
                  <select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="PENDING">Chờ duyệt</option>
                    <option value="AVAILABLE">Đang bán</option>
                    <option value="SOLD">Đã bán</option>
                    <option value="HIDDEN">Đã ẩn</option>
                    <option value="REJECTED">Từ chối</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Duyệt bài (Admin)</label>
                  <select className="input-field" value={formData.approved ? 'true' : 'false'} onChange={e => setFormData({...formData, approved: e.target.value === 'true'})}>
                    <option value="true">Đã duyệt (Cho phép hiển thị)</option>
                    <option value="false">Từ chối / Chờ duyệt</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Mô tả</label>
                <textarea className="input-field" style={{ minHeight: '100px', resize: 'vertical' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                {editingProduct && (!editingProduct.approved || editingProduct.status === 'PENDING') ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" onClick={async () => {
                      try {
                        const updated = { ...editingProduct, approved: true, status: 'AVAILABLE' };
                        await api.put(`/products/${editingProduct.id}`, updated);
                        alert('Đã duyệt bài đăng!');
                        handleCloseModal(); fetchProducts();
                      } catch(e) { alert('Lỗi!'); }
                    }} style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                      <CheckCircle size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> Duyệt bài
                    </button>
                    <button type="button" onClick={async () => {
                      try {
                        const updated = { ...editingProduct, approved: false, status: 'REJECTED' };
                        await api.put(`/products/${editingProduct.id}`, updated);
                        alert('Đã từ chối bài đăng!');
                        handleCloseModal(); fetchProducts();
                      } catch(e) { alert('Lỗi!'); }
                    }} style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                      <XCircle size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> Từ chối
                    </button>
                  </div>
                ) : <div></div>}
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Đóng</button>
                  <button type="submit" className="btn btn-primary">Lưu thông tin</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
