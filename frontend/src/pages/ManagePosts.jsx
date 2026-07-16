import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import VipPackages from '../components/VipPackages';

const ManagePosts = () => {
  const { user, loading: authLoading, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Đang hiển thị');
  const [activeSidebarMenu, setActiveSidebarMenu] = useState('manage-posts');
  
  // Notification States
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = React.useRef(null);

  // Followers State
  const [followers, setFollowers] = useState([]);
  const [followersLoading, setFollowersLoading] = useState(false);

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
         
      // Fetch followers
      setFollowersLoading(true);
      api.get(`/follows/followers/${user.userId}`)
         .then(res => {
           setFollowers(res.data);
         })
         .catch(err => console.error(err))
         .finally(() => setFollowersLoading(false));
    }
  }, [user]);

  // Notifications logic
  useEffect(() => {
    let intervalId;
    if (user?.userId) {
      const fetchNotifications = () => {
        api.get(`/notifications/user/${user.userId}/unread-count`)
          .then(res => setUnreadCount(res.data))
          .catch(err => console.error(err));
          
        api.get(`/notifications/user/${user.userId}`)
          .then(res => setNotifications(res.data))
          .catch(err => console.error(err));
      };
      
      fetchNotifications();
      intervalId = setInterval(fetchNotifications, 5000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await api.put(`/notifications/${notification.id}/read`);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true, isRead: true } : n));
      } catch (err) {
        console.error(err);
      }
    }
    if (notification.type === 'CHAT') {
      navigate('/chat');
      setShowNotifications(false);
    }
  };

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
    <div className="min-h-screen bg-[#f8f9fa]">
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
            <button 
              onClick={() => setActiveSidebarMenu('manage-posts')} 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-transform text-left ${activeSidebarMenu === 'manage-posts' ? 'bg-[#feb700] text-[#6b4b00] font-bold shadow-sm' : 'text-gray-600 hover:bg-gray-100 font-semibold'}`}
            >
              <span className="material-symbols-outlined text-[20px]">list_alt</span>
              <span className="text-sm">Quản lý tin đăng</span>
            </button>
            <button 
              onClick={() => setActiveSidebarMenu('followers')} 
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-transform text-left ${activeSidebarMenu === 'followers' ? 'bg-[#feb700] text-[#6b4b00] font-bold shadow-sm' : 'text-gray-600 hover:bg-gray-100 font-semibold'}`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">group</span>
                <span className="text-sm">Người theo dõi</span>
              </div>
              <span className="bg-gray-200 text-gray-700 text-xs py-0.5 px-2 rounded-full">{followers.length}</span>
            </button>
            <Link to="/saved-posts" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <span className="material-symbols-outlined text-[20px]">favorite</span>
              <span className="text-sm font-semibold">Tin đã lưu</span>
            </Link>
            <Link to="/chat" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <span className="material-symbols-outlined text-[20px]">chat</span>
              <span className="text-sm font-semibold">Tin nhắn</span>
            </Link>
            <button 
              onClick={() => setActiveSidebarMenu('wallet')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-transform text-left ${activeSidebarMenu === 'wallet' ? 'bg-[#feb700] text-[#6b4b00] font-bold shadow-sm' : 'text-gray-600 hover:bg-gray-100 font-semibold'}`}
            >
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              <span className="text-sm">Ví điện tử</span>
            </button>
          </nav>

          <div className="mt-4 px-4">
             <button 
               onClick={() => setActiveSidebarMenu('vip')}
               className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-colors ${activeSidebarMenu === 'vip' ? 'bg-[#5e4200] text-[#feb700]' : 'bg-[#6b4b00] text-[#feb700] hover:bg-[#5e4200]'}`}
             >
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
        {activeSidebarMenu === 'manage-posts' ? (
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
                  <div key={product.id} className={`flex p-4 border ${product.vip ? 'border-[#feb700] bg-[#fffcf5]' : 'border-[#ffdbce] bg-white'} rounded-xl hover:shadow-md transition-shadow gap-4 group relative`}>
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
                           <h3 className="font-bold text-[#1c1b1b] text-base truncate pr-4 flex items-center gap-2">
                             {product.name}
                             {product.vip && <span className="bg-[#feb700] text-white text-[10px] px-1.5 py-0.5 rounded uppercase leading-none">VIP</span>}
                           </h3>
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
                        {!product.vip && (
                          <button 
                            onClick={async () => {
                              if (window.confirm(`Bạn có muốn dùng 50 Xu để nâng cấp bài đăng "${product.name}" thành tin VIP trong 7 ngày không?`)) {
                                try {
                                  await api.put(`/products/${product.id}/upgrade-vip`);
                                  alert("Nâng cấp VIP thành công!");
                                  const res = await api.get(`/products?sellerId=${user.userId}&size=100`);
                                  setProducts(res.data.content || []);
                                  // Refresh profile to update balance
                                  const profileRes = await api.get(`/users/${user.userId}`);
                                  setUserProfile(profileRes.data);
                                } catch (e) {
                                  alert(e.response?.data || "Nâng cấp VIP thất bại! Hãy kiểm tra số dư ví.");
                                }
                              }
                            }}
                            className="flex items-center gap-1 px-4 py-1.5 bg-[#feb700] hover:bg-[#e0a200] text-[#6b4b00] text-xs font-bold rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">workspace_premium</span> Lên VIP
                          </button>
                        )}
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
        ) : activeSidebarMenu === 'followers' ? (
          <section className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[600px]">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <h1 className="text-2xl font-bold text-[#1c1b1b]">Người theo dõi bạn</h1>
              <div className="bg-[#fff4e5] text-[#a63b00] px-4 py-2 rounded-full font-bold text-sm">
                Tổng cộng: {followers.length} người
              </div>
            </div>
            
            {followersLoading ? (
              <div className="py-10 text-center text-gray-500">Đang tải danh sách...</div>
            ) : followers.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">group_off</span>
                <p className="text-gray-500 text-lg font-medium">Chưa có ai theo dõi bạn</p>
                <p className="text-gray-400 text-sm mt-2">Hãy đăng nhiều sản phẩm chất lượng để thu hút người theo dõi nhé!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {followers.map(follower => (
                  <div key={follower.followerId} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:shadow-md hover:border-[#feb700] transition-all bg-white cursor-pointer" onClick={() => navigate(`/seller/${follower.followerId}`)}>
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                      {follower.avatarUrl ? (
                        <img src={follower.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="material-symbols-outlined text-2xl">person</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#1c1b1b] text-base truncate">{follower.name || follower.email?.split('@')[0] || 'Tài khoản ẩn danh'}</h4>
                      <p className="text-sm text-gray-500 truncate mt-0.5">{follower.email}</p>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-gray-50 hover:bg-[#fff4e5] text-gray-400 hover:text-[#a63b00] flex items-center justify-center transition-colors">
                      <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : activeSidebarMenu === 'vip' ? (
          <section className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[600px]">
            <h1 className="text-2xl font-bold mb-6">Nâng cấp gói VIP</h1>
            <VipPackages />
          </section>
        ) : activeSidebarMenu === 'wallet' ? (
          <section className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[600px]">
            <h1 className="text-2xl font-bold mb-6 text-[#1c1b1b]">Ví điện tử của tôi</h1>
            <div className="bg-gradient-to-r from-[#feb700] to-[#f26522] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden mb-8">
               <div className="absolute top-0 right-0 p-4 opacity-20">
                 <span className="material-symbols-outlined text-8xl">account_balance_wallet</span>
               </div>
               <div className="relative z-10">
                 <p className="text-white/90 text-sm font-medium mb-1">Số dư hiện tại</p>
                 <div className="flex items-baseline gap-2">
                   <h2 className="text-4xl font-bold">{userProfile?.balance ? new Intl.NumberFormat('vi-VN').format(userProfile.balance) : '0'}</h2>
                   <span className="text-xl font-medium">Xu</span>
                 </div>
                 <div className="mt-6 flex gap-3">
                   <button 
                     onClick={async () => {
                       const amount = prompt("Nhập số tiền bạn muốn nạp (VND):", "50000");
                       if (amount && !isNaN(amount) && Number(amount) >= 10000) {
                         try {
                           const res = await api.post(`/payment/create-url?amount=${amount}`);
                           if (res.data && res.data.paymentUrl) {
                             window.location.href = res.data.paymentUrl;
                           }
                         } catch (error) {
                           alert("Có lỗi xảy ra khi tạo giao dịch Nạp tiền.");
                         }
                       } else if (amount) {
                         alert("Vui lòng nhập số tiền hợp lệ (tối thiểu 10,000 VND).");
                       }
                     }}
                     className="bg-white text-[#a63b00] px-6 py-2.5 rounded-full font-bold text-sm shadow-md hover:bg-gray-50 transition-colors flex items-center gap-2"
                   >
                     <span className="material-symbols-outlined text-[18px]">add_circle</span> Nạp tiền
                   </button>
                   <button className="bg-black/20 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-black/30 transition-colors">
                     Lịch sử giao dịch
                   </button>
                 </div>
               </div>
            </div>
            
            <h2 className="text-lg font-bold mb-4 text-[#1c1b1b]">Hướng dẫn sử dụng Ví</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <span className="material-symbols-outlined text-[#f26522] mb-2 text-3xl">payments</span>
                  <h3 className="font-bold text-gray-800 mb-1">Nạp tiền an toàn</h3>
                  <p className="text-sm text-gray-600">Thanh toán qua cổng VNPay nhanh chóng và bảo mật 100%.</p>
               </div>
               <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <span className="material-symbols-outlined text-[#00a841] mb-2 text-3xl">rocket_launch</span>
                  <h3 className="font-bold text-gray-800 mb-1">Đẩy tin siêu tốc</h3>
                  <p className="text-sm text-gray-600">Sử dụng Xu để đẩy tin đăng của bạn lên top, tiếp cận nhiều khách hàng hơn.</p>
               </div>
               <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <span className="material-symbols-outlined text-[#feb700] mb-2 text-3xl">workspace_premium</span>
                  <h3 className="font-bold text-gray-800 mb-1">Mua gói VIP</h3>
                  <p className="text-sm text-gray-600">Nâng cấp tài khoản hoặc tin đăng lên gói VIP để bán hàng dễ dàng hơn.</p>
               </div>
            </div>
          </section>
        ) : (
          <section className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center min-h-[600px] text-gray-500">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-50">construction</span>
            <p className="text-lg">Tính năng đang được phát triển</p>
          </section>
        )}
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
