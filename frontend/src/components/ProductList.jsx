import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        if (response.data && response.data.content) {
          setProducts(response.data.content);
        } else if (Array.isArray(response.data)) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        Sản phẩm dành cho bạn
      </h2>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '300px' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {products.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ color: 'var(--text-secondary)' }}>Chưa có sản phẩm nào trên sàn.</h3>
            </div>
          ) : (
            products.map(product => (
              <Link to={`/product/${product.id}`} key={product.id} style={{ display: 'block' }}>
                <div className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform var(--transition-fast)', height: '100%' }}
                     onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
                     onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  
                  {/* Product Image */}
                  <div style={{ height: '200px', backgroundColor: '#e2e8f0', backgroundImage: `url(${product.imageUrls && product.imageUrls[0] ? product.imageUrls[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  
                  {/* Product Info */}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: 'var(--text-primary)' }}>
                      {product.name}
                    </h3>
                    
                    <div style={{ color: 'var(--primary-color)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem' }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price || 0)}
                    </div>
                    
                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={14} /> {product.location || 'Toàn quốc'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={14} /> {product.itemCondition === 'NEW' ? 'Mới 100%' : 'Đã sử dụng'}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProductList;
