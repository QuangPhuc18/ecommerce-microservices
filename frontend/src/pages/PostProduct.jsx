import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, MapPin, Tag, Image as ImageIcon, X } from 'lucide-react';

const categories = [
  { id: 'Xe cộ', name: 'Xe cộ', icon: 'directions_car' },
  { id: 'Điện tử', name: 'Đồ điện tử', icon: 'smartphone' },
  { id: 'Nhà đất', name: 'Bất động sản', icon: 'home_work' },
  { id: 'Thời trang', name: 'Thời trang', icon: 'checkroom' },
  { id: 'Thú cưng', name: 'Thú cưng', icon: 'pets' },
  { id: 'Nội thất', name: 'Nội thất', icon: 'chair' },
  { id: 'Đồ gia dụng', name: 'Đồ gia dụng', icon: 'kitchen' },
  { id: 'Khác', name: 'Khác', icon: 'more_horiz' }
];

const PostProduct = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const editId = query.get('editId');
  
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    category: '',
    needType: 'sell',
    sellerType: 'personal',
    name: '',
    description: '',
    price: '',
    stock: 1,
    itemCondition: 'USED',
    location: '', // Will combine city, district, address later
    city: '',
    district: '',
    address: '',
    phone: '0901234567',
    showPhone: true,
    status: 'ACTIVE',
    imageUrls: [],
    brand: '',
    warranty: ''
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (editId) {
      const fetchProduct = async () => {
        try {
          const res = await api.get(`/products/${editId}`);
          const p = res.data;
          
          let city = '', district = '', address = '';
          if (p.location) {
             const parts = p.location.split(', ');
             if (parts.length >= 3) {
                 address = parts[0]; district = parts[1]; city = parts[2];
             } else { city = p.location; }
          }
          let brand = '', warranty = '';
          if (p.attributes) {
             try {
               const attr = JSON.parse(p.attributes);
               brand = attr['Thương hiệu'] || '';
               warranty = attr['Bảo hành'] || '';
             } catch(e) {}
          }

          setFormData({
            category: p.category || '', needType: 'sell', sellerType: 'personal',
            name: p.name || '', description: p.description || '', price: p.price || '', stock: p.stock || 1,
            itemCondition: p.itemCondition || 'USED', location: p.location || '',
            city, district, address, phone: p.phone || '0901234567', showPhone: true,
            status: p.status || 'PENDING', imageUrls: p.imageUrls || [], brand, warranty
          });
          setPreviewUrls(p.imageUrls || []);
          setIsEditing(true);
          setStep(3);
        } catch (err) {
          alert('Không tìm thấy tin đăng!');
          navigate('/manage-posts');
        }
      };
      fetchProduct();
    }
  }, [editId, navigate]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSelectCategory = (catId) => {
    setFormData({ ...formData, category: catId });
    setStep(2);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Max 10 files total
    if (selectedFiles.length + files.length > 10) {
      alert("Chỉ được tải lên tối đa 10 ảnh!");
      return;
    }
    
    setSelectedFiles(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    if (index < formData.imageUrls.length) {
       const newUrls = [...formData.imageUrls];
       newUrls.splice(index, 1);
       setFormData({...formData, imageUrls: newUrls});
       
       const newPreviews = [...previewUrls];
       newPreviews.splice(index, 1);
       setPreviewUrls(newPreviews);
    } else {
       const fileIndex = index - formData.imageUrls.length;
       const newFiles = [...selectedFiles];
       newFiles.splice(fileIndex, 1);
       setSelectedFiles(newFiles);
       
       const newPreviews = [...previewUrls];
       URL.revokeObjectURL(newPreviews[index]); 
       newPreviews.splice(index, 1);
       setPreviewUrls(newPreviews);
    }
  };

  const handlePost = async () => {
    setIsUploading(true);
    try {
      let finalImageUrls = [...formData.imageUrls];
      
      if (selectedFiles.length > 0) {
        const uploadData = new FormData();
        selectedFiles.forEach(file => {
          uploadData.append('files', file);
        });
        
        const uploadRes = await api.post('/media/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (uploadRes.data && uploadRes.data.urls) {
          const uploadedUrls = uploadRes.data.urls.map(url => `http://localhost:8088${url}`);
          finalImageUrls = [...finalImageUrls, ...uploadedUrls];
        }
      }
      
      if (finalImageUrls.length === 0) {
        finalImageUrls = ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'];
      }

      // Combine location
      const fullLocation = [formData.address, formData.district, formData.city].filter(Boolean).join(', ');

      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: 1,
        category: formData.category,
        location: fullLocation || 'Toàn quốc',
        itemCondition: formData.itemCondition,
        status: 'PENDING',
        approved: false,
        imageUrls: finalImageUrls,
        attributes: JSON.stringify({ 
          'Thương hiệu': formData.brand, 
          'Bảo hành': formData.warranty 
        })
      };

      if (isEditing) {
        await api.put(`/products/${editId}`, payload);
        alert("Cập nhật tin thành công! Tin sẽ chờ duyệt lại.");
        navigate('/manage-posts');
      } else {
        await api.post('/products', payload);
        alert("Đăng tin thành công!");
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  // ---------------- Render Steps ----------------

  const renderStep1 = () => (
    <main className="flex-grow w-full max-w-container-max mx-auto px-4 md:px-gutter py-lg pb-xl animate-fade-in pt-24">
      <div className="max-w-3xl mx-auto">
        <div className="mb-lg text-center">
          <h2 className="font-headline-lg font-bold text-on-surface mb-2">Bạn muốn bán gì hôm nay?</h2>
          <p className="font-body-md text-on-surface-variant">Chọn danh mục phù hợp để tin đăng tiếp cận đúng người mua.</p>
        </div>
        
        <div className="relative w-full mb-xl">
          <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-on-surface-variant">search</span>
          <input className="w-full pl-12 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-shadow" placeholder="Tìm danh mục (VD: Điện thoại, Xe máy...)" type="text" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => handleSelectCategory(cat.id)} className="flex flex-col items-center justify-center p-6 bg-surface-container-lowest rounded-xl border border-outline-variant hover:border-primary-container hover:shadow-md transition-all duration-200 group text-center aspect-square">
              <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-4 group-hover:bg-primary-container/10 transition-colors">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant group-hover:text-primary-container transition-colors">{cat.icon}</span>
              </div>
              <span className="font-headline-md text-[16px] font-bold text-on-surface group-hover:text-primary-container transition-colors line-clamp-2">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );

  const renderStep2 = () => (
    <main className="flex-grow flex flex-col items-center py-xl px-4 md:px-gutter max-w-container-max mx-auto w-full max-w-3xl animate-fade-in pt-24">
      <div className="w-full bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] p-6 md:p-8 border border-outline-variant/30">
        <h2 className="font-headline-lg font-bold text-on-surface mb-8 text-center">Bạn muốn đăng loại tin nào?</h2>
        
        <div className="space-y-10 w-full">
          <section>
            <h3 className="font-body-lg font-bold text-on-surface-variant mb-4">Nhu cầu của bạn là gì?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="cursor-pointer relative group">
                <input type="radio" name="needType" value="sell" checked={formData.needType === 'sell'} onChange={handleChange} className="peer sr-only" />
                <div className="border-2 border-outline-variant rounded-xl p-6 flex flex-col items-center text-center transition-all duration-200 peer-checked:border-primary-container peer-checked:bg-primary-container/5 hover:bg-surface-container-low">
                  <span className="material-symbols-outlined text-4xl mb-2 peer-checked:text-primary-container text-on-surface-variant">storefront</span>
                  <h4 className="font-bold text-on-surface mb-1 peer-checked:text-primary-container">Cần bán</h4>
                  <p className="text-sm text-on-surface-variant">Đăng bán sản phẩm, dịch vụ bạn đang có.</p>
                </div>
              </label>
              <label className="cursor-pointer relative group">
                <input type="radio" name="needType" value="buy" checked={formData.needType === 'buy'} onChange={handleChange} className="peer sr-only" />
                <div className="border-2 border-outline-variant rounded-xl p-6 flex flex-col items-center text-center transition-all duration-200 peer-checked:border-primary-container peer-checked:bg-primary-container/5 hover:bg-surface-container-low">
                  <span className="material-symbols-outlined text-4xl mb-2 peer-checked:text-primary-container text-on-surface-variant">shopping_cart</span>
                  <h4 className="font-bold text-on-surface mb-1 peer-checked:text-primary-container">Cần mua</h4>
                  <p className="text-sm text-on-surface-variant">Tìm kiếm người bán có sản phẩm bạn cần.</p>
                </div>
              </label>
            </div>
          </section>

          <hr className="border-t border-outline-variant/30" />
          
          <section>
            <h3 className="font-body-lg font-bold text-on-surface-variant mb-4">Bạn đăng tin với tư cách?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="cursor-pointer relative group">
                <input type="radio" name="sellerType" value="personal" checked={formData.sellerType === 'personal'} onChange={handleChange} className="peer sr-only" />
                <div className="border-2 border-outline-variant rounded-xl p-6 flex flex-col items-center text-center transition-all duration-200 peer-checked:border-primary-container peer-checked:bg-primary-container/5 hover:bg-surface-container-low">
                  <span className="material-symbols-outlined text-4xl mb-2 peer-checked:text-primary-container text-on-surface-variant">person</span>
                  <h4 className="font-bold text-on-surface mb-1 peer-checked:text-primary-container">Cá nhân</h4>
                  <p className="text-sm text-on-surface-variant">Thanh lý đồ cũ, không kinh doanh thường xuyên.</p>
                </div>
              </label>
              <label className="cursor-pointer relative group">
                <input type="radio" name="sellerType" value="pro" checked={formData.sellerType === 'pro'} onChange={handleChange} className="peer sr-only" />
                <div className="border-2 border-outline-variant rounded-xl p-6 flex flex-col items-center text-center transition-all duration-200 peer-checked:border-primary-container peer-checked:bg-primary-container/5 hover:bg-surface-container-low">
                  <span className="material-symbols-outlined text-4xl mb-2 peer-checked:text-primary-container text-on-surface-variant">apartment</span>
                  <h4 className="font-bold text-on-surface mb-1 peer-checked:text-primary-container">Bán chuyên/Kinh doanh</h4>
                  <p className="text-sm text-on-surface-variant">Cửa hàng, doanh nghiệp, người bán thường xuyên.</p>
                </div>
              </label>
            </div>
          </section>

          <div className="pt-6 flex justify-end">
            <button onClick={() => setStep(3)} type="button" className="bg-primary-container text-white font-bold py-3 px-8 rounded-lg hover:bg-primary transition-colors shadow-sm flex items-center">
              Tiếp tục <span className="material-symbols-outlined ml-2">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );

  const renderStep3 = () => (
    <main className="pt-24 pb-32 px-4 md:px-gutter max-w-[800px] mx-auto w-full animate-fade-in">
      <form onSubmit={(e) => { e.preventDefault(); setStep(4); }} className="space-y-6">
        
        {/* HÌNH ẢNH */}
        <section className="bg-surface rounded-xl shadow-sm p-6 border border-outline-variant/30">
          <div className="mb-4 flex items-center justify-between border-b border-outline-variant/30 pb-2">
            <h2 className="font-headline-md font-bold text-on-surface">Hình ảnh</h2>
            <span className="font-body-md text-on-surface-variant text-sm">Tối đa 10 ảnh</span>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <label className="w-24 h-24 rounded-lg border-2 border-dashed border-primary/50 bg-surface-container-low flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors text-primary relative">
              <span className="material-symbols-outlined text-3xl mb-1">add_photo_alternate</span>
              <span className="text-[10px] font-bold">Thêm ảnh</span>
              <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
            
            {previewUrls.map((url, index) => (
              <div key={index} className="w-24 h-24 rounded-lg border border-outline-variant relative overflow-hidden group bg-surface-container-lowest">
                <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeFile(index)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={14} />
                </button>
                {index === 0 && (
                  <div className="absolute bottom-0 left-0 w-full bg-primary-container text-white text-[10px] font-bold text-center py-0.5">
                    Ảnh bìa
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* THÔNG TIN SẢN PHẨM */}
        <section className="bg-surface rounded-xl shadow-sm p-6 border border-outline-variant/30 space-y-4">
          <h2 className="font-headline-md font-bold text-on-surface border-b border-outline-variant/30 pb-2">Thông tin sản phẩm</h2>
          
          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-1">Tiêu đề tin đăng <span className="text-error">*</span></label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow bg-surface text-on-surface" placeholder="Ví dụ: iPhone 12 Pro Max 128GB VN/A..." />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-1">Mô tả chi tiết <span className="text-error">*</span></label>
            <textarea required name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow bg-surface text-on-surface resize-none" placeholder="Mô tả tình trạng, xuất xứ, phụ kiện đi kèm..."></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-1">Giá (VND) <span className="text-error">*</span></label>
              <div className="relative">
                <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full pl-4 pr-12 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow bg-surface text-on-surface" placeholder="VD: 5000000" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">đ</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-1">Tình trạng <span className="text-error">*</span></label>
              <select name="itemCondition" value={formData.itemCondition} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow bg-surface text-on-surface">
                <option value="NEW">Mới nguyên seal</option>
                <option value="USED">Cũ (Sử dụng tốt)</option>
              </select>
            </div>
          </div>
          
          {/* Thuộc tính bổ sung */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-1">Thương hiệu</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow bg-surface text-on-surface" placeholder="VD: Apple, Honda, Sony..." />
            </div>
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-1">Bảo hành</label>
              <select name="warranty" value={formData.warranty} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow bg-surface text-on-surface">
                <option value="">Chọn tình trạng bảo hành</option>
                <option value="Còn bảo hành">Còn bảo hành</option>
                <option value="Hết bảo hành">Hết bảo hành</option>
                <option value="Bảo hành 1 tháng">Bảo hành 1 tháng</option>
                <option value="Bảo hành 6 tháng">Bảo hành 6 tháng</option>
                <option value="Bao test 7 ngày">Bao test 7 ngày</option>
              </select>
            </div>
          </div>
        </section>

        {/* VỊ TRÍ */}
        <section className="bg-surface rounded-xl shadow-sm p-6 border border-outline-variant/30 space-y-4">
          <h2 className="font-headline-md font-bold text-on-surface border-b border-outline-variant/30 pb-2">Vị trí</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-1">Tỉnh/Thành phố <span className="text-error">*</span></label>
              <select required name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow bg-surface text-on-surface">
                <option value="">Chọn Tỉnh/Thành phố</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="TP. HCM">TP. Hồ Chí Minh</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-1">Quận/Huyện <span className="text-error">*</span></label>
              <input required type="text" name="district" value={formData.district} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow bg-surface text-on-surface" placeholder="VD: Quận 1" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-1">Địa chỉ cụ thể</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow bg-surface text-on-surface" placeholder="Số nhà, tên đường, phường/xã..." />
          </div>
        </section>

        {/* THÔNG TIN LIÊN HỆ */}
        <section className="bg-surface rounded-xl shadow-sm p-6 border border-outline-variant/30 space-y-4 mb-20">
          <h2 className="font-headline-md font-bold text-on-surface border-b border-outline-variant/30 pb-2">Thông tin liên hệ</h2>
          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-1">Số điện thoại <span className="text-error">*</span></label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">phone</span>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-12 pr-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow bg-surface text-on-surface" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="showPhone" name="showPhone" checked={formData.showPhone} onChange={handleChange} className="w-5 h-5 rounded text-primary-container focus:ring-primary-container border-outline-variant" />
            <label htmlFor="showPhone" className="text-sm text-on-surface cursor-pointer select-none">Hiển thị số điện thoại công khai trên tin đăng</label>
          </div>
        </section>

        {/* STICKY FOOTER */}
        <div className="fixed bottom-0 left-0 w-full bg-surface border-t border-outline-variant/30 p-4 z-40 shadow-[0px_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="max-w-[800px] mx-auto flex justify-between items-center gap-4">
            <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 px-6 rounded-xl border border-outline-variant font-bold text-on-surface hover:bg-surface-container-low transition-colors text-center">
              Quay lại
            </button>
            <button type="submit" className="flex-1 py-3 px-6 rounded-xl bg-primary-container text-white font-bold shadow-md hover:opacity-90 transition-opacity text-center">
              Xem trước
            </button>
          </div>
        </div>
      </form>
    </main>
  );

  const renderStep4 = () => {
    const imagesToDisplay = previewUrls.length > 0 ? previewUrls : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'];
    
    return (
      <main className="pt-24 pb-32 max-w-container-max mx-auto px-4 md:px-gutter animate-fade-in">
        <h2 className="font-headline-lg font-bold text-center text-on-surface mb-8">Xem lại tin đăng của bạn</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Cột trái: Ảnh và Mô tả */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <div className="bg-surface rounded-xl overflow-hidden shadow-sm p-4 border border-outline-variant/30">
              <div className="relative w-full aspect-[4/3] md:aspect-[16/10] bg-surface-container-low rounded-lg overflow-hidden mb-3">
                <img src={imagesToDisplay[activeImageIndex]} alt="Preview" className="w-full h-full object-contain" />
                <div className="absolute top-3 left-3 bg-[#007AFF] text-white text-xs font-bold px-2 py-1 rounded uppercase shadow-sm">
                  Mới đăng
                </div>
              </div>
              
              {imagesToDisplay.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {imagesToDisplay.map((url, idx) => (
                    <button key={idx} onClick={() => setActiveImageIndex(idx)} className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${activeImageIndex === idx ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                      <img src={url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-surface rounded-xl shadow-sm p-6 border border-outline-variant/30">
              <h2 className="font-headline-md font-bold text-on-surface mb-4">Mô tả chi tiết</h2>
              <div className="font-body-md text-on-surface-variant leading-relaxed whitespace-pre-line">
                {formData.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
              </div>
            </div>
          </div>

          {/* Cột phải: Thông tin */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <div className="bg-surface rounded-xl shadow-sm p-5 border border-outline-variant/30">
              <h1 className="font-headline-md font-bold text-on-surface line-clamp-2 pr-2 mb-2">
                {formData.name || 'Tên sản phẩm'}
              </h1>
              
              <div className="font-display-price font-bold text-primary mb-4 text-[28px]">
                {formData.price ? new Intl.NumberFormat('vi-VN').format(formData.price) : '0'} đ
              </div>
              
              <div className="flex items-center text-on-surface-variant text-sm mb-6">
                <span className="material-symbols-outlined text-[16px] mr-1">location_on</span>
                {[formData.address, formData.district, formData.city].filter(Boolean).join(', ') || 'Chưa nhập vị trí'}
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-sm p-4 border border-outline-variant/30 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant">person</span>
                </div>
                <div>
                  <div className="font-bold text-on-surface text-sm mb-0.5">{formData.sellerType === 'pro' ? 'Bán chuyên' : 'Cá nhân'}</div>
                  <div className="text-[11px] text-on-surface-variant">Sẽ hiển thị tên của bạn khi đăng</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STICKY FOOTER CHO PREVIEW */}
        <div className="fixed bottom-0 left-0 w-full bg-surface border-t border-outline-variant/30 p-4 z-40 shadow-[0px_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="max-w-[800px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-on-surface-variant text-center md:text-left flex-1">
              Vui lòng kiểm tra kỹ thông tin trước khi đăng.
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <button disabled={isUploading} type="button" onClick={() => setStep(3)} className="flex-1 md:flex-none py-3 px-6 rounded-xl border border-outline-variant font-bold text-on-surface hover:bg-surface-container-low transition-colors text-center">
                Chỉnh sửa
              </button>
              <button disabled={isUploading} onClick={handlePost} type="button" className={`flex-1 md:flex-none py-3 px-8 rounded-xl bg-primary-container text-white font-bold shadow-md transition-opacity text-center flex items-center justify-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}>
                {isUploading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang đăng...</>
                ) : (
                  isEditing ? 'Cập nhật tin' : 'Đăng tin ngay'
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  };

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header Wizard (Step 1-3) */}
      {step < 4 && (
        <header className="w-full bg-surface border-b border-surface-variant sticky top-0 z-50">
          <div className="max-w-container-max mx-auto px-4 md:px-gutter h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => { if (step > 1) setStep(step - 1); else navigate('/'); }} className="text-on-surface-variant hover:text-on-surface transition-colors p-2 -ml-2 rounded-full hover:bg-surface-container">
                <span className="material-symbols-outlined">{step === 1 ? 'close' : 'arrow_back'}</span>
              </button>
              <h1 className="font-headline-md font-bold text-on-surface">
                {isEditing ? 'Cập nhật tin' : step === 1 ? 'Đăng tin mới' : step === 2 ? 'Loại tin' : 'Chi tiết'}
              </h1>
            </div>
            <div className="text-on-surface-variant font-bold text-sm">
              Bước {step} / 4
            </div>
          </div>
          <div className="w-full h-1 bg-surface-variant">
            <div className="h-full bg-primary-container transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }}></div>
          </div>
        </header>
      )}

      {/* Header Preview (Step 4) */}
      {step === 4 && (
        <header className="w-full bg-surface border-b border-surface-variant sticky top-0 z-50">
          <div className="max-w-container-max mx-auto px-4 md:px-gutter h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setStep(3)} className="text-on-surface-variant hover:text-on-surface transition-colors p-2 -ml-2 rounded-full hover:bg-surface-container">
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h1 className="font-headline-md font-bold text-on-surface">{isEditing ? 'Xem lại & Cập nhật' : 'Xem lại & Đăng tin'}</h1>
            </div>
            <div className="text-on-surface-variant font-bold text-sm">
              Bước 4 / 4
            </div>
          </div>
          <div className="w-full h-1 bg-surface-variant">
            <div className="h-full bg-primary-container transition-all duration-300" style={{ width: '100%' }}></div>
          </div>
        </header>
      )}

      {/* Render Current Step */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </div>
  );
};

export default PostProduct;
