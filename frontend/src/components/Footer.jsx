import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Footer = () => {
  const [siteSettings, setSiteSettings] = useState({});

  useEffect(() => {
    api.get('/products/settings')
      .then(res => setSiteSettings(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <footer className="bg-surface-container-low w-full border-t border-outline-variant">
      <div className="py-xl px-4 md:px-gutter max-w-container-max mx-auto grid grid-cols-2 md:grid-cols-4 gap-lg pb-32 md:pb-xl">
        <div className="col-span-2 md:col-span-1">
          <h3 className="text-headline-md font-headline-md font-bold text-primary mb-4">ĐồCũ</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-4">
            {siteSettings.footer_description || "Nền tảng mua bán đồ cũ an toàn, tiện lợi và đáng tin cậy. Renewed Value Community."}
          </p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            {siteSettings.footer_copyright || "© 2024 ĐồCũ. Renewed Value Community."}
          </p>
        </div>
        <div>
          <h4 className="font-headline-md text-on-surface font-semibold mb-4 text-[16px]">Về ĐồCũ</h4>
          <ul className="space-y-2">
            <li><Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" to="/about">Về chúng tôi</Link></li>
            <li><Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" to="/rules">Quy chế hoạt động</Link></li>
            <li><Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" to="/careers">Tuyển dụng</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-headline-md text-on-surface font-semibold mb-4 text-[16px]">Hỗ trợ khách hàng</h4>
          <ul className="space-y-2">
            <li><Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" to="/help">Trợ giúp</Link></li>
            <li><Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" to="/privacy">Chính sách bảo mật</Link></li>
            <li><Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" to="/complaints">Giải quyết khiếu nại</Link></li>
            <li><Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" to="/contact">Liên hệ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-headline-md text-on-surface font-semibold mb-4 text-[16px]">Tải ứng dụng</h4>
          <div className="flex flex-col gap-2">
            <a className="bg-surface border border-outline-variant rounded-md p-2 flex justify-center items-center hover:bg-surface-variant transition-colors text-sm" href="#">
              App Store
            </a>
            <a className="bg-surface border border-outline-variant rounded-md p-2 flex justify-center items-center hover:bg-surface-variant transition-colors text-sm" href="#">
              Google Play
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
