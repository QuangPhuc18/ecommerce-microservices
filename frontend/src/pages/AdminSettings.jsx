import React, { useState, useEffect } from 'react';
import { Save, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';

function AdminSettings() {
  const [settings, setSettings] = useState({
    logo_url: '',
    footer_description: '',
    footer_copyright: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/products/settings');
      setSettings(prev => ({
        ...prev,
        ...res.data
      }));
      setPreviewUrl(res.data.logo_url || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value
    });
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
    setSaving(true);
    
    try {
      let finalLogoUrl = settings.logo_url;
      
      // Upload file first if a new logo is selected
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append('files', selectedFile);
        
        const uploadRes = await api.post('/media/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (uploadRes.data && uploadRes.data.urls && uploadRes.data.urls.length > 0) {
          finalLogoUrl = `http://localhost:8088${uploadRes.data.urls[0]}`;
        }
      }

      const payload = {
        ...settings,
        logo_url: finalLogoUrl
      };

      await api.put('/products/settings', payload);
      
      // Update local state
      setSettings(payload);
      setSelectedFile(null);
      alert('Cập nhật cấu hình thành công!');
      
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi cập nhật!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ margin: 0 }}>Cấu hình Website</h3>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', maxWidth: '800px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Đang tải dữ liệu...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>1. Logo Trang Chủ (Header)</h4>
            
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Tải ảnh Logo lên</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange} 
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}
              />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Preview:</span>
                <div style={{ height: '60px', padding: '0.5rem', border: '1px dashed var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', minWidth: '150px' }}>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Logo Preview" style={{ height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <ImageIcon size={24} color="#94a3b8" />
                  )}
                </div>
              </div>
            </div>

            <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>2. Chân Trang (Footer)</h4>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Đoạn mô tả ngắn gọn</label>
              <textarea 
                name="footer_description"
                value={settings.footer_description} 
                onChange={handleTextChange} 
                rows="3"
                placeholder="VD: Nền tảng mua bán đồ cũ an toàn..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Bản quyền (Copyright)</label>
              <input 
                type="text" 
                name="footer_copyright"
                value={settings.footer_copyright} 
                onChange={handleTextChange} 
                placeholder="VD: © 2024 ĐồCũ. Renewed Value Community."
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem', fontWeight: 'bold' }}
              >
                <Save size={18} /> {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminSettings;
