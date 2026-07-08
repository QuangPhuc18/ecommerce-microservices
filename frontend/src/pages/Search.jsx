import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const Search = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const initialCategory = query.get('category') || '';
  const initialMinPrice = query.get('minPrice') || '';
  const initialMaxPrice = query.get('maxPrice') || '';
  const initialLocation = query.get('location') || '';
  const initialKeyword = query.get('keyword') || '';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [tempCategory, setTempCategory] = useState(initialCategory);
  const [tempMinPrice, setTempMinPrice] = useState(initialMinPrice);
  const [tempMaxPrice, setTempMaxPrice] = useState(initialMaxPrice);
  const [tempLocation, setTempLocation] = useState(initialLocation);

  const [appliedFilters, setAppliedFilters] = useState({
    category: initialCategory,
    minPrice: initialMinPrice,
    maxPrice: initialMaxPrice,
    location: initialLocation,
    keyword: initialKeyword,
  });

  useEffect(() => {
    setActiveCategory(query.get('category') || '');
    setTempCategory(query.get('category') || '');
    setTempMinPrice(query.get('minPrice') || '');
    setTempMaxPrice(query.get('maxPrice') || '');
    setTempLocation(query.get('location') || '');
    setAppliedFilters({
      category: query.get('category') || '',
      minPrice: query.get('minPrice') || '',
      maxPrice: query.get('maxPrice') || '',
      location: query.get('location') || '',
      keyword: query.get('keyword') || ''
    });
  }, [useLocation().search]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { size: 100 };
        if (appliedFilters.category) params.category = appliedFilters.category;
        if (appliedFilters.minPrice) params.minPrice = appliedFilters.minPrice;
        if (appliedFilters.maxPrice) params.maxPrice = appliedFilters.maxPrice;
        if (appliedFilters.location) params.location = appliedFilters.location;
        if (appliedFilters.keyword) params.keyword = appliedFilters.keyword;

        const [prodRes, favRes] = await Promise.all([
          api.get('/products', { params }),
          api.get('/favorites').catch(() => ({ data: [] }))
        ]);
        
        const fetchedProducts = prodRes.data.content || prodRes.data;
        if (Array.isArray(fetchedProducts)) {
          setProducts(fetchedProducts.filter(p => p.approved && p.status === 'AVAILABLE'));
        }
        if (Array.isArray(favRes.data)) {
          setFavorites(favRes.data.map(p => p.id));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [appliedFilters]);

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

  const handleApplyFilter = () => {
    const params = new URLSearchParams();
    if (tempCategory) params.set('category', tempCategory);
    if (tempMinPrice) params.set('minPrice', tempMinPrice);
    if (tempMaxPrice) params.set('maxPrice', tempMaxPrice);
    if (tempLocation) params.set('location', tempLocation);
    if (appliedFilters.keyword) params.set('keyword', appliedFilters.keyword); // Keep keyword when applying other filters
    navigate(`/search?${params.toString()}`, { replace: true });
  };

  const handleClearFilter = () => {
    setActiveCategory('');
    setTempCategory('');
    setTempMinPrice('');
    setTempMaxPrice('');
    setTempLocation('');
    setAppliedFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      location: ''
    });
    navigate(`/search`, { replace: true });
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <Navbar />
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #dcd9d9; border-radius: 20px; }
      `}</style>
      
      <main className="flex-grow w-full max-w-container-max mx-auto px-4 md:px-gutter lg:px-lg py-lg flex flex-col gap-lg pt-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex text-on-surface-variant font-body-md text-body-md mt-4">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="inline-flex items-center hover:text-primary transition-colors">Trang chủ</Link>
            </li>
            {activeCategory && (
              <li>
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-sm mx-1">chevron_right</span>
                  <span aria-current="page" className="text-on-surface">{activeCategory}</span>
                </div>
              </li>
            )}
          </ol>
        </nav>
        
        <div className="flex flex-col lg:flex-row gap-lg items-start">
          {/* SideNavBar (Filters) */}
          <aside className="w-full lg:w-64 shrink-0 bg-surface border-r border-outline-variant p-md gap-sm hidden lg:flex flex-col rounded-xl lg:rounded-none lg:border-r lg:sticky lg:top-[80px] lg:h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar">
            <div className="mb-md">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">Bộ lọc</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {appliedFilters.keyword ? `Tìm kiếm: "${appliedFilters.keyword}"` : activeCategory ? `Danh mục ${activeCategory}` : 'Tất cả danh mục'}
              </p>
            </div>
            
            {/* Filter: Danh mục */}
            <div className="mb-lg border-b border-surface-variant pb-md">
              <h3 className="font-label-sm text-label-sm text-on-surface mb-sm uppercase tracking-wider flex items-center gap-xs">
                <span className="material-symbols-outlined text-[16px]">category</span> Danh mục
              </h3>
              <div className="flex flex-col gap-xs font-body-md text-body-md max-h-48 overflow-y-auto custom-scrollbar">
                <label className="flex items-center gap-sm cursor-pointer hover:bg-surface-container-low p-xs rounded transition-colors">
                  <input type="radio" name="category" value="" checked={tempCategory === ''} onChange={() => setTempCategory('')} className="rounded-full border-outline-variant text-primary-container focus:ring-primary-container"/> 
                  <span className="text-on-surface">Tất cả danh mục</span>
                </label>
                {["Xe cộ", "Điện tử", "Đồ gia dụng", "Nội thất", "Thời trang", "Mẹ & bé", "Thể thao", "Sách", "Thú cưng", "Đồ chơi", "Nhà đất", "Khác"].map(cat => (
                  <label key={cat} className="flex items-center gap-sm cursor-pointer hover:bg-surface-container-low p-xs rounded transition-colors">
                    <input type="radio" name="category" value={cat} checked={tempCategory === cat} onChange={() => setTempCategory(cat)} className="rounded-full border-outline-variant text-primary-container focus:ring-primary-container"/> 
                    <span className="text-on-surface">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter: Khoảng giá */}
            <div className="mb-lg border-b border-surface-variant pb-md">
              <h3 className="font-label-sm text-label-sm text-on-surface mb-sm uppercase tracking-wider flex items-center gap-xs">
                <span className="material-symbols-outlined text-[16px]">payments</span> Khoảng giá
              </h3>
              <div className="flex items-center gap-sm">
                <input 
                  type="number" 
                  value={tempMinPrice}
                  onChange={(e) => setTempMinPrice(e.target.value)}
                  className="w-full p-xs border border-surface-dim rounded text-center text-body-md focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none bg-surface-container-lowest" 
                  placeholder="TỪ" 
                />
                <span className="text-on-surface-variant">-</span>
                <input 
                  type="number" 
                  value={tempMaxPrice}
                  onChange={(e) => setTempMaxPrice(e.target.value)}
                  className="w-full p-xs border border-surface-dim rounded text-center text-body-md focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none bg-surface-container-lowest" 
                  placeholder="ĐẾN" 
                />
              </div>
            </div>
            
            {/* Filter: Khu vực */}
            <div className="mb-lg border-b border-surface-variant pb-md">
              <h3 className="font-label-sm text-label-sm text-on-surface mb-sm uppercase tracking-wider flex items-center gap-xs">
                <span className="material-symbols-outlined text-[16px]">location_on</span> Khu vực
              </h3>
              <select 
                value={tempLocation}
                onChange={(e) => setTempLocation(e.target.value)}
                className="w-full p-sm border border-surface-dim rounded mb-sm text-body-md bg-surface-container-lowest focus:border-primary-container outline-none"
              >
                <option value="">Chọn Tỉnh/Thành</option>
                <option value="HCM">TP. Hồ Chí Minh</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
              </select>
            </div>
            
            {/* Hãng xe removed */}

            <div className="flex flex-col gap-sm mt-auto">
              <button 
                onClick={handleApplyFilter}
                className="w-full bg-[#F26522] text-white font-label-sm text-label-sm py-sm rounded-lg hover:opacity-90 transition-opacity font-bold"
              >
                Áp dụng
              </button>
              <button 
                onClick={handleClearFilter}
                className="w-full bg-surface-container text-on-surface font-label-sm text-label-sm py-sm rounded-lg hover:bg-surface-container-high transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          </aside>
          
          {/* Main Content: Catalog */}
          <div className="flex-grow flex flex-col gap-lg w-full">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-sm bg-surface p-md rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-surface-container-low">
              <span className="font-body-md text-body-md text-on-surface-variant"><span className="font-bold text-on-surface">{products.length}</span> kết quả</span>
              <div className="flex items-center gap-sm">
                <label className="font-body-md text-body-md text-on-surface-variant whitespace-nowrap">Sắp xếp:</label>
                <select className="p-xs border border-surface-dim rounded text-body-md bg-surface-container-lowest focus:border-primary-container outline-none">
                  <option>Mới nhất</option>
                  <option>Giá thấp đến cao</option>
                  <option>Giá cao đến thấp</option>
                </select>
                <button className="lg:hidden p-xs border border-surface-dim rounded text-on-surface flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[20px]">filter_list</span>
                </button>
              </div>
            </div>
            
            {/* Product Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-surface-variant border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-md md:gap-lg">
                {products.length === 0 ? (
                  <div className="col-span-full py-10 text-center text-on-surface-variant">Không tìm thấy sản phẩm nào.</div>
                ) : (
                  products.map((product) => (
                    <Link to={`/product/${product.id}`} key={product.id} className="bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col overflow-hidden group border border-surface-container-low cursor-pointer">
                      <div className="relative w-full aspect-[4/3] overflow-hidden bg-surface-container">
                        <img 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          src={product.imageUrls && product.imageUrls[0] ? product.imageUrls[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'} 
                        />
                        {/* Mock tags giống thiết kế HTML */}
                        {product.id % 3 === 1 && (
                          <div className="absolute top-sm left-sm bg-[#007AFF] text-white font-label-sm text-[10px] px-xs py-[2px] rounded uppercase font-bold tracking-wide">Mới đăng</div>
                        )}
                        {product.id % 3 === 2 && (
                          <div className="absolute top-sm left-sm bg-[#FFB800] text-[#1A1A1A] font-label-sm text-[10px] px-xs py-[2px] rounded uppercase font-bold tracking-wide">Nổi bật</div>
                        )}
                        <button 
                          onClick={(e) => handleToggleFavorite(e, product.id)}
                          className={`absolute top-sm right-sm w-8 h-8 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors hover:bg-white hover:text-error ${favorites.includes(product.id) ? 'bg-[#ffebee] text-error' : 'bg-black/20 text-white'}`}
                        >
                          <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: favorites.includes(product.id) ? "'FILL' 1" : "'FILL' 0"}}>favorite</span>
                        </button>
                      </div>
                      <div className="p-sm flex flex-col flex-grow gap-xs">
                        <h3 className="font-body-md text-body-md text-on-surface line-clamp-2 leading-tight min-h-[40px]">{product.name}</h3>
                        <div className="font-price-card text-price-card text-[#F26522] mt-auto">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price || 0)}
                        </div>
                        <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-[11px] mt-xs">
                          <span className="flex items-center gap-[2px] truncate">
                            <span className="material-symbols-outlined text-[14px]">location_on</span> {product.location || 'Toàn quốc'}
                          </span>
                          <span className="whitespace-nowrap">Mới</span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Search;
