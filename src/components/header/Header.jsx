// src/components/header/Header.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GraduationCap, Menu, X, User as UserIcon, LogOut, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/Auth";


export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();    
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = location.pathname === "/";
  const isSolidHeader = !isHome || isScrolled;
const scrollToSection = (id) => {
  if (window.location.pathname !== "/") {
    navigate("/", { state: { scrollTo: id } });
    return;
  }

  // Nếu đang ở trang Home thì scroll luôn
  const el = document.getElementById(id);
  if (el) {
    const offset = 80;
    const y = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
};


  const goChatbot = () => {
    navigate("/chatbot");
    setIsMobileMenuOpen(false);
  };

  const goarticles = () => {
    navigate("/articles");
    setIsMobileMenuOpen(false);
  };

  const goLogin = () => {
    navigate("/loginprivate");
    setIsMobileMenuOpen(false);
  };

  const goProfile = () => {
    navigate("/profile");
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  // Lấy initial từ tên/email để hiển thị trong avatar tròn
  const userInitial =
    user?.name?.trim()?.[0] ||
    user?.email?.trim()?.[0] ||
    "U";

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isSolidHeader ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setIsMobileMenuOpen(false);
            }}
          >
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-xl">
              <GraduationCap className={`h-8 w-8 text-white`} />
            </div>
            <div>
              <h1
                className={`text-xl font-bold ${
                  isSolidHeader ? "text-gray-900" : "text-white"
                }`}
              >
                FPT University
              </h1>
              <p
                className={`text-xs ${
                  isSolidHeader ? "text-gray-600" : "text-white/90"
                }`}
              >
                Đại học FPT
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("home")}
              className={`text-sm font-medium transition-colors ${
                isSolidHeader
                  ? "text-gray-700 hover:text-orange-600"
                  : "text-white hover:text-orange-200"
              }`}
            >
              Trang chủ
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className={`text-sm font-medium transition-colors ${
                isSolidHeader
                  ? "text-gray-700 hover:text-orange-600"
                  : "text-white hover:text-orange-200"
              }`}
            >
              Giới thiệu
            </button>
            <button
              onClick={() => scrollToSection("programs")}
              className={`text-sm font-medium transition-colors ${
                isSolidHeader
                  ? "text-gray-700 hover:text-orange-600"
                  : "text-white hover:text-orange-200"
              }`}
            >
              Ngành học
            </button>
            <button
              onClick={() => scrollToSection("admissions")}
              className={`text-sm font-medium transition-colors ${
                isSolidHeader
                  ? "text-gray-700 hover:text-orange-600"
                  : "text-white hover:text-orange-200"
              }`}
            >
              Tuyển sinh
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className={`text-sm font-medium transition-colors ${
                isSolidHeader
              
                  ? "text-gray-700 hover:text-orange-600"
                  : "text-white hover:text-orange-200"
              }`}
            >
              Liên hệ
            </button>

            <button
              onClick={goarticles}
              className={`text-sm font-medium transition-colors ${
                isSolidHeader
                  ? "text-gray-700 hover:text-orange-600"
                  : "text-white hover:text-orange-200"
              }`}
            >
              Báo
            </button>

{!isAuthenticated && (
  <button
    onClick={goChatbot}
    className={`text-sm font-medium transition-colors ${
      isSolidHeader
        ? "text-gray-700 hover:text-orange-600"
        : "text-white hover:text-orange-200"
    }`}
  >
    Chatbot
  </button>
)}

            {/* Right area: nếu chưa login thì hiện CTA, nếu đã login thì hiện avatar user */}
            <div className="flex items-center gap-3 relative">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => scrollToSection("admissions")}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2.5 rounded-full font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    Đăng ký ngay
                  </button>
                  <button
                    onClick={goLogin}
                    className="rounded-full bg-black text-white px-6 py-2.5 font-medium hover:opacity-90 transition"
                  >
                    Đăng nhập
                  </button>
                </>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 shadow-sm hover:shadow-md transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-semibold">
                      {userInitial}
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                      {user?.name || user?.email}
                    </span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-44 rounded-lg bg-white shadow-lg border border-gray-100 py-1 z-50">
                      <button
                        onClick={goProfile}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>Hồ sơ</span>
                      </button>
                      {/* <button
                        onClick={() => navigate('/live-chat')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Live Chat</span>
                      </button> */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X
                className={`h-6 w-6 ${
                  isSolidHeader ? "text-gray-900" : "text-white"
                }`}
              />
            ) : (
              <Menu
                className={`h-6 w-6 ${
                  isSolidHeader ? "text-gray-900" : "text-white"
                }`}
              />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white shadow-lg rounded-b-2xl overflow-hidden">
            <div className="px-4 pt-2 pb-4 space-y-3">
              <button
                onClick={() => scrollToSection("home")}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
              >
                Trang chủ
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
              >
                Giới thiệu
              </button>
              <button
                onClick={() => scrollToSection("programs")}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
              >
                Ngành học
              </button>
              <button
                onClick={() => scrollToSection("admissions")}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
              >
                Tuyển sinh
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
              >
                Liên hệ
              </button>
{!isAuthenticated && (
  <button
    onClick={goChatbot}
    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
  >
    Chatbot
  </button>
)}

              {/* Khu vực Auth ở mobile */}
              {!isAuthenticated ? (
                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => scrollToSection("admissions")}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    Đăng ký ngay
                  </button>
                  <button
                    onClick={goLogin}
                    className="flex-1 bg-black text-white px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-all"
                  >
                    Đăng nhập
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-semibold">
                      {userInitial}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">
                        {user?.name || user?.email}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={goProfile}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => navigate('/live-chat')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                  >
                    Live Chat
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
