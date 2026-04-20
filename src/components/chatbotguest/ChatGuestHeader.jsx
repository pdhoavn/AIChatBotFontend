// src/components/chatbotguest/ChatGuestHeader.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export default function ChatGuestHeader() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-10 w-full border-b bg-white/90 backdrop-blur transition-shadow ${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo + Tên */}
        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={() => navigate("/")}
        >
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-xl">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <div>
            <div className="font-semibold text-[#EB5A0D] leading-tight">
              FPT University
            </div>
            <div className="text-xs text-gray-500 -mt-0.5">Đại học FPT</div>
          </div>
        </div>

        {/* Nút đăng nhập & Đăng ký ngay */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/loginprivate")}
            className="rounded-full bg-black px-4 py-1.5 text-sm text-white hover:opacity-90"
          >
            Đăng nhập
          </button>

          <Link
            to="/#admissions"
            className="rounded-full bg-[#EB5A0D] px-4 py-1.5 text-sm text-white font-medium hover:bg-orange-600 transition"
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </header>
  );
}
