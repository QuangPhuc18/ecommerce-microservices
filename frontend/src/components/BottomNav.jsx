import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-1 md:hidden bg-surface shadow-[0px_-4px_12px_rgba(0,0,0,0.05)] rounded-t-xl">
      {/* Trang chủ */}
      <Link to="/" className={`flex flex-col items-center justify-center ${isActive('/') ? 'text-primary font-bold bg-primary-container/10 rounded-xl p-1' : 'text-on-surface-variant hover:text-primary transition-all'} w-16`}>
        <span className={`material-symbols-outlined ${isActive('/') ? 'icon-fill' : ''}`}>home</span>
        <span className="font-label-sm text-label-sm mt-1">Trang chủ</span>
      </Link>
      
      {/* Thông báo */}
      <Link to="/notifications" className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-all w-16 relative">
        <span className="material-symbols-outlined">notifications</span>
        <span className="font-label-sm text-label-sm mt-1">Thông báo</span>
        <span className="absolute top-1 right-3 w-2 h-2 bg-error rounded-full"></span>
      </Link>
      
      {/* Đăng tin (FAB-like in bottom nav) */}
      <Link to="/post" className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-all w-16 -mt-4">
        <span className="material-symbols-outlined text-4xl text-primary-container">add_circle</span>
        <span className="font-label-sm text-label-sm mt-1 font-bold text-primary-container">Đăng tin</span>
      </Link>
      
      {/* Tin nhắn */}
      <Link to="/chat" className={`flex flex-col items-center justify-center ${isActive('/chat') ? 'text-primary font-bold bg-primary-container/10 rounded-xl p-1' : 'text-on-surface-variant hover:text-primary transition-all'} w-16`}>
        <span className={`material-symbols-outlined ${isActive('/chat') ? 'icon-fill' : ''}`}>chat</span>
        <span className="font-label-sm text-label-sm mt-1">Tin nhắn</span>
      </Link>
      
      {/* Cá nhân */}
      <Link to="/profile" className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-all w-16">
        <span className="material-symbols-outlined">person</span>
        <span className="font-label-sm text-label-sm mt-1">Cá nhân</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
