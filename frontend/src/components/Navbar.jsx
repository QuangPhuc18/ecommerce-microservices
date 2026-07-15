import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { MAIN_CATEGORIES, SUB_CATEGORIES } from '../data/categories';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [activeMenuCategory, setActiveMenuCategory] = useState(null);
  const [siteSettings, setSiteSettings] = useState({});
  const notificationRef = React.useRef(null);
  const megaMenuRef = React.useRef(null);
  const location = useLocation();

  React.useEffect(() => {
    let intervalId;
    if (user?.userId) {
      import('../services/api').then(module => {
        const api = module.default;
        
        api.get(`/users/${user.userId}`)
          .then(res => setUserProfile(res.data))
          .catch(err => console.error(err));
          
        const fetchNotifications = () => {
          api.get(`/notifications/user/${user.userId}/unread-count`)
            .then(res => setUnreadCount(res.data))
            .catch(err => console.error(err));
            
          api.get(`/notifications/user/${user.userId}`)
            .then(res => setNotifications(res.data))
            .catch(err => console.error(err));
        };
        
        fetchNotifications();
        // Cập nhật ngầm mỗi 5 giây
        intervalId = setInterval(fetchNotifications, 5000);
      });
    }

    // Fetch site settings
    import('../services/api').then(module => {
      const api = module.default;
      api.get('/products/settings')
        .then(res => setSiteSettings(res.data))
        .catch(err => console.error(err));
    });

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target)) {
        setShowMegaMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    setShowMegaMenu(false);
  }, [location.pathname, location.search]);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) { // Entity is isRead, but JSON is read or isRead depending on Jackson. Let's check both
      try {
        const api = (await import('../services/api')).default;
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
    } else {
      navigate(`/search`);
    }
  };

  return (
    <>
      {/* TopNavBar (Desktop) */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 h-16 shadow-sm bg-surface hidden md:flex justify-center">
        <div className="w-full max-w-container-max px-4 md:px-gutter flex justify-between items-center h-full">
          <div className="flex items-center gap-6">
            {/* Mega Menu Toggle & Brand Logo */}
            <div className="flex items-center gap-3 relative" ref={megaMenuRef}>
              <button 
                onClick={() => {
                  setShowMegaMenu(!showMegaMenu);
                  setActiveMenuCategory(MAIN_CATEGORIES[0].name);
                }}
                className="p-2 hover:bg-surface-container-low rounded-full transition-colors flex items-center justify-center text-on-surface"
              >
                <span className="material-symbols-outlined">{showMegaMenu ? 'close' : 'menu'}</span>
              </button>
              
              <Link className="flex-shrink-0" to="/">
                <img 
                  alt="ĐồCũ Logo" 
                  className="h-10 object-contain" 
                  src={siteSettings.logo_url || "https://lh3.googleusercontent.com/aida/AP1WRLt1b6uRk0WeBQP_Vq4eC801Bxw7riM83V7hgySe2KY4ZPcNCBc_I7CYH866KRFfrUpT6ZkHNm1qm7Q2KReEjcyMBK8MfeRN6SBrmX9xZv_0d1rzMwxd79c7y8BCjpmYmZefC0UTUYUNeNPGqLy9TTYR-WDs5GLAmF_ItBY6v86-Kk4C63MA5QwmBPIGxrGUJAPAkBuWJRjcVBAIPGrLMwv6xK3gVEcQVvCXqZIbBlkOP9I_glISv1g_PTk"}
                />
              </Link>

              {/* Mega Menu Dropdown */}
              {showMegaMenu && (
                <div className="absolute top-[120%] left-0 w-[600px] bg-white rounded-xl shadow-2xl border border-outline-variant/30 flex overflow-hidden z-[9999] animate-fade-in min-h-[400px]">
                  {/* Cột Danh mục chính */}
                  <div className="w-1/3 bg-surface-container-lowest border-r border-outline-variant/30 py-2">
                    {MAIN_CATEGORIES.map(cat => (
                      <div 
                        key={cat.id}
                        onMouseEnter={() => setActiveMenuCategory(cat.name)}
                        className={`px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors ${activeMenuCategory === cat.name ? 'bg-primary/10 text-primary font-bold border-l-4 border-primary' : 'hover:bg-surface-container-low text-on-surface border-l-4 border-transparent'}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                        <span className="text-sm">{cat.name}</span>
                      </div>
                    ))}
                  </div>
                  {/* Cột Danh mục con */}
                  <div className="w-2/3 bg-white p-4">
                    {activeMenuCategory && (
                      <div>
                        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3 mb-3">
                          <h3 className="font-bold text-on-surface">{activeMenuCategory}</h3>
                          <Link 
                            to={`/search?category=${encodeURIComponent(activeMenuCategory)}`}
                            className="text-xs text-primary hover:underline font-bold"
                          >
                            Xem tất cả
                          </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                          {SUB_CATEGORIES[activeMenuCategory]?.map(sub => (
                            <Link
                              key={sub}
                              to={`/search?category=${encodeURIComponent(activeMenuCategory)}&subCategory=${encodeURIComponent(sub)}`}
                              className="text-sm text-on-surface-variant hover:text-primary transition-colors hover:underline"
                            >
                              {sub}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex items-center bg-surface-container-low rounded-xl px-4 py-2 border border-outline-variant focus-within:border-primary-container focus-within:ring-1 focus-within:ring-primary-container transition-all">
              <div className="flex items-center gap-2 border-r border-outline-variant pr-3 mr-3 text-on-surface-variant cursor-pointer">
                <span className="material-symbols-outlined text-sm">location_on</span>
                <span className="font-body-md text-body-md whitespace-nowrap">Toàn quốc</span>
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </div>
              <input 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-on-surface w-[300px] font-body-md text-body-md outline-none" 
                placeholder="Tìm kiếm sản phẩm..." 
                type="text"
              />
              <button type="submit" className="text-primary-container hover:text-primary transition-colors ml-2">
                <span className="material-symbols-outlined">search</span>
              </button>
            </form>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Trailing Icon Actions - Always Visible */}
            <div className="flex gap-2">
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNotifications(prev => !prev);
                  }}
                  aria-label="notifications" 
                  className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors relative"
                >
                  <span className="material-symbols-outlined">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-[9999]">
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                      <h3 className="font-bold text-gray-800 text-sm">Thông báo</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs text-[#f26522] font-semibold">{unreadCount} chưa đọc</span>
                      )}
                    </div>
                    <div className="max-h-[350px] overflow-y-auto bg-white">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-gray-500">Không có thông báo nào</div>
                      ) : (
                        notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-4 border-b border-gray-50 last:border-0 cursor-pointer transition-colors ${!(notif.read || notif.isRead) ? 'bg-orange-50 hover:bg-orange-100' : 'hover:bg-gray-50'}`}
                          >
                            <p className={`text-sm ${!(notif.read || notif.isRead) ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{notif.message}</p>
                            <span className="text-xs text-gray-400 mt-1 block">
                              {new Date(notif.createdAt).toLocaleString('vi-VN')}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Link to="/chat" aria-label="chat" className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
                <span className="material-symbols-outlined">chat</span>
              </Link>
            </div>
            
            {/* Profile or Login */}
            {user?.isLoggedIn ? (
              <Link to="/manage-posts" className="flex items-center gap-2 p-1 hover:bg-surface-container-low rounded-full transition-colors" title="Quản lý cá nhân">
                {userProfile?.avatarUrl ? (
                  <img className="w-8 h-8 rounded-full border border-outline-variant object-cover" alt="Avatar" src={userProfile.avatarUrl} />
                ) : (
                  <div className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center bg-gray-100">
                    <span className="material-symbols-outlined text-gray-400">person</span>
                  </div>
                )}
              </Link>
            ) : (
              <Link to="/login" className="font-body-md font-semibold text-primary hover:underline px-2">Đăng nhập</Link>
            )}

            {/* Trailing Primary Action */}
            <Link to="/post" className="bg-primary-container text-on-primary font-headline-md text-headline-md px-4 py-2 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap">
              Đăng tin
            </Link>
          </div>
        </div>
      </header>

      {/* TopNavBar (Mobile Optimized) */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-16 shadow-sm bg-surface md:hidden">
        <div className="flex items-center gap-sm">
          <Link to="/">
            <img alt="ĐồCũ Logo" className="h-8 object-contain" src="https://lh3.googleusercontent.com/aida/AP1WRLt1b6uRk0WeBQP_Vq4eC801Bxw7riM83V7hgySe2KY4ZPcNCBc_I7CYH866KRFfrUpT6ZkHNm1qm7Q2KReEjcyMBK8MfeRN6SBrmX9xZv_0d1rzMwxd79c7y8BCjpmYmZefC0UTUYUNeNPGqLy9TTYR-WDs5GLAmF_ItBY6v86-Kk4C63MA5QwmBPIGxrGUJAPAkBuWJRjcVBAIPGrLMwv6xK3gVEcQVvCXqZIbBlkOP9I_glISv1g_PTk"/>
          </Link>
        </div>
        <div className="flex-1 px-md">
          <form onSubmit={handleSearch} className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-surface-container-low border border-surface-variant text-on-surface font-body-md rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
              placeholder="Tìm kiếm trên ĐồCũ..." 
              type="text"
            />
          </form>
        </div>
        <div className="flex items-center gap-sm text-primary">
          <button className="p-2 hover:bg-surface-container-low rounded-full transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
          </button>
          {user?.isLoggedIn ? (
            <Link to="/manage-posts" className="p-2 hover:bg-surface-container-low rounded-full transition-colors" title="Quản lý cá nhân">
              {userProfile?.avatarUrl ? (
                <img className="w-8 h-8 rounded-full object-cover" alt="Avatar" src={userProfile.avatarUrl} />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100">
                  <span className="material-symbols-outlined text-gray-400">person</span>
                </div>
              )}
            </Link>
          ) : (
            <Link to="/login" className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
              <span className="material-symbols-outlined">login</span>
            </Link>
          )}
        </div>
      </header>
    </>
  );
};

export default Navbar;
