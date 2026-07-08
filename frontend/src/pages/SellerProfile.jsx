import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';

const SellerProfile = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Đang bán');
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoading(true);
        // Lấy thông tin user
        const userRes = await api.get(`/users/${id}`);
        setSeller(userRes.data);

        // Lấy danh sách sản phẩm của seller
        const productsRes = await api.get(`/products?sellerId=${id}&size=20`);
        setProducts(productsRes.data.content || []);
      } catch (error) {
        console.error("Lỗi lấy thông tin người bán:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchSellerData();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 24) return diffHours > 0 ? `${diffHours} giờ trước` : 'Vừa xong';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays <= 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return <div className="max-w-container-max mx-auto px-gutter md:px-lg py-xl text-center text-on-surface-variant">Đang tải thông tin người bán...</div>;
  }

  if (!seller) {
    return <div className="max-w-container-max mx-auto px-gutter md:px-lg py-xl text-center text-error font-bold">Người bán không tồn tại!</div>;
  }

  return (
    <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 animate-fade-in">
      {/* Seller Profile Header */}
      <section className="bg-[#fff3eb] rounded-2xl p-6 md:p-8 mb-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10 w-full md:w-auto">
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white overflow-hidden shadow-sm shrink-0 bg-surface-variant">
            {seller.avatarUrl ? (
              <img className="w-full h-full object-cover" alt="Avatar" src={seller.avatarUrl}/>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant text-4xl font-bold bg-gray-200 uppercase">
                 {seller.email ? seller.email.charAt(0) : 'U'}
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center space-y-3 h-full text-center md:text-left mt-2 md:mt-0">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
              <h1 className="text-2xl font-bold text-[#1c1b1b]">{seller.name || seller.email?.split('@')[0]}</h1>
              <div className="inline-flex items-center gap-1 bg-[#e5f1ff] text-[#007AFF] px-2.5 py-1 rounded-full border border-[#007AFF]/20">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                <span className="font-bold text-[11px] uppercase tracking-wide">Đã xác thực SĐT</span>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap text-gray-500 text-sm">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[#feb700] text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                <span className="font-bold text-[#1c1b1b]">4.5</span>
                <span>(15 đánh giá)</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-300 hidden md:block"></div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                <span>Tham gia từ tháng 3/2022</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-300 hidden md:block"></div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                <span>Phản hồi trong vài giờ</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
          <Link to={`/chat?sellerId=${seller.id}`} className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-[#f26522] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
            <span className="material-symbols-outlined text-[18px]">chat</span>
            Chat ngay
          </Link>
          <button className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 border border-[#f26522] text-[#f26522] bg-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#fff3eb] transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Theo dõi
          </button>
        </div>
      </section>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8 mt-2 sticky top-[64px] z-40 bg-[#fcf9f8]/95 backdrop-blur-md pt-2">
        <nav className="flex gap-8">
          {['Đang bán', 'Đã bán', 'Đánh giá'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 transition-colors text-[17px] ${activeTab === tab ? 'border-b-2 border-[#f26522] text-[#f26522] font-bold' : 'border-transparent text-gray-500 hover:text-gray-800 font-semibold'}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Products Grid (Active Tab Content) */}
      {activeTab === 'Đang bán' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">Người bán này chưa có tin đăng nào.</div>
          ) : (
            products.map(product => (
              <Link key={product.id} to={`/product/${product.id}`} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group flex flex-col h-full relative">
                <div className="aspect-square relative overflow-hidden bg-gray-50">
                  {product.imageUrls?.[0] ? (
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={product.name} src={product.imageUrls[0]}/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                       <span className="material-symbols-outlined text-4xl text-gray-300">image</span>
                    </div>
                  )}
                  {/* Random Tags for UI closeness to screenshot */}
                  {product.id % 3 === 0 && <div className="absolute top-2 left-2 bg-[#007AFF] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide shadow-sm">MỚI ĐĂNG</div>}
                  {product.id % 3 === 1 && <div className="absolute top-2 left-2 bg-[#FFB800] text-[#1A1A1A] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide shadow-sm">NỔI BẬT</div>}
                  {product.id % 3 === 2 && <div className="absolute top-2 left-2 bg-[#34C759] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide shadow-sm flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">local_shipping</span> FREESHIP</div>}
                </div>
                <div className="p-3 md:p-4 flex flex-col gap-1 flex-grow">
                  <h3 className="text-sm font-semibold text-[#1c1b1b] line-clamp-2 min-h-[40px] leading-snug">{product.name}</h3>
                  <p className="font-bold text-[#f26522] text-base mt-1">{new Intl.NumberFormat('vi-VN').format(product.price)} đ</p>
                  <div className="flex items-center justify-between mt-auto text-[11px] text-gray-500 pt-2 font-medium">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      <span className="truncate max-w-[80px]">{product.location || 'Toàn quốc'}</span>
                    </div>
                    <span>{formatDate(product.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {activeTab !== 'Đang bán' && (
        <div className="text-center py-20 text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
          Chưa có dữ liệu cho mục này.
        </div>
      )}

      {/* Load More Button */}
      {activeTab === 'Đang bán' && products.length > 0 && (
        <div className="mt-10 flex justify-center pb-8">
          <button className="bg-gray-200 text-gray-700 px-8 py-2.5 rounded-full text-sm font-bold hover:bg-gray-300 transition-colors shadow-sm">
            Xem thêm tin đăng
          </button>
        </div>
      )}
      
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
};

export default SellerProfile;
