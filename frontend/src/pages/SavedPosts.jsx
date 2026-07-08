import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

const SavedPosts = () => {
  const { user, loading: authLoading, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !user.isLoggedIn)) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (!user?.isLoggedIn) return;
      try {
        setLoading(true);
        const res = await api.get('/favorites');
        setProducts(res.data || []);
      } catch (error) {
        console.error("Lỗi lấy danh sách tin đã lưu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedPosts();
  }, [user]);

  const handleToggleFavorite = async (e, productId) => {
    e.preventDefault();
    try {
      await api.post(`/favorites/${productId}`);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '20/05/2024';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (authLoading || !user?.isLoggedIn) return null;

  return (
    <div className="bg-[#fcf9f8] min-h-screen font-sans text-[#1c1b1b] animate-fade-in">
      <header className="sticky top-0 z-50 flex justify-between items-center px-6 h-16 bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-2xl font-bold text-[#f26522]">ĐồCũ</Link>
          <nav className="hidden md:flex gap-6 items-center">
            <Link to="#" className="text-gray-600 hover:text-[#f26522] font-semibold text-sm transition-colors">Khám phá</Link>
            <Link to="/categories" className="text-gray-600 hover:text-[#f26522] font-semibold text-sm transition-colors">Danh mục</Link>
            <span className="text-[#f26522] font-bold text-sm border-b-2 border-[#f26522] pb-1">Tin đăng</span>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/post" className="bg-[#f26522] text-white font-bold py-1.5 px-4 rounded-full text-sm hover:bg-[#d65a1e] transition-colors shadow-sm">
            Đăng tin
          </Link>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto flex gap-6 pt-6 px-4 pb-12">
        {/* Sidebar */}
        <aside className="w-64 hidden md:flex flex-col bg-transparent">
          <div className="flex items-center gap-3 mb-6 p-4 rounded-xl">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
               <span className="material-symbols-outlined text-gray-400">person</span>
            </div>
            <div>
              <h3 className="font-bold text-[#1c1b1b] text-base leading-tight truncate w-36">{user.email?.split('@')[0] || 'Tài khoản'}</h3>
              <p className="text-xs text-gray-500 mt-0.5">Thành viên từ 2023</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            <Link to="#" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span className="text-sm font-semibold">Tổng quan</span>
            </Link>
            <Link to="/manage-posts" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <span className="material-symbols-outlined text-[20px]">list_alt</span>
              <span className="text-sm font-semibold">Quản lý tin đăng</span>
            </Link>
            <Link to="/saved-posts" className="flex items-center gap-3 px-4 py-2.5 bg-[#feb700] text-[#6b4b00] rounded-xl font-bold transition-transform shadow-sm">
              <span className="material-symbols-outlined text-[20px]">favorite</span>
              <span className="text-sm">Tin đã lưu</span>
            </Link>
            <Link to="/chat" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <span className="material-symbols-outlined text-[20px]">chat</span>
              <span className="text-sm font-semibold">Tin nhắn</span>
            </Link>
            <Link to="#" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              <span className="text-sm font-semibold">Ví điện tử</span>
            </Link>
          </nav>

          <div className="mt-4 px-4">
             <button className="w-full py-2.5 bg-[#6b4b00] text-[#feb700] rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#5e4200] transition-colors shadow-md">
               <span className="material-symbols-outlined text-[18px]">workspace_premium</span> Nâng cấp gói VIP
             </button>
          </div>

          <div className="mt-auto pt-6 flex flex-col gap-1 border-t border-gray-200 mt-6 mx-4">
            <Link to="#" className="flex items-center gap-3 px-2 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <span className="material-symbols-outlined text-[20px]">settings</span>
              <span className="text-sm font-semibold">Cài đặt</span>
            </Link>
            <button onClick={logout} className="flex items-center gap-3 px-2 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left w-full">
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="text-sm font-semibold">Đăng xuất</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[600px]">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#e91e63]">favorite</span> Tin đã lưu
          </h1>
          
          {/* Product List */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              <div className="col-span-full py-10 text-center text-gray-500">Đang tải danh sách tin đã lưu...</div>
            ) : products.length === 0 ? (
              <div className="col-span-full py-10 text-center text-gray-500 flex flex-col items-center">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">heart_broken</span>
                <p>Bạn chưa lưu tin đăng nào.</p>
                <Link to="/" className="mt-4 text-[#f26522] font-semibold hover:underline">Khám phá ngay</Link>
              </div>
            ) : (
              products.map(product => (
                <Link key={product.id} to={`/product/${product.id}`} className="bg-surface rounded-xl overflow-hidden shadow-[0px_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group cursor-pointer border border-transparent hover:border-outline-variant flex flex-col h-full">
                  <div className="relative w-full pt-[75%] overflow-hidden bg-gray-100">
                    {product.imageUrls?.[0] ? (
                      <img className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={product.name} src={product.imageUrls[0]} />
                    ) : (
                      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-gray-300">
                         <span className="material-symbols-outlined text-4xl">image</span>
                      </div>
                    )}
                    <button 
                      className="absolute top-2 right-2 p-1.5 backdrop-blur-sm rounded-full transition-colors bg-[#ffebee] text-[#f44336]"
                      onClick={(e) => handleToggleFavorite(e, product.id)}
                    >
                      <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>favorite</span>
                    </button>
                  </div>
                  <div className="p-3 flex flex-col flex-grow">
                    <div className="font-price-card text-price-card text-[#f26522] font-bold mb-1">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price || 0)}
                    </div>
                    <h3 className="text-sm text-gray-800 font-semibold line-clamp-2 mb-2 flex-grow">{product.name}</h3>
                    <div className="flex items-center text-gray-500 text-xs gap-1 mt-auto">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      <span className="truncate">{product.location || 'Toàn quốc'}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </main>
      
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SavedPosts;
