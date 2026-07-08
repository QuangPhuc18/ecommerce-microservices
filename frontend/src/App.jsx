import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PostProduct from './pages/PostProduct';
import ProductDetail from './pages/ProductDetail';
import SellerProfile from './pages/SellerProfile';
import Chat from './pages/Chat';
import ManagePosts from './pages/ManagePosts';
import SavedPosts from './pages/SavedPosts';
import Search from './pages/Search';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import AdminLayout from './components/AdminLayout';
import AdminUsers from './pages/AdminUsers';
import AdminCategories from './pages/AdminCategories';
import AdminProducts from './pages/AdminProducts';
import UserSettings from './pages/UserSettings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Layouts with custom/full-screen UI */}
          <Route path="/chat" element={<Chat />} />
          <Route path="/manage-posts" element={<ManagePosts />} />
          <Route path="/saved-posts" element={<SavedPosts />} />
          <Route path="/search" element={<Search />} />
          <Route path="/settings" element={<UserSettings />} />

          {/* Main Layout */}
          <Route path="/*" element={
            <div className="bg-background text-on-background font-body-md pb-24 min-h-screen flex flex-col">
              <Navbar />
              <main className="pt-16 pb-lg flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/post" element={<PostProduct />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/seller/:id" element={<SellerProfile />} />
                </Routes>
              </main>
              <Footer />
              <BottomNav />
            </div>
          } />

          {/* Admin Routes with specialized AdminLayout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<div style={{ textAlign: 'center', padding: '3rem' }}><h2>Chào mừng đến trang Quản trị!</h2></div>} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="products" element={<AdminProducts />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
