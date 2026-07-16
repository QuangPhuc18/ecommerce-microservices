import React, { useState } from 'react';
import api from '../services/api';

const VipPackages = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const handleBuyPackage = async (packageType, price) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        alert('Vui lòng đăng nhập để nâng cấp VIP');
        setIsLoading(false);
        return;
      }
      
      const response = await api.post(`/payment/create-url?amount=${price}&packageType=${packageType}`);
      if (response.data && response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        alert('Không thể tạo liên kết thanh toán');
      }
    } catch (error) {
      console.error('Error creating payment url', error);
      alert('Có lỗi xảy ra khi tạo thanh toán VNPay');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[600px] animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-[#1c1b1b] mb-3">Nâng cấp tài khoản VIP</h1>
        <p className="text-on-surface-variant max-w-xl mx-auto">
          Tối ưu hóa doanh thu và tiếp cận hàng triệu khách hàng tiềm năng trên ĐồCũ. Chọn gói phù hợp với nhu cầu kinh doanh của bạn.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-center gap-8 max-w-4xl mx-auto">
        {/* Gói Thường */}
        <div className="flex-1 bg-white border border-gray-200 rounded-3xl p-8 hover:border-primary/50 transition-all hover:shadow-lg relative flex flex-col">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#1c1b1b] mb-2">Gói Thường</h2>
            <p className="text-on-surface-variant text-sm">Dành cho người bán cá nhân muốn đẩy nhanh tốc độ bán hàng</p>
          </div>
          <div className="mb-8">
            <span className="text-4xl font-extrabold text-[#1c1b1b]">499.000đ</span>
            <span className="text-on-surface-variant font-medium">/tháng</span>
          </div>
          
          <ul className="flex flex-col gap-4 mb-8 flex-1">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">check_circle</span>
              <span className="text-[#1c1b1b]"><strong>50</strong> lượt đăng tin mới trong 30 ngày</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">check_circle</span>
              <span className="text-[#1c1b1b]"><strong>40</strong> lượt đẩy tin lên Top</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">check_circle</span>
              <span className="text-[#1c1b1b]"><strong>Không giới hạn</strong> số lượng đăng tin trên hệ thống ĐồCũ</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">check_circle</span>
              <span className="text-[#1c1b1b]">Hỗ trợ khách hàng tiêu chuẩn</span>
            </li>
          </ul>

          <button 
            onClick={() => handleBuyPackage('THUONG', 499000)}
            disabled={isLoading}
            className="w-full py-3.5 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
          >
            Đăng ký Gói Thường
          </button>
        </div>

        {/* Gói Pro */}
        <div className="flex-1 bg-[#fff8eb] border-2 border-[#feb700] rounded-3xl p-8 shadow-xl relative flex flex-col transform md:-translate-y-4">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#ff8a00] to-[#e52e71] text-white font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
            Phổ biến nhất
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#6b4b00] mb-2 flex items-center gap-2">
              Gói Pro <span className="material-symbols-outlined text-[#feb700]">workspace_premium</span>
            </h2>
            <p className="text-[#8c6b14] text-sm">Giải pháp toàn diện cho cửa hàng và người bán chuyên nghiệp</p>
          </div>
          <div className="mb-8">
            <span className="text-4xl font-extrabold text-[#6b4b00]">999.000đ</span>
            <span className="text-[#8c6b14] font-medium">/tháng</span>
          </div>
          
          <ul className="flex flex-col gap-4 mb-8 flex-1">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#feb700] text-[20px] mt-0.5">check_circle</span>
              <span className="text-[#4a3400]"><strong>70</strong> lượt đăng tin mới trong 30 ngày</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#feb700] text-[20px] mt-0.5">check_circle</span>
              <span className="text-[#4a3400]"><strong>60</strong> lượt đẩy tin lên Top</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#feb700] text-[20px] mt-0.5">check_circle</span>
              <span className="text-[#4a3400]"><strong>Không giới hạn</strong> số lượng đăng tin trên hệ thống ĐồCũ</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#feb700] text-[20px] mt-0.5">check_circle</span>
              <span className="text-[#4a3400]">Có huy hiệu <strong>"Shop VIP"</strong> gắn trên mọi sản phẩm</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#feb700] text-[20px] mt-0.5">check_circle</span>
              <span className="text-[#4a3400]">Hỗ trợ kỹ thuật 24/7 (Đội ngũ riêng)</span>
            </li>
          </ul>

          <button 
            onClick={() => handleBuyPackage('PRO', 999000)}
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-[#feb700] to-[#ff9800] text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-md text-lg disabled:opacity-50"
          >
            Đăng ký Gói Pro
          </button>
        </div>
      </div>
    </div>
  );
};

export default VipPackages;
