import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

const ManagePosts = () => {
  const { user, loading: authLoading, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Đang hiển thị');

  // Kiểm tra đăng nhập
  useEffect(() => {
    if (!authLoading && (!user || !user.isLoggedIn)) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tin này?")) {
      try {
        await api.delete(`/products/${id}`);
        setProducts(products.filter(p => p.id !== id));
      } catch (err) {
        console.error(err);
        alert('Có lỗi xảy ra khi xóa tin');
      }
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const product = products.find(p => p.id === id);
      await api.put(`/products/${id}`, { ...product, status: newStatus });
      setProducts(products.map(p => p.id === id ? { ...p, status: newStatus } : p));
      alert(`Đã cập nhật trạng thái thành: ${newStatus === 'SOLD' ? 'Đã bán' : 'Đã ẩn'}`);
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  // Fetch danh sách tin đăng của user
  useEffect(() => {
    const fetchMyProducts = async () => {
      if (!user?.isLoggedIn) return;
      try {
        setLoading(true);
        const res = await api.get(`/products?sellerId=${user.userId}&size=100`);
        setProducts(res.data.content || []);
      } catch (error) {
        console.error("Lỗi lấy danh sách sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProducts();
    
    // Fetch profile for sidebar
    if (user?.userId) {
      api.get(`/users/${user.userId}`)
         .then(res => setUserProfile(res.data))
         .catch(err => console.error(err));
    }
  }, [user]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '20/05/2024';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Helper tính mock views/likes cho đẹp UI vì backend chưa có trường này
  const getMockStats = (id) => {
    return {
      views: (id * 153) % 3000,
      likes: (id * 17) % 200
    };
  };

  if (authLoading || !user?.isLoggedIn) return null;

  const tabs = [
    { id: 'Đang hiển thị', count: products.filter(p => p.approved && p.status === 'AVAILABLE').length },
    { id: 'Chờ duyệt', count: products.filter(p => !p.approved && (p.status === 'PENDING' || !p.status || p.status === 'AVAILABLE' || p.status === 'ACTIVE')).length },
    { id: 'Hết hạn', count: 0 },
    { id: 'Bị từ chối', count: products.filter(p => !p.approved && p.status === 'REJECTED').length },
    { id: 'Đã ẩn', count: products.filter(p => p.status === 'HIDDEN' || p.status === 'SOLD').length }
  ];

  const displayedProducts = products.filter(p => {
    if (activeTab === 'Đang hiển thị') return p.approved && p.status === 'AVAILABLE';
    if (activeTab === 'Chờ duyệt') return !p.approved && (p.status === 'PENDING' || !p.status || p.status === 'AVAILABLE' || p.status === 'ACTIVE');
    if (activeTab === 'Bị từ chối') return !p.approved && p.status === 'REJECTED';
    if (activeTab === 'Đã ẩn') return p.status === 'HIDDEN' || p.status === 'SOLD';
    return false;
  });

  return (
    <div className="bg-[#fcf9f8] min-h-screen font-sans text-[#1c1b1b] animate-fade-in">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-6 h-16 bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-2xl font-bold text-[#f26522]">ĐồCũ</Link>
          <nav className="hidden md:flex gap-6 items-center">
            <Link to="#" className="text-gray-600 hover:text-[#f26522] font-semibold text-sm transition-colors">Khám phá</Link>
            <Link to="/categories" className="text-gray-600 hover:text-[#f26522] font-semibold text-sm transition-colors">Danh mục</Link>
            <span className="text-[#f26522] font-bold text-sm border-b-2 border-[#f26522] pb-1">Tin đăng</span>
            <Link to="#" className="text-gray-600 hover:text-[#f26522] font-semibold text-sm transition-colors">Hỗ trợ</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
            <input className="w-64 pl-9 pr-4 py-1.5 bg-gray-100 rounded-full border-none text-sm outline-none focus:ring-1 focus:ring-[#f26522]" placeholder="Tìm kiếm tin đăng..." type="text"/>
          </div>
          <span className="material-symbols-outlined text-gray-500 cursor-pointer hover:text-[#f26522]">storefront</span>
          <span className="material-symbols-outlined text-gray-500 cursor-pointer hover:text-[#f26522]">notifications</span>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 cursor-pointer">
            {userProfile?.avatarUrl ? (
              <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-gray-400 bg-gray-100 w-full h-full flex items-center justify-center">person</span>
            )}
          </div>
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
               {userProfile?.avatarUrl ? (
                 <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <span className="material-symbols-outlined text-gray-400">person</span>
               )}
            </div>
            <div>
              <h3 className="font-bold text-[#1c1b1b] text-base leading-tight truncate w-36">{userProfile?.name || user.email?.split('@')[0] || 'Tài khoản'}</h3>
              <p className="text-xs text-gray-500 mt-0.5">Thành viên từ {userProfile?.createdAt ? new Date(userProfile.createdAt).getFullYear() : '2023'}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            <Link to="#" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span className="text-sm font-semibold">Tổng quan</span>
            </Link>
            <Link to="/manage-posts" className="flex items-center gap-3 px-4 py-2.5 bg-[#feb700] text-[#6b4b00] rounded-xl font-bold transition-transform shadow-sm">
              <span className="material-symbols-outlined text-[20px]">list_alt</span>
              <span className="text-sm">Quản lý tin đăng</span>
            </Link>
            <Link to="/saved-posts" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <span className="material-symbols-outlined text-[20px]">favorite</span>
              <span className="text-sm font-semibold">Tin đã lưu</span>
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
            <Link to="/settings" className="flex items-center gap-3 px-2 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <span className="material-symbols-outlined text-[20px]">settings</span>
              <span className="text-sm font-semibold">Cài đặt tài khoản</span>
            </Link>
            <button onClick={logout} className="flex items-center gap-3 px-2 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left w-full">
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="text-sm font-semibold">Đăng xuất</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[600px]">
          <h1 className="text-2xl font-bold mb-6">Quản lý tin đăng</h1>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6 overflow-x-auto hide-scrollbar">
            {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-4 py-3 font-semibold text-sm transition-all relative ${activeTab === tab.id ? 'text-[#a63b00]' : 'text-gray-500 hover:text-gray-800'}`}
              >
                {tab.id} {tab.count > 0 ? `(${tab.count})` : '(0)'}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#a63b00] rounded-t-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* Product List */}
          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="py-10 text-center text-gray-500">Đang tải danh sách tin đăng...</div>
            ) : displayedProducts.length === 0 ? (
              <div className="py-10 text-center text-gray-500 flex flex-col items-center">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inventory_2</span>
                <p>Bạn chưa có tin đăng nào ở mục này.</p>
                <Link to="/post" className="mt-4 text-[#f26522] font-semibold hover:underline">Đăng tin ngay</Link>
              </div>
            ) : (
              displayedProducts.map(product => {
                const stats = getMockStats(product.id);
                return (
                  <div key={product.id} className="flex p-4 border border-[#ffdbce] rounded-xl hover:shadow-md transition-shadow bg-white gap-4 group">
                    {/* Image */}
                    <div className="w-40 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative border border-gray-200">
                      {product.imageUrls?.[0] ? (
                        <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <span className="material-symbols-outlined text-4xl">image</span>
                        </div>
                      )}
                      {/* Tag Trạng thái */}
                      <div className={`absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                        activeTab === 'Đang hiển thị' ? 'bg-[#00a841]' :
                        activeTab === 'Chờ duyệt' ? 'bg-[#f59e0b]' :
                        activeTab === 'Bị từ chối' ? 'bg-[#ef4444]' :
                        'bg-gray-500'
                      }`}>
                        {activeTab}
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                           <h3 className="font-bold text-[#1c1b1b] text-base truncate pr-4">{product.name}</h3>
                           <button className="text-gray-400 hover:text-gray-700">
                             <span className="material-symbols-outlined">more_vert</span>
                           </button>
                        </div>
                        <p className="font-bold text-[#a63b00] text-[15px] mt-1">
                          {new Intl.NumberFormat('vi-VN').format(product.price)} đ
                        </p>
                        
                        <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-500 font-medium">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span> {formatDate(product.createdAt)}</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">visibility</span> {stats.views} lượt xem</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">favorite</span> {stats.likes} lượt thích</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-3">
                        <button 
                          onClick={async () => {
                            try {
                              await api.put(`/products/${product.id}/bump`);
                              alert("Đẩy tin thành công! Tin của bạn đã lên top.");
                              // Reload data
                              const res = await api.get(`/products?sellerId=${user.userId}&size=100`);
                              setProducts(res.data.content || []);
                            } catch (e) {
                              alert("Đẩy tin thất bại!");
                            }
                          }}
                          className="flex items-center gap-1 px-4 py-1.5 bg-[#a63b00] hover:bg-[#852f00] text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">rocket_launch</span> Đẩy tin
                        </button>
                      </div>

                      {activeTab === 'Đang hiển thị' && (
                        <div className="flex items-center justify-between mt-auto">
                          <Link to={`/post?editId=${product.id}`} className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                            Chỉnh sửa
                          </Link>
                          <button onClick={() => handleUpdateStatus(product.id, 'SOLD')} className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors ml-2">
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            Đã bán
                          </button>
                          <button onClick={() => handleUpdateStatus(product.id, 'HIDDEN')} className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors ml-2">
                            <span className="material-symbols-outlined text-[18px]">visibility_off</span>
                            Ẩn tin
                          </button>
                        </div>
                      )}
                      {(activeTab === 'Chờ duyệt' || activeTab === 'Bị từ chối') && (
                        <div className="flex items-center justify-between mt-auto">
                          <Link to={`/post?editId=${product.id}`} className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                            Sửa lại tin
                          </Link>
                          <button onClick={() => handleDelete(product.id)} className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors ml-2">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                            Xóa
                          </button>
                        </div>
                      )}
                      {activeTab === 'Đã ẩn' && (
                        <div className="flex items-center justify-between mt-auto">
                           <button onClick={() => handleUpdateStatus(product.id, 'AVAILABLE')} className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-green-600 hover:bg-green-50 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                            Hiện lại tin
                          </button>
                           <button onClick={() => handleDelete(product.id)} className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors ml-2">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                            Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {products.length > 0 && (
             <div className="mt-8 flex justify-center">
               <button className="px-6 py-2.5 bg-white border border-[#ffb599] text-[#a63b00] font-bold text-sm rounded-full hover:bg-[#fff0eb] transition-colors shadow-sm">
                 Xem thêm tin đăng
               </button>
             </div>
          )}
        </section>
      </main>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
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

export default ManagePosts;
