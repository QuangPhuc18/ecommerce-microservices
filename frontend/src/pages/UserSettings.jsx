import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

const UserSettings = () => {
  const { user, loading: authLoading, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    avatarUrl: ''
  });
  const [joinedYear, setJoinedYear] = useState('2023');
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Kiểm tra đăng nhập
  useEffect(() => {
    if (!authLoading && (!user || !user.isLoggedIn)) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Load user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!user?.userId) return;
      try {
        const res = await api.get(`/users/${user.userId}`);
        setFormData({
          name: res.data.name || '',
          phone: res.data.phone || '',
          password: '', // Keep password empty initially
          avatarUrl: res.data.avatarUrl || ''
        });
        if (res.data.createdAt) {
           setJoinedYear(new Date(res.data.createdAt).getFullYear());
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('files', file);
      const res = await api.post('/media/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.urls && res.data.urls.length > 0) {
         const fullUrl = `http://localhost:8088${res.data.urls[0]}`;
         setFormData({ ...formData, avatarUrl: fullUrl });
         
         // Auto save avatar
         try {
           const userRes = await api.get(`/users/${user.userId}`);
           const updatedUser = {
             ...userRes.data,
             avatarUrl: fullUrl
           };
           await api.put(`/users/${user.userId}`, updatedUser);
           setMessage('Cập nhật ảnh đại diện thành công!');
         } catch (saveErr) {
           console.error(saveErr);
         }
      }
    } catch (err) {
      alert("Lỗi tải ảnh!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const userRes = await api.get(`/users/${user.userId}`);
      const updatedUser = {
        ...userRes.data,
        name: formData.name,
        phone: formData.phone,
        avatarUrl: formData.avatarUrl
      };
      if (formData.password) {
        updatedUser.password = formData.password;
      }
      
      await api.put(`/users/${user.userId}`, updatedUser);
      setMessage('Cập nhật thông tin thành công!');
    } catch (err) {
      console.error(err);
      setMessage('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user?.isLoggedIn) return null;

  return (
    <div className="bg-[#fcf9f8] min-h-screen font-sans text-[#1c1b1b] animate-fade-in">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-6 h-16 bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-2xl font-bold text-[#f26522]">ĐồCũ</Link>
          <nav className="hidden md:flex gap-6 items-center">
            <Link to="/" className="text-gray-600 hover:text-[#f26522] font-semibold text-sm transition-colors">Khám phá</Link>
            <Link to="/search" className="text-gray-600 hover:text-[#f26522] font-semibold text-sm transition-colors">Danh mục</Link>
            <Link to="/manage-posts" className="text-gray-600 hover:text-[#f26522] font-semibold text-sm transition-colors">Tin đăng</Link>
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
               {formData.avatarUrl ? (
                 <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <span className="material-symbols-outlined text-gray-400">person</span>
               )}
            </div>
            <div>
              <h3 className="font-bold text-[#1c1b1b] text-base leading-tight truncate w-36">{formData.name || user.email?.split('@')[0]}</h3>
              <p className="text-xs text-gray-500 mt-0.5">Thành viên từ {joinedYear}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            <Link to="/manage-posts" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <span className="material-symbols-outlined text-[20px]">list_alt</span>
              <span className="text-sm font-semibold">Quản lý tin đăng</span>
            </Link>
            <Link to="/saved-posts" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <span className="material-symbols-outlined text-[20px]">favorite</span>
              <span className="text-sm font-semibold">Tin đã lưu</span>
            </Link>
          </nav>

          <div className="mt-auto pt-6 flex flex-col gap-1 border-t border-gray-200 mt-6 mx-4">
            <Link to="/settings" className="flex items-center gap-3 px-2 py-2 bg-[#feb700] text-[#6b4b00] rounded-xl font-bold transition-transform shadow-sm">
              <span className="material-symbols-outlined text-[20px]">settings</span>
              <span className="text-sm">Cài đặt tài khoản</span>
            </Link>
            <button onClick={logout} className="flex items-center gap-3 px-2 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left w-full">
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="text-sm font-semibold">Đăng xuất</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[600px]">
          <h1 className="text-2xl font-bold mb-6">Cài đặt tài khoản</h1>
          
          <div className="max-w-md">
            {message && (
              <div className={`p-4 rounded-xl mb-6 ${message.includes('thành công') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-50 relative group flex-shrink-0">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                       <span className="material-symbols-outlined text-gray-400 text-3xl">person</span>
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    {isUploading ? (
                       <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                       <span className="material-symbols-outlined text-white text-[20px]">photo_camera</span>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploading} />
                  </label>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">Ảnh đại diện</h3>
                  <p className="text-xs text-gray-500 mb-2">Định dạng JPEG, PNG. Dung lượng tối đa 5MB.</p>
                  <label className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-gray-200 font-semibold text-gray-700 inline-block">
                    {isUploading ? 'Đang tải...' : 'Tải ảnh lên'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploading} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email (Không thể thay đổi)</label>
                <input type="text" disabled value={user.email || ''} className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tên hiển thị</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-[#f26522] focus:ring-1 focus:ring-[#f26522] outline-none transition-shadow" placeholder="Nhập tên hiển thị" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Số điện thoại</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-[#f26522] focus:ring-1 focus:ring-[#f26522] outline-none transition-shadow" placeholder="Nhập số điện thoại" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Đổi mật khẩu mới (Để trống nếu không đổi)</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-[#f26522] focus:ring-1 focus:ring-[#f26522] outline-none transition-shadow" placeholder="Mật khẩu mới..." />
              </div>

              <div className="pt-4">
                <button disabled={loading} type="submit" className="w-full bg-[#f26522] text-white font-bold py-3 rounded-xl hover:bg-[#d65a1e] transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center gap-2">
                  {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-[18px]">save</span>}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default UserSettings;
