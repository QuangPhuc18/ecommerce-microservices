import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [reviewers, setReviewers] = useState({});
  const [averageRating, setAverageRating] = useState(0);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewImages, setReviewImages] = useState([]);
  const [isUploadingReviewImages, setIsUploadingReviewImages] = useState(false);
  
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyInput, setReplyInput] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  useEffect(() => {
    const fetchProductAndSeller = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
        
        // Fetch seller details if sellerId exists and is valid
        if (res.data.sellerId && res.data.sellerId !== 0) {
           try {
             const sellerRes = await api.get(`/users/${res.data.sellerId}`);
             setSeller(sellerRes.data);

             try {
                const ratingRes = await api.get(`/reviews/user/${res.data.sellerId}/rating`);
                setAverageRating(ratingRes.data.averageRating || 0);
             } catch(e) {}
             
             try {
                const revRes = await api.get(`/reviews/user/${res.data.sellerId}`);
                setReviews(revRes.data || []);
                const usersRes = await api.get(`/users`);
                const userMap = {};
                usersRes.data.forEach(u => userMap[u.id] = u.name || u.email?.split('@')[0]);
                setReviewers(userMap);
             } catch(e) {}
           } catch (err) {
             console.error("Lỗi lấy thông tin người bán", err);
           }
        }

        // Fetch favorite status
        if (user?.isLoggedIn) {
          try {
             const favRes = await api.get('/favorites');
             if (favRes.data?.some(p => p.id === parseInt(id))) {
               setIsFavorite(true);
             }
          } catch(e) {}
        }
        
        // Fetch related products
        if (res.data.category) {
          try {
            const relRes = await api.get(`/products?category=${encodeURIComponent(res.data.category)}&size=6`);
            const filtered = (relRes.data.content || []).filter(p => p.id !== parseInt(id)).slice(0, 5);
            setRelatedProducts(filtered);
          } catch(e) {}
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndSeller();
  }, [id, user]);

  const handleToggleFavorite = async () => {
    if (!user?.isLoggedIn) {
      alert("Vui lòng đăng nhập để lưu tin!");
      navigate('/login');
      return;
    }
    try {
      await api.post(`/favorites/${id}`);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChat = async () => {
    if (!user?.isLoggedIn) {
      alert("Bạn cần đăng nhập để nhắn tin với người bán!");
      navigate('/login');
      return;
    }
    
    const targetSellerId = product.sellerId || 2; // Fallback to 2 for mock data
    if (Number(user.userId) === Number(targetSellerId)) {
      alert("Bạn không thể nhắn tin mua hàng với chính sản phẩm của mình!");
      return;
    }
    
    try {
      const res = await api.post('/chat/rooms', {
        sellerId: targetSellerId,
        productId: product.id
      });
      navigate('/chat');
    } catch (err) {
      console.error(err);
      alert("Lỗi tạo phòng chat! Chi tiết: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user?.isLoggedIn) {
      alert("Vui lòng đăng nhập để đánh giá!");
      return;
    }
    if (!ratingInput || !commentInput.trim()) {
      alert("Vui lòng nhập đầy đủ sao và nhận xét!");
      return;
    }
    setIsSubmittingReview(true);
    try {
      await api.post('/reviews', {
        reviewerId: user.userId,
        reviewedUserId: product.sellerId,
        orderId: null,
        rating: ratingInput,
        comment: commentInput,
        imageUrls: reviewImages
      });
      
      alert("Cảm ơn bạn đã đánh giá!");
      setCommentInput('');
      setRatingInput(5);
      setReviewImages([]);
      
      const revRes = await api.get(`/reviews/user/${product.sellerId}`);
      setReviews(revRes.data || []);
      const ratingRes = await api.get(`/reviews/user/${product.sellerId}/rating`);
      setAverageRating(ratingRes.data.averageRating || 0);
    } catch (err) {
      console.error(err);
      alert("Có lỗi khi đăng đánh giá.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleSubmitReply = async (reviewId) => {
    if (!replyInput.trim()) return;
    setIsSubmittingReply(true);
    try {
      await api.post(`/reviews/${reviewId}/reply`, { reply: replyInput });
      alert("Đã gửi phản hồi!");
      setReplyingTo(null);
      setReplyInput('');
      const revRes = await api.get(`/reviews/user/${product.sellerId}`);
      setReviews(revRes.data || []);
    } catch (err) {
      console.error(err);
      alert("Có lỗi khi gửi phản hồi.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleReviewImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setIsUploadingReviewImages(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data && res.data.urls) {
        // Backend trả về đường dẫn tương đối (vd: /media/images/xxx.jpg)
        // Nên ta nối thêm url máy chủ để trình duyệt tải được ảnh
        const newImageUrls = res.data.urls.map(url => "http://localhost:8088" + url);
        setReviewImages(prev => [...prev, ...newImageUrls]);
      }
    } catch (err) {
      console.error("Lỗi upload ảnh:", err);
      alert("Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setIsUploadingReviewImages(false);
    }
  };

  const removeReviewImage = (index) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) return (
    <div className="pt-24 pb-32 flex justify-center items-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-surface-variant border-t-primary rounded-full animate-spin"></div>
    </div>
  );
  
  if (!product) return (
    <div className="pt-24 pb-32 text-center text-on-surface-variant">
      Sản phẩm không tồn tại
    </div>
  );

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 24) {
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins > 0 ? `ĐĂNG ${diffMins} PHÚT TRƯỚC` : 'VỪA ĐĂNG';
      }
      return `ĐĂNG ${diffHours} GIỜ TRƯỚC`;
    }
    if (diffDays === 1) return 'ĐĂNG HÔM QUA';
    if (diffDays <= 30) return `ĐĂNG ${diffDays} NGÀY TRƯỚC`;
    return `ĐĂNG NGÀY ${date.toLocaleDateString('vi-VN')}`;
  };

  const images = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls 
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'];

  return (
    <main className="pt-24 pb-32 max-w-container-max mx-auto px-4 md:px-gutter">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Cột trái: Ảnh và Mô tả */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Box Ảnh */}
          <div className="bg-surface rounded-xl overflow-hidden shadow-sm p-4 border border-outline-variant/30">
            <div className="relative w-full aspect-[4/3] md:aspect-[16/10] bg-surface-container-low rounded-lg overflow-hidden mb-3">
              <img 
                src={images[activeImageIndex]} 
                alt={product.name} 
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-[#007AFF] text-white font-label-sm text-xs font-bold px-2 py-1 rounded uppercase shadow-sm">
                {formatTimeAgo(product.bumpedAt || product.createdAt)}
              </div>
            </div>
            
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${activeImageIndex === idx ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Box Mô tả chi tiết */}
          <div className="bg-surface rounded-xl shadow-sm p-6 border border-outline-variant/30">
            <h2 className="font-headline-md font-bold text-on-surface mb-4">Mô tả chi tiết</h2>
            <div className="font-body-md text-on-surface-variant leading-relaxed whitespace-pre-line mb-6">
              {product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
            </div>

            {product.attributes && (
              <>
                <h3 className="font-headline-sm font-bold text-on-surface mb-3 border-t border-outline-variant/30 pt-4">Thông số kỹ thuật</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                  {Object.entries(JSON.parse(product.attributes)).map(([key, value]) => (
                    value ? (
                      <div key={key} className="flex justify-between border-b border-outline-variant/30 pb-2">
                        <span className="text-on-surface-variant">{key}:</span>
                        <span className="font-semibold text-on-surface text-right break-words max-w-[50%]">{value}</span>
                      </div>
                    ) : null
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Đánh giá người bán */}
          <div className="bg-surface rounded-xl shadow-sm p-6 border border-outline-variant/30">
            <h2 className="font-headline-md font-bold text-on-surface mb-6 border-b border-outline-variant/30 pb-3">
              Đánh giá người bán ({reviews.length})
            </h2>

            {/* Danh sách review */}
            <div className="space-y-6 mb-8">
              {reviews.length === 0 ? (
                <p className="text-on-surface-variant text-sm italic">Chưa có đánh giá nào cho người bán này.</p>
              ) : (
                reviews.map(rev => (
                  <div key={rev.id} className="border-b border-outline-variant/20 pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-on-surface-variant text-xs uppercase">
                        {(reviewers[rev.reviewerId] || 'U')[0]}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-on-surface">{reviewers[rev.reviewerId] || `Người dùng #${rev.reviewerId}`}</div>
                        <div className="flex text-[#FFB800] text-[10px]">
                          {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                        </div>
                      </div>
                      <span className="ml-auto text-xs text-on-surface-variant">
                        {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="text-sm text-on-surface mt-2">{rev.comment}</div>
                    
                    {/* Render images if any */}
                    {rev.imageUrls && rev.imageUrls.length > 0 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
                        {rev.imageUrls.map((url, idx) => (
                          <img 
                            key={idx} 
                            src={url} 
                            alt={`Review ${idx}`} 
                            className="w-20 h-20 object-cover rounded-lg border border-outline-variant/30 shadow-sm cursor-pointer hover:opacity-80 transition-opacity" 
                            onClick={() => window.open(url, '_blank')}
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Hiển thị phần trả lời của người bán nếu có */}
                    {rev.sellerReply && (
                      <div className="mt-3 ml-8 p-3 bg-surface-container-lowest border-l-2 border-primary rounded-r-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined text-[16px] text-primary">storefront</span>
                          <span className="font-bold text-xs text-on-surface">Phản hồi từ người bán</span>
                          <span className="text-[10px] text-on-surface-variant ml-auto">{rev.repliedAt ? new Date(rev.repliedAt).toLocaleDateString('vi-VN') : ''}</span>
                        </div>
                        <div className="text-sm text-on-surface-variant">{rev.sellerReply}</div>
                      </div>
                    )}
                    
                    {/* Form trả lời dành cho người bán (nếu chưa trả lời) */}
                    {user?.isLoggedIn && user.userId === product.sellerId && !rev.sellerReply && (
                      <div className="mt-2 ml-8">
                        {replyingTo === rev.id ? (
                          <div className="mt-2">
                            <textarea 
                              value={replyInput}
                              onChange={(e) => setReplyInput(e.target.value)}
                              placeholder="Nhập phản hồi cảm ơn khách hàng..."
                              className="w-full px-3 py-2 text-sm rounded-lg border border-outline-variant focus:border-primary outline-none bg-surface resize-none mb-2"
                              rows="2"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => handleSubmitReply(rev.id)} disabled={isSubmittingReply} className="px-4 py-1.5 bg-primary-container text-white text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50">Gửi</button>
                              <button onClick={() => setReplyingTo(null)} className="px-4 py-1.5 bg-surface-variant text-on-surface-variant text-xs font-bold rounded-lg hover:opacity-90">Hủy</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setReplyingTo(rev.id)} className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">reply</span> Trả lời
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Form viết đánh giá */}
            {user?.isLoggedIn && product?.sellerId && user.userId !== product.sellerId && (
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/50">
                <h3 className="font-bold text-on-surface mb-3 text-sm">Viết đánh giá của bạn</h3>
                <form onSubmit={handleSubmitReview}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-on-surface-variant">Chất lượng:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRatingInput(star)}
                          className={`text-xl transition-colors ${star <= ratingInput ? 'text-[#FFB800]' : 'text-gray-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Nhập nhận xét của bạn về người bán..."
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow bg-surface text-on-surface text-sm mb-3 resize-none"
                    rows="3"
                    required
                  ></textarea>
                  
                  {/* Image Upload for Review */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-3 mb-2">
                      {reviewImages.map((img, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-outline-variant shadow-sm">
                          <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeReviewImage(idx)}
                            className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-500 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[12px]">close</span>
                          </button>
                        </div>
                      ))}
                      {reviewImages.length < 5 && (
                        <label className={`w-16 h-16 rounded-lg border border-dashed border-outline flex flex-col items-center justify-center cursor-pointer hover:bg-surface-variant transition-colors ${isUploadingReviewImages ? 'opacity-50 pointer-events-none' : ''}`}>
                          <input type="file" multiple accept="image/*" onChange={handleReviewImageUpload} className="hidden" />
                          {isUploadingReviewImages ? (
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-primary text-[20px]">add_a_photo</span>
                            </>
                          )}
                        </label>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview || isUploadingReviewImages}
                    className="bg-primary text-white font-bold py-2 px-6 rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Cột phải: Thông tin & Hành động */}
        <div className="md:col-span-1 flex flex-col gap-4">
          
          {/* Thông tin sản phẩm */}
          <div className="bg-surface rounded-xl shadow-sm p-5 border border-outline-variant/30">
            <div className="flex justify-between items-start mb-2">
              <h1 className="font-headline-md font-bold text-on-surface line-clamp-2 pr-2">
                {product.name}
              </h1>
              <div className="flex gap-3 text-on-surface-variant flex-shrink-0">
                <button className="hover:text-primary transition-colors"><span className="material-symbols-outlined text-[22px]">share</span></button>
                <button onClick={handleToggleFavorite} className={`transition-colors ${isFavorite ? 'text-[#f44336]' : 'hover:text-primary'}`}>
                  <span className="material-symbols-outlined text-[22px]" style={{fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0"}}>
                    {isFavorite ? 'favorite' : 'favorite_border'}
                  </span>
                </button>
              </div>
            </div>
            
            <div className="font-display-price font-bold text-primary mb-4 text-[28px]">
              {new Intl.NumberFormat('vi-VN').format(product.price || 0)} đ
            </div>
            
            <div className="flex items-center text-on-surface-variant font-label-sm text-sm mb-6">
              <span className="material-symbols-outlined text-[16px] mr-1">location_on</span>
              {product.location || 'Cầu Giấy, Hà Nội'}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleChat} className="bg-primary text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined text-[20px]">chat</span>
                Chat ngay
              </button>
              <button className="border border-primary text-primary bg-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors">
                <span className="material-symbols-outlined text-[20px]">call</span>
                Gọi điện
              </button>
            </div>
          </div>

          {/* Thông tin người bán */}
          <div className="bg-surface rounded-xl shadow-sm p-4 border border-outline-variant/30 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src={seller?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuCnZsyyj2fTNm4ctjedSlRyM9DYm12HmD2MM79sfKzmHCRCDdvyzhIwFqH0T63V2TJEYXH566sRk147Zwp3f-XHa-JmIW0YlZA3k4lXUXe0MKvi4X1hpapzQUmyAdKOLSbYBHFNj9w85BBirHvmvA4COsIMAbtU7vccPTQ8oLa8qE0yJsnzQemYc58qv_1woW6mQpAQ61wAxV3KaGtb8wxwY6QzQ0cTVWUB_j-hbBbRZl7ohNSMl5GV"} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-outline-variant" />
              <div>
                <div className="font-bold text-on-surface text-sm mb-0.5">{seller ? (seller.name || seller.email?.split('@')[0]) : "Người bán ẩn danh"}</div>
                <div className="flex items-center text-[11px] text-on-surface-variant mb-0.5">
                  <span className="text-[#FFB800] mr-1">★</span> {averageRating > 0 ? averageRating.toFixed(1) : 'Chưa có'} ({reviews.length} đánh giá)
                </div>
                <div className="text-[11px] text-on-surface-variant">Tham gia từ {seller?.createdAt ? new Date(seller.createdAt).getFullYear() : '2022'} • {seller ? 'Nhiều' : '12'} tin đã đăng</div>
              </div>
            </div>
            <Link to={`/seller/${product.sellerId || 2}`} className="text-primary font-bold text-xs hover:underline whitespace-nowrap">
              Xem trang &gt;
            </Link>
          </div>

          {/* Cảnh báo an toàn */}
          <div className="bg-[#FFF4E5] rounded-xl p-4 flex gap-3 border border-[#FFE0B2]">
            <span className="material-symbols-outlined text-[#F26522] flex-shrink-0">gpp_maybe</span>
            <div className="font-body-md text-sm text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">ĐồCũ khuyên bạn</strong> nên giao dịch trực tiếp để kiểm tra hàng trước khi thanh toán. Không chuyển tiền cọc trước khi xem hàng.
            </div>
          </div>

        </div>
      </div>

      {/* Sản phẩm liên quan */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="font-headline-md font-bold text-on-surface mb-6 border-b border-outline-variant/30 pb-3">
            Sản phẩm liên quan
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {relatedProducts.map(p => (
               <Link key={p.id} to={`/product/${p.id}`} className="bg-surface rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group border border-outline-variant/30 flex flex-col">
                 <div className="aspect-[4/3] bg-surface-container-low overflow-hidden relative flex-shrink-0">
                   {p.imageUrls?.[0] ? (
                     <img src={p.imageUrls[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-outline"><span className="material-symbols-outlined text-4xl">image</span></div>
                   )}
                 </div>
                 <div className="p-3 flex flex-col flex-1">
                   <h3 className="font-semibold text-body-md text-on-surface line-clamp-2 mb-1 group-hover:text-primary transition-colors">{p.name}</h3>
                   <div className="font-bold text-primary text-body-md mb-2 mt-auto">{new Intl.NumberFormat('vi-VN').format(p.price || 0)} đ</div>
                   <div className="text-[10px] text-on-surface-variant flex items-center truncate"><span className="material-symbols-outlined text-[14px] mr-1">location_on</span> {p.location || 'Toàn quốc'}</div>
                 </div>
               </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default ProductDetail;
