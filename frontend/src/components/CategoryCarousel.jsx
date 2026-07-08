import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Smartphone, Bike, Home as HomeIcon, Car, Briefcase, Monitor, Dog, Refrigerator, Sofa, Grid } from 'lucide-react';

const iconMapping = {
  Smartphone: <Smartphone size={28} />,
  Bike: <Bike size={28} />,
  Home: <HomeIcon size={28} />,
  Car: <Car size={28} />,
  Briefcase: <Briefcase size={28} />,
  Monitor: <Monitor size={28} />,
  Dog: <Dog size={28} />,
  Refrigerator: <Refrigerator size={28} />,
  Sofa: <Sofa size={28} />
};

const CategoryCarousel = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/products/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1.5rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
      {categories.length > 0 ? categories.map(cat => (
        <div key={cat.id} style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '0.5rem', 
          minWidth: '80px',
          cursor: 'pointer',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            {iconMapping[cat.iconName] || <Grid size={28} />}
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', textAlign: 'center', fontWeight: 500 }}>
            {cat.name}
          </span>
        </div>
      )) : (
        <div style={{ textAlign: 'center', width: '100%', color: 'var(--text-secondary)' }}>Đang tải danh mục...</div>
      )}
    </div>
  );
};

export default CategoryCarousel;
