// src/components/chatbotguest/ChatGuestHeader.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import PhIcon from "../ui/PhIcon.jsx";

export default function ChatGuestHeader({ selectedRole, onRoleChange, roles = [] }) {
  const navigate = useNavigate();
  const schoolLogoUrl = "https://utc2.edu.vn/images/030820230730_U09Tn.png";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeRoleObj = roles.find((r) => r.id === selectedRole);

  return (
    <header className="w-full bg-transparent">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 md:px-7 py-4">
        {/* Logo + Tên */}
        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={() => navigate("/")}
        >
          <img
            src={schoolLogoUrl}
            alt="Logo Trường ĐH Giao thông Vận tải"
            className="h-10 w-10 object-contain"
            loading="eager"
          />
          <div>
            <div className="font-semibold text-[#EB5A0D] leading-tight">
              Trường ĐH Giao thông Vận tải
            </div>
            <div className="text-xs text-chat-text-muted -mt-0.5">Phân hiệu tại TP. Hồ Chí Minh</div>
          </div>
        </div>

        {/* Right side badges */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border-main bg-surface/55 px-2.5 py-1.5 text-[11px] font-medium text-text-main hover:bg-surface transition-colors focus:outline-none"
            >
              <PhIcon name="auto_awesome" size={13} className="text-accent" />
              <span className="max-w-[130px] truncate">
                {activeRoleObj ? activeRoleObj.label : "Trợ lý đại học"}
              </span>
              <PhIcon name="expand_more" size={13} className="text-text-muted ml-0.5" />
            </button>
            
            {isMenuOpen && roles.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-56 rounded-xl border border-border-main/70 bg-sidebar shadow-2xl p-1.5 z-50">
                <div className="px-2 py-1.5 mb-1 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                  Chuyển đổi đối tượng
                </div>
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      onRoleChange && onRoleChange(role);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-[12px] flex items-center justify-between transition-colors ${
                      selectedRole === role.id ? "bg-accent/12 text-accent" : "text-text-main hover:bg-primary/45"
                    }`}
                  >
                    <span>{role.label}</span>
                    {selectedRole === role.id && <PhIcon name="check" size={13} weight="bold" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => navigate("/loginforad")}
            className="rounded-full bg-black px-4 py-1.5 text-sm text-white hover:opacity-90"
          >
            Đăng nhập
          </button>
          <Link
            to="/riasec"
            className="rounded-full bg-[#EB5A0D] px-4 py-1.5 text-sm text-white font-medium hover:bg-orange-600 transition"
          >
            Khảo sát ngay
          </Link>
        </div>
      </div>
    </header>
  );
}
