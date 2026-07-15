import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

import { MAIN_CATEGORIES, SUB_CATEGORIES } from '../data/categories';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductsAndFavorites = async () => {
      try {
        const [prodRes, favRes, catRes, bannerRes] = await Promise.all([
          api.get('/products'),
          api.get('/favorites').catch(() => ({ data: [] })),
          api.get('/products/categories').catch(() => ({ data: [] })),
          api.get('/products/banners/active').catch(() => ({ data: [] }))
        ]);
        
        if (prodRes.data && prodRes.data.content) {
          setProducts(prodRes.data.content.filter(p => p.approved && p.status === 'AVAILABLE'));
        } else if (Array.isArray(prodRes.data)) {
          setProducts(prodRes.data.filter(p => p.approved && p.status === 'AVAILABLE'));
        }

        if (Array.isArray(favRes.data)) {
          setFavorites(favRes.data.map(p => p.id));
        }

        if (Array.isArray(catRes.data)) {
          setCategories(catRes.data.filter(c => c.parentId == null));
        }

        if (Array.isArray(bannerRes.data)) {
          setBanners(bannerRes.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductsAndFavorites();
  }, []);

  const handleToggleFavorite = async (e, productId) => {
    e.preventDefault();
    try {
      await api.post(`/favorites/${productId}`);
      setFavorites(prev => 
        prev.includes(productId) 
          ? prev.filter(id => id !== productId)
          : [...prev, productId]
      );
    } catch (error) {
      if (error.response?.status === 401) {
        alert("Vui lòng đăng nhập để lưu tin!");
      }
    }
  };

  const productsByCategory = React.useMemo(() => {
    return products.reduce((acc, product) => {
      const cat = product.category || 'Khác';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(product);
      return acc;
    }, {});
  }, [products]);

  return (
    <main className="pt-24 pb-32 max-w-container-max mx-auto px-4 md:px-gutter">
      {/* Promotional Banners */}
      {banners.length > 0 && (
        <section className="mt-md mb-xl">
          <div className="w-full md:h-[390px] aspect-[2/1] md:aspect-auto rounded-xl overflow-hidden relative shadow-sm flex overflow-x-auto snap-x snap-mandatory hide-scrollbar">
            {banners.map((banner, index) => (
              <a 
                key={banner.id || index} 
                href={banner.targetUrl && banner.targetUrl !== '#' ? banner.targetUrl : undefined} 
                target={banner.targetUrl && banner.targetUrl !== '#' ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="w-full flex-none snap-center"
              >
                <div 
                  className="w-full h-full bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url('${banner.imageUrl}')` }}
                />
              </a>
            ))}
          </div>
          {banners.length > 1 && (
            <div className="flex justify-center mt-2 gap-2">
              {banners.map((_, idx) => (
                <div key={idx} className="w-2 h-2 rounded-full bg-outline-variant"></div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Categories */}
      <section className="mb-xl">
        <h2 className="font-headline-lg text-[20px] md:text-headline-lg font-bold mb-md text-on-surface">Khám phá danh mục</h2>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-y-6 gap-x-4">
          {categories.map((cat, idx) => (
            <Link to={`/search?category=${encodeURIComponent(cat.name)}`} key={cat.id || idx} className="flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-surface-container-low group-hover:bg-primary-fixed-dim transition-colors flex items-center justify-center mb-2 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] text-primary md:text-on-surface-variant group-hover:text-on-primary-fixed-variant">
                  <span className="material-symbols-outlined text-2xl transition-colors">{cat.iconName}</span>
              </div>
              <span className="font-label-sm md:font-body-md text-label-sm md:text-body-md text-center text-on-surface md:text-on-surface-variant group-hover:text-primary transition-colors">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Các sản phẩm theo danh mục */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-surface-variant border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        Object.keys(productsByCategory).map((categoryName) => (
          <section key={categoryName} className="mb-xl">
            <div className="flex justify-between items-end mb-md">
              <h2 className="font-headline-lg text-[20px] md:text-headline-lg font-bold text-on-surface">{categoryName}</h2>
              <Link to={`/search?category=${encodeURIComponent(categoryName)}`} className="font-label-sm text-label-sm text-primary-container hover:underline flex items-center gap-1">
                Xem tất cả <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {productsByCategory[categoryName].slice(0, 5).map((product) => (
                <Link to={`/product/${product.id}`} key={product.id} className="bg-surface rounded-xl overflow-hidden shadow-[0px_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group cursor-pointer border border-transparent hover:border-outline-variant flex flex-col h-full">
                  <div className="relative w-full pt-[75%] overflow-hidden">
                    <img className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                         alt={product.name} 
                         src={product.imageUrls && product.imageUrls[0] ? product.imageUrls[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'} />
                    <button 
                      className={`absolute top-2 right-2 p-1.5 backdrop-blur-sm rounded-full transition-colors ${favorites.includes(product.id) ? 'bg-[#ffebee] text-[#f44336]' : 'bg-surface/80 text-on-surface-variant hover:text-primary-container'}`} 
                      onClick={(e) => handleToggleFavorite(e, product.id)}
                    >
                      <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: favorites.includes(product.id) ? "'FILL' 1" : "'FILL' 0"}}>favorite</span>
                    </button>
                  </div>
                  <div className="p-3 flex flex-col flex-grow">
                    <div className="font-price-card text-price-card text-primary-container mb-1">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price || 0)}
                    </div>
                    <h3 className="font-body-md text-body-md text-on-surface line-clamp-2 mb-2 flex-grow">{product.name}</h3>
                    <div className="flex items-center text-on-surface-variant font-label-sm text-label-sm gap-1 mt-auto">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      <span className="truncate">{product.location || 'Toàn quốc'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
      
      {/* Nếu không có sản phẩm nào */}
      {!loading && Object.keys(productsByCategory).length === 0 && (
         <div className="text-center py-8 text-on-surface-variant mb-xl">
           Chưa có sản phẩm nào
         </div>
      )}

      {/* Tin nổi bật (Carousel) */}
      {!loading && products.length > 0 && (
        <section className="mb-xl">
          <div className="flex justify-between items-center mb-md">
            <h2 className="font-headline-lg text-[20px] md:text-headline-lg font-bold text-on-surface">Tin nổi bật</h2>
          </div>
          
          {/* Carousel Container */}
          <div className="relative w-full">
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x snap-mandatory">
              {products.slice(0, 5).map((product) => (
                <Link to={`/product/${product.id}`} key={product.id} className="snap-start flex-none w-[180px] md:w-[280px] bg-surface rounded-xl overflow-hidden shadow-[0px_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                  <div className="relative w-full h-[180px] md:h-[200px] overflow-hidden">
                    <img className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                         alt={product.name} 
                         src={product.imageUrls && product.imageUrls[0] ? product.imageUrls[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'} />
                    <button 
                      className={`absolute top-2 right-2 p-1.5 backdrop-blur-sm rounded-full transition-colors ${favorites.includes(product.id) ? 'bg-[#ffebee] text-[#f44336]' : 'bg-surface/80 text-on-surface-variant hover:text-primary-container'}`} 
                      onClick={(e) => handleToggleFavorite(e, product.id)}
                    >
                      <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: favorites.includes(product.id) ? "'FILL' 1" : "'FILL' 0"}}>favorite</span>
                    </button>
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <span className="bg-[#FFB800] text-[#1A1A1A] font-label-sm text-label-sm font-bold px-2 py-1 rounded-sm uppercase tracking-wider text-[10px]">Nổi bật</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="font-price-card text-price-card text-primary-container mb-1">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price || 0)}
                    </div>
                    <h3 className="font-body-md text-body-md text-on-surface line-clamp-2 mb-2">{product.name}</h3>
                    <div className="flex items-center text-on-surface-variant font-label-sm text-label-sm gap-1">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      <span className="truncate">{product.location || 'Toàn quốc'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default Home;
