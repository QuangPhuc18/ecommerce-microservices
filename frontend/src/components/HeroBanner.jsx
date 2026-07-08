import React from 'react';
import { Search, MapPin } from 'lucide-react';

const HeroBanner = () => {
  return (
    <div style={{ backgroundColor: 'var(--primary-color)', padding: '3rem 1.5rem', textAlign: 'center', color: '#fff' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 700, color: '#fff' }}>
        Giá tốt, gần bạn, chốt nhanh!
      </h1>
      
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        display: 'flex', 
        backgroundColor: 'var(--bg-surface)', 
        borderRadius: 'var(--radius-md)', 
        padding: '0.5rem',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Input Search */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingLeft: '1rem', borderRight: '1px solid var(--border-color)' }}>
          <Search size={20} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Tìm sản phẩm..." 
            style={{ width: '100%', border: 'none', padding: '0.75rem', outline: 'none', backgroundColor: 'transparent', color: 'var(--text-primary)', fontSize: '1rem' }}
          />
        </div>
        
        {/* Location Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', cursor: 'pointer' }}>
          <MapPin size={20} color="var(--primary-color)" />
          <select style={{ border: 'none', padding: '0.75rem', outline: 'none', backgroundColor: 'transparent', color: 'var(--text-primary)', fontSize: '1rem', cursor: 'pointer', appearance: 'none' }}>
            <option>Chọn khu vực</option>
            <option>Toàn quốc</option>
            <option>TP.HCM</option>
            <option>Hà Nội</option>
          </select>
        </div>
        
        {/* Nút Tìm Kiếm */}
        <button className="btn btn-primary" style={{ padding: '0 2rem', borderRadius: 'var(--radius-md)', fontSize: '1.05rem' }}>
          Tìm kiếm
        </button>
      </div>
    </div>
  );
};

export default HeroBanner;
