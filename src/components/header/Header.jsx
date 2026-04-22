// src/components/header/Header.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User as UserIcon, LogOut, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/Auth";


export default function Header({ minimal = false }) {
  const schoolLogoUrl = "https://utc2.edu.vn/images/030820230730_U09Tn.png";
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
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const y = el.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const goChatbot = () => {
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const goarticles = () => {
    navigate("/articles");
    setIsMobileMenuOpen(false);
  };

  const goLogin = () => {
    navigate("/loginforad");
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

  const userInitial =
    user?.name?.trim()?.[0] ||
    user?.email?.trim()?.[0] ||
    "U";

  const navLinkClass = `text-sm font-medium transition-colors ${
    isSolidHeader ? "text-gray-700 hover:text-orange-600" : "text-white hover:text-orange-200"
  }`;

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
              navigate("/");
              window.scrollTo({ top: 0, behavior: "smooth" });
              setIsMobileMenuOpen(false);
            }}
          >
            <img
              src={schoolLogoUrl}
              alt="Logo Trường ĐH Giao thông Vận tải"
              className="h-10 w-10 object-contain"
              loading="eager"
            />
            <div>
              <h1 className={`text-base font-bold ${isSolidHeader ? "text-gray-900" : "text-white"}`}>
                Trường ĐH Giao thông Vận tải
              </h1>
              <p className={`text-[10px] ${isSolidHeader ? "text-gray-600" : "text-white/90"}`}>
                Phân hiệu tại TP. Hồ Chí Minh
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {minimal ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={goLogin}
                  className="rounded-full bg-black text-white px-6 py-2.5 font-medium hover:opacity-90 transition"
                >
                  Đăng nhập
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => scrollToSection("home")} className={navLinkClass}>Trang chủ</button>
                <button onClick={() => scrollToSection("about")} className={navLinkClass}>Giới thiệu</button>
                <button onClick={() => scrollToSection("programs")} className={navLinkClass}>Ngành học</button>
                <button onClick={() => scrollToSection("admissions")} className={navLinkClass}>Tuyển sinh</button>
                <button onClick={() => scrollToSection("contact")} className={navLinkClass}>Liên hệ</button>
                <button onClick={goarticles} className={navLinkClass}>Báo</button>
                {!isAuthenticated && (
                  <button onClick={goChatbot} className={navLinkClass}>Chatbot</button>
                )}

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
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={`h-6 w-6 ${isSolidHeader ? "text-gray-900" : "text-white"}`} />
            ) : (
              <Menu className={`h-6 w-6 ${isSolidHeader ? "text-gray-900" : "text-white"}`} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white shadow-lg rounded-b-2xl overflow-hidden">
            <div className="px-4 pt-2 pb-4 space-y-3">
              {minimal ? (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={goLogin}
                    className="flex-1 bg-black text-white px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-all"
                  >
                    Đăng nhập
                  </button>
                </div>
              ) : (
                <>
                  <button onClick={() => scrollToSection("home")} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">Trang chủ</button>
                  <button onClick={() => scrollToSection("about")} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">Giới thiệu</button>
                  <button onClick={() => scrollToSection("programs")} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">Ngành học</button>
                  <button onClick={() => scrollToSection("admissions")} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">Tuyển sinh</button>
                  <button onClick={() => scrollToSection("contact")} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">Liên hệ</button>
                  {!isAuthenticated && (
                    <button onClick={goChatbot} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">Chatbot</button>
                  )}
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
                        <div className="text-sm font-semibold text-gray-800">{user?.name || user?.email}</div>
                      </div>
                      <button onClick={goProfile} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">Profile</button>
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">Đăng xuất</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
