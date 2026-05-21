import React, { useState } from 'react';
import { X, LogIn, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { API_CONFIG } from '../../config/api';

export default function ChatLoginModal({ isOpen, onClose, onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Vui lòng nhập Tên đăng nhập và Mật khẩu.');
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await fetch(`${API_CONFIG.FASTAPI_BASE_URL}/auth/login/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_name: username.trim(),
          password: password
        }),
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("token_type", data.token_type || "bearer");
        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
        }
        
        toast.success('Đăng nhập thành công!');
        onSuccess(); // Triggers the retry of the pending message
        onClose();
        setUsername('');
        setPassword('');
      } else {
        toast.error(data.detail || 'Sai tài khoản hoặc mật khẩu.');
      }
    } catch (error) {
      toast.error('Lỗi kết nối đến server xác thực. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="bg-amber-100 p-2 rounded-lg">
              <LogIn className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Đăng nhập</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleLogin} className="p-6 space-y-4">
          <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg border border-blue-100 mb-2">
            Nội dung bạn đang hỏi yêu cầu quyền truy cập riêng tư. Vui lòng đăng nhập để tiếp tục.
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập của bạn"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#facb01]/50 focus:border-[#facb01] outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#facb01]/50 focus:border-[#facb01] outline-none transition-all"
              required
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#facb01] hover:bg-[#e8b800] text-gray-900 font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Đăng nhập & Tiếp tục'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
