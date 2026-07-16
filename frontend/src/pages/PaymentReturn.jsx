import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const PaymentReturn = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('Đang xử lý giao dịch...');

    useEffect(() => {
        const processPayment = async () => {
            const params = Object.fromEntries([...searchParams]);
            try {
                const response = await api.post('/users/payment/return', params);
                if (response.data.status === 'success') {
                    setStatus('success');
                    setMessage(response.data.message || 'Thanh toán thành công!');
                } else {
                    setStatus('error');
                    setMessage(response.data.message || 'Giao dịch không thành công!');
                }
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Có lỗi xảy ra khi xử lý giao dịch.');
            }
        };

        if (searchParams.toString()) {
            processPayment();
        } else {
            setStatus('error');
            setMessage('Không tìm thấy thông tin giao dịch.');
        }
    }, [searchParams]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                {status === 'processing' && (
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#f26522] mx-auto mb-6"></div>
                )}
                {status === 'success' && (
                    <span className="material-symbols-outlined text-7xl text-[#00a841] mb-4">check_circle</span>
                )}
                {status === 'error' && (
                    <span className="material-symbols-outlined text-7xl text-[#ef4444] mb-4">error</span>
                )}

                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    {status === 'processing' ? 'Đang xử lý' : status === 'success' ? 'Thành công' : 'Thất bại'}
                </h1>
                <p className="text-gray-600 mb-8">{message}</p>

                <button 
                    onClick={() => navigate('/manage-posts')} 
                    className="w-full bg-[#f26522] hover:bg-[#d85515] text-white font-bold py-3 px-4 rounded-xl transition-colors"
                >
                    Về trang Quản lý
                </button>
            </div>
        </div>
    );
};

export default PaymentReturn;
