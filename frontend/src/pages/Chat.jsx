import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';

const Chat = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // 1. Kiểm tra đăng nhập
  useEffect(() => {
    if (!authLoading && (!user || !user.isLoggedIn)) {
      alert("Bạn cần đăng nhập để xem tin nhắn.");
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Load user profile
  useEffect(() => {
    if (user?.userId) {
      api.get(`/users/${user.userId}`)
        .then(res => setUserProfile(res.data))
        .catch(err => console.error(err));
    }
  }, [user]);

  // 2. Fetch danh sách phòng chat kèm thông tin đối tác và sản phẩm
  useEffect(() => {
    const fetchRoomsData = async () => {
      if (!user?.isLoggedIn) return;
      try {
        setRoomsLoading(true);
        // Lấy danh sách room
        const roomRes = await api.get('/chat/rooms');
        const roomsData = roomRes.data.data || [];

        // Lấy thông tin user đối tác và sản phẩm cho từng room
        const enrichedRooms = await Promise.all(
          roomsData.map(async (room) => {
            try {
              const otherUserId = Number(user.userId) === room.buyerId ? room.sellerId : room.buyerId;
              
              // Gọi API song song
              const [userRes, productRes] = await Promise.all([
                api.get(`/users/${otherUserId}`).catch(() => ({ data: { name: 'Người dùng ẩn', avatarUrl: null } })),
                api.get(`/products/${room.productId}`).catch(() => ({ data: { name: 'Sản phẩm không tồn tại', price: 0, imageUrls: [] } }))
              ]);

              return {
                ...room,
                otherUser: userRes.data,
                product: productRes.data
              };
            } catch (err) {
              return room; // Fallback nếu lỗi
            }
          })
        );
        
        // Sắp xếp room theo thời gian cập nhật mới nhất
        enrichedRooms.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setRooms(enrichedRooms);
        
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setRoomsLoading(false);
      }
    };

    fetchRoomsData();
  }, [user]);

  // 3. Xử lý tải tin nhắn và Polling
  const fetchMessages = async (roomId) => {
    try {
      const res = await api.get(`/chat/rooms/${roomId}/messages?page=0&size=100`);
      // API trả về content là list tin nhắn, sx từ mới -> cũ do order by desc trong DB (tuỳ backend)
      // Thường backend Page sẽ trả từ mới nhất, ta cần reverse lại để hiển thị từ trên xuống dưới
      let msgs = res.data.data.content || [];
      msgs = [...msgs].reverse(); 
      setMessages(msgs);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    // Clear polling cũ nếu có
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    if (activeRoom) {
      // Tải tin nhắn ngay lập tức
      fetchMessages(activeRoom.id);
      // Đánh dấu đã đọc
      api.put(`/chat/rooms/${activeRoom.id}/read`).catch(e => console.error(e));

      // Thiết lập Polling mỗi 3 giây
      pollingIntervalRef.current = setInterval(() => {
        fetchMessages(activeRoom.id);
      }, 3000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [activeRoom]);

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Gửi tin nhắn
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeRoom) return;

    const content = messageInput.trim();
    setMessageInput(''); // Clear input ngay để UI mượt

    try {
      const res = await api.post(`/chat/rooms/${activeRoom.id}/messages`, {
        content: content,
        type: 'TEXT'
      });
      // Append tin nhắn vừa gửi vào cuối mảng để hiển thị ngay lập tức
      setMessages(prev => [...prev, res.data.data]);
      
      // Update lastMessage ở rooms list
      setRooms(prevRooms => prevRooms.map(r => 
        r.id === activeRoom.id 
          ? { ...r, lastMessage: content, updatedAt: new Date().toISOString() } 
          : r
      ));
      
      
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
      alert("Không thể gửi tin nhắn.");
    }
  };

  // 5. Gửi Ảnh
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeRoom) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn một tệp hình ảnh.');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('files', file);

      // Gọi api upload
      const uploadRes = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const fileUrls = uploadRes.data.urls;
      if (fileUrls && fileUrls.length > 0) {
        const imageUrl = "http://localhost:8088" + fileUrls[0]; // Giả định url backend trả về tương đối

        // Gửi tin nhắn IMAGE
        const msgRes = await api.post(`/chat/rooms/${activeRoom.id}/messages`, {
          content: imageUrl,
          messageType: 'IMAGE'
        });
        
        setMessages(prev => [...prev, msgRes.data.data]);
        setRooms(prevRooms => prevRooms.map(r => 
          r.id === activeRoom.id 
            ? { ...r, lastMessage: "[Hình ảnh]", updatedAt: new Date().toISOString() } 
            : r
        ));
      }
    } catch (error) {
      console.error("Lỗi upload ảnh:", error);
      alert("Không thể tải ảnh lên.");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 6. Gửi Vị Trí
  const handleSendLocation = () => {
    if (!activeRoom) return;
    
    if (!navigator.geolocation) {
      alert("Trình duyệt của bạn không hỗ trợ định vị GPS.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const locationLink = `https://www.google.com/maps?q=${lat},${lng}`;

        try {
          const msgRes = await api.post(`/chat/rooms/${activeRoom.id}/messages`, {
            content: locationLink,
            messageType: 'LOCATION'
          });
          
          setMessages(prev => [...prev, msgRes.data.data]);
          setRooms(prevRooms => prevRooms.map(r => 
            r.id === activeRoom.id 
              ? { ...r, lastMessage: "[Vị trí]", updatedAt: new Date().toISOString() } 
              : r
          ));
        } catch (error) {
          console.error("Lỗi gửi vị trí:", error);
        }
      },
      (error) => {
        console.error("Lỗi lấy vị trí:", error);
        alert("Không thể lấy vị trí hiện tại của bạn. Vui lòng cấp quyền vị trí cho trình duyệt.");
      }
    );
  };

  // Helper format thời gian
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return 'Hôm nay';
    return date.toLocaleDateString('vi-VN');
  };

  if (authLoading || !user?.isLoggedIn) return null;

  return (
    <div className="bg-background text-on-surface h-screen flex flex-col overflow-hidden animate-fade-in">
      {/* Sử dụng Navbar chung thay vì header code cứng */}
      <Navbar />

      <main className="pt-16 h-screen flex flex-1 overflow-hidden">
        {/* SideNavBar (Hidden on Mobile) */}
        <aside className="h-full w-64 hidden md:flex flex-col bg-surface-container-low p-md gap-sm border-r border-outline-variant/30">
          <div className="flex items-center gap-md mb-lg">
            <div className="w-12 h-12 rounded-full bg-surface-variant overflow-hidden shadow-sm flex items-center justify-center text-on-surface-variant bg-surface-container-high">
              {userProfile?.avatarUrl ? (
                <img className="w-full h-full object-cover" alt="Avatar" src={userProfile.avatarUrl} />
              ) : (
                <span className="material-symbols-outlined text-3xl">account_circle</span>
              )}
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface leading-tight font-bold truncate w-40">{user.email?.split('@')[0]}</h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Tài khoản của bạn</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            <Link to="/chat" className="flex items-center gap-3 p-3 bg-secondary-container text-on-secondary-container rounded-lg font-bold transition-transform active:translate-x-1 shadow-sm">
              <span className="material-symbols-outlined">mail</span>
              <span className="font-label-sm text-label-sm">Hộp thư</span>
            </Link>
            <Link to="#" className="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-all">
              <span className="material-symbols-outlined">shopping_bag</span>
              <span className="font-label-sm text-label-sm">Mua hàng</span>
            </Link>
            <Link to="#" className="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-all">
              <span className="material-symbols-outlined">sell</span>
              <span className="font-label-sm text-label-sm">Bán hàng</span>
            </Link>
            <Link to="#" className="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-all">
              <span className="material-symbols-outlined">favorite</span>
              <span className="font-label-sm text-label-sm">Yêu thích</span>
            </Link>
          </nav>
        </aside>

        {/* Messenger Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Column 1: Conversations List (30%) */}
          <section className="w-full md:w-[30%] flex flex-col border-r border-outline-variant/30 bg-surface">
            <div className="p-4 border-b border-outline-variant/30">
              <h2 className="font-headline-md text-headline-md mb-3 font-bold">Trò chuyện</h2>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm transition-colors group-focus-within:text-primary-container" style={{fontVariationSettings: "'FILL' 0"}}>search</span>
                <input className="w-full pl-10 pr-4 py-2 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-primary-container focus:bg-surface-container-lowest text-body-md font-body-md outline-none transition-all shadow-inner" placeholder="Tìm kiếm người dùng..." type="text"/>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto chat-scroll custom-scrollbar">
              {roomsLoading ? (
                <div className="p-4 text-center text-on-surface-variant">Đang tải danh sách chat...</div>
              ) : rooms.length === 0 ? (
                <div className="p-4 text-center text-on-surface-variant">Chưa có tin nhắn nào.</div>
              ) : (
                rooms.map(room => {
                  const isUnread = room.unreadCount > 0;
                  const isActive = activeRoom?.id === room.id;
                  
                  return (
                    <div 
                      key={room.id}
                      onClick={() => setActiveRoom(room)}
                      className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-l-4 ${isActive ? 'bg-primary-fixed-dim/20 border-primary-container hover:bg-primary-fixed-dim/30' : 'hover:bg-surface-container border-transparent border-b border-outline-variant/10'}`}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant/20 shadow-sm bg-surface-container flex items-center justify-center">
                          {room.otherUser?.avatarUrl ? (
                            <img className="w-full h-full object-cover" alt="Avatar" src={room.otherUser.avatarUrl}/>
                          ) : (
                            <span className="material-symbols-outlined text-outline">person</span>
                          )}
                        </div>
                        {isUnread && <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-white rounded-full"></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className={`font-semibold text-on-surface truncate ${isUnread ? 'font-bold' : ''}`}>
                            {room.otherUser?.name || 'Người dùng'}
                          </h4>
                          <span className={`text-[10px] ${isUnread ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                            {formatTime(room.updatedAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className={`text-body-md font-body-md truncate flex-1 ${isUnread ? 'text-on-surface font-semibold' : 'text-on-surface-variant'}`}>
                            {room.lastMessage || 'Bắt đầu trò chuyện'}
                          </p>
                          <div className="w-8 h-8 rounded-md overflow-hidden bg-surface-container flex-shrink-0 border border-outline-variant/20">
                            {room.product?.imageUrls?.[0] ? (
                              <img className="w-full h-full object-cover" alt="Sản phẩm" src={room.product.imageUrls[0]}/>
                            ) : (
                              <span className="material-symbols-outlined text-[16px] m-1">image</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {isUnread && <div className="w-2.5 h-2.5 bg-primary-container rounded-full ml-1 absolute right-4 top-1/2 -translate-y-1/2"></div>}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Column 2: Chat Detail (70%) */}
          {activeRoom ? (
            <section className="hidden md:flex flex-1 flex-col bg-background relative">
              {/* Chat Header: Product Info Pin */}
              <header className="bg-surface border-b border-outline-variant/30 p-3 flex items-center justify-between sticky top-0 z-10 shadow-sm backdrop-blur-md bg-surface/90">
                <Link to={`/product/${activeRoom.product?.id}`} className="flex items-center gap-3 hover:bg-surface-container/50 p-2 rounded-xl transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-outline-variant/30 shadow-sm bg-surface-container">
                    {activeRoom.product?.imageUrls?.[0] && (
                      <img className="w-full h-full object-cover" alt="Product" src={activeRoom.product.imageUrls[0]}/>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-body-lg text-on-surface leading-tight hover:text-primary transition-colors">
                      {activeRoom.product?.name || 'Sản phẩm'}
                    </h3>
                    <p className="font-bold text-primary text-body-md mt-0.5">
                      {new Intl.NumberFormat('vi-VN').format(activeRoom.product?.price || 0)} đ
                    </p>
                  </div>
                </Link>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-secondary text-on-secondary rounded-xl font-bold text-label-sm hover:brightness-110 transition-all flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                    <span className="material-symbols-outlined text-sm">shopping_cart</span> Mua ngay
                  </button>
                  <button className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </div>
              </header>

              {/* Chat Body: Bubble Area */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 chat-scroll custom-scrollbar bg-surface-container-lowest">
                {messages.length === 0 ? (
                  <div className="text-center text-on-surface-variant my-auto">
                    <p>Hãy gửi tin nhắn đầu tiên để hỏi thêm thông tin về sản phẩm nhé.</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMine = Number(msg.senderId) === Number(user.userId);
                    const showDateLabel = index === 0 || formatDate(messages[index - 1].createdAt) !== formatDate(msg.createdAt);
                    
                    return (
                      <React.Fragment key={msg.id}>
                        {showDateLabel && (
                          <div className="flex justify-center my-4">
                            <span className="bg-surface-container-high px-3 py-1 rounded-full text-[10px] text-on-surface-variant uppercase tracking-wider font-bold shadow-sm">
                              {formatDate(msg.createdAt)}
                            </span>
                          </div>
                        )}
                        
                        <div className={`flex items-end gap-3 max-w-[80%] group ${isMine ? 'self-end flex-row-reverse' : ''}`}>
                          {!isMine && (
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow-sm border border-outline-variant/10 bg-surface-container flex items-center justify-center">
                              {activeRoom.otherUser?.avatarUrl ? (
                                <img className="w-full h-full object-cover" alt="Avatar" src={activeRoom.otherUser.avatarUrl}/>
                              ) : (
                                <span className="material-symbols-outlined text-outline text-sm">person</span>
                              )}
                            </div>
                          )}
                          <div className={`${isMine ? 'bg-primary text-on-primary rounded-2xl rounded-br-none shadow-md' : 'bg-surface-container text-on-surface rounded-2xl rounded-bl-none shadow-sm'} p-4 hover:shadow-md transition-shadow`}>
                            {msg.messageType === 'IMAGE' ? (
                              <div className="w-48 sm:w-64 rounded-lg overflow-hidden cursor-pointer" onClick={() => window.open(msg.content, '_blank')}>
                                <img src={msg.content} alt="Đính kèm" className="w-full h-auto object-cover" />
                              </div>
                            ) : msg.messageType === 'LOCATION' ? (
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 font-bold mb-1">
                                  <span className="material-symbols-outlined text-sm">location_on</span>
                                  Vị trí được chia sẻ
                                </div>
                                <a href={msg.content} target="_blank" rel="noreferrer" className={`block px-4 py-2 rounded-lg text-center font-bold text-sm transition-colors ${isMine ? 'bg-white text-primary hover:bg-gray-100' : 'bg-primary text-white hover:bg-primary-hover'}`}>
                                  Mở trên Google Maps
                                </a>
                              </div>
                            ) : (
                              <p className="text-body-md font-body-md break-words whitespace-pre-wrap">{msg.content}</p>
                            )}
                            <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-primary-fixed/70' : 'text-on-surface-variant'}`}>
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Footer: Input Area */}
              <footer className="bg-surface border-t border-outline-variant/30 p-4 pb-6">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-surface-container p-2 rounded-2xl shadow-inner focus-within:ring-2 focus-within:ring-primary-container focus-within:bg-surface-container-lowest transition-all">
                  
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={isUploading} 
                    className={`p-2 rounded-full transition-colors flex items-center justify-center ${isUploading ? 'text-gray-400' : 'text-primary hover:bg-primary-container/20'}`}
                    title="Gửi hình ảnh"
                  >
                    {isUploading ? (
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined">image</span>
                    )}
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={handleSendLocation}
                    className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors flex items-center justify-center"
                    title="Gửi vị trí của bạn"
                  >
                    <span className="material-symbols-outlined">location_on</span>
                  </button>
                  
                  <input 
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-body-md font-body-md py-2 outline-none" 
                    placeholder="Nhập tin nhắn..." 
                    type="text"
                  />
                  <button 
                    type="submit"
                    disabled={!messageInput.trim()}
                    className={`p-3 rounded-xl flex items-center justify-center shadow-md transition-all ${messageInput.trim() ? 'bg-primary-container text-on-primary hover:scale-105 active:scale-95 shadow-[0_4px_12px_rgba(242,101,34,0.3)]' : 'bg-surface-variant text-on-surface-variant cursor-not-allowed'}`}
                  >
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </form>
              </footer>
            </section>
          ) : (
            <section className="hidden md:flex flex-1 flex-col bg-background relative items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] mb-4 text-surface-variant">chat</span>
              <p>Chọn một cuộc trò chuyện để bắt đầu</p>
            </section>
          )}

          {/* Mobile View Fallback/Alternative */}
          {!activeRoom && (
            <section className="flex md:hidden flex-1 flex-col bg-background relative items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[48px] mb-4">chat</span>
                <p>Chọn một cuộc trò chuyện để bắt đầu</p>
            </section>
          )}
        </div>
      </main>
      
      {/* Scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e2e1; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #dcd9d9; }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Chat;
