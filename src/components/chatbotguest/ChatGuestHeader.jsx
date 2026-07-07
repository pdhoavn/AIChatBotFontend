// src/components/chatbotguest/ChatGuestHeader.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Briefcase, GraduationCap, HeartHandshake, ClipboardList, Menu, X, Building2 } from "lucide-react";
import PhIcon from "../ui/PhIcon.jsx";
import { resolveAudienceCode } from "../../api/audienceApi.ts";
import { getRoleFromToken } from "../../pages/login/jwtHelper";

const AUDIENCE_LABELS = {
  CANBO: "Viên chức / Người lao động",
  SINHVIEN: "Sinh viên",
  PHUHUYNH: "Phụ huynh / Bên liên quan",
  TUYENSINH: "Tuyển sinh",
};
const UNIT_OPTIONS = [
  { code: "UTC", label: "UTC" },
  { code: "UTC2", label: "UTC2" },
];
const AUDIENCE_META = {
  CANBO: { label: "Viên chức / Người lao động", icon: Briefcase },
  SINHVIEN: { label: "Sinh viên", icon: GraduationCap },
  PHUHUYNH: { label: "Phụ huynh / Bên liên quan", icon: HeartHandshake },
  TUYENSINH: { label: "Tuyển sinh", icon: ClipboardList },
};

function getAudienceMeta(audience) {
  const audienceCode = resolveAudienceCode(audience);
  return (
    AUDIENCE_META[audienceCode] || {
      label: AUDIENCE_LABELS[audienceCode] || audience.name,
      icon: Briefcase,
    }
  );
}

export default function ChatGuestHeader({
  selectedAudience,
  onAudienceChange,
  audiences = [],
  selectedUnit,      
  onUnitChange,      
  isChatPrivateLoggedIn = false,
  onChatPrivateLogout,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const schoolLogoUrl = "https://utc2.edu.vn/images/030820230730_U09Tn.png";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAudienceOpen, setIsAudienceOpen] = useState(false);
  const [isUnitOpen, setIsUnitOpen] = useState(false);
  const desktopUnitMenuRef = useRef(null)
  const desktopMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("access_token"));

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  useEffect(() => {
    const checkToken = () => setIsLoggedIn(!!localStorage.getItem("access_token"));
    checkToken();
    window.addEventListener("storage", checkToken);
    const interval = setInterval(checkToken, 1000);
    return () => {
      window.removeEventListener("storage", checkToken);
      clearInterval(interval);
    };
  }, []);

  const getDefaultRouteFromToken = () => {
    const token = localStorage.getItem("access_token");
    const role = getRoleFromToken(token);
    const normalizedRole = typeof role === "string" ? role.toLowerCase() : "";

    if (normalizedRole === "admin" || normalizedRole === "system_admin") {
      return "/admin/dashboard";
    }
    if (normalizedRole === "content_manager" || normalizedRole === "content manager" || normalizedRole === "content") {
      return "/content/dashboard";
    }
    if (normalizedRole === "consultant") {
      return "/consultant";
    }
    if (normalizedRole === "admission_officer" || normalizedRole === "admission official" || normalizedRole === "officer") {
      return "/admission/students";
    }

    return "/profile";
  };

  const handleAuthenticatedNavigate = () => {
    closeMobileMenu();
    navigate(getDefaultRouteFromToken());
  };

  const handleAudienceSelect = (audience) => {
    onAudienceChange?.(audience);
    setIsAudienceOpen(false);
    closeMobileMenu();
  };
  const handleUnitSelect = (unit) => {
  onUnitChange?.(unit.code);
  setIsUnitOpen(false);
  closeMobileMenu();
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (desktopMenuRef.current && !desktopMenuRef.current.contains(e.target)) {
        setIsAudienceOpen(false);
      }
      if (desktopUnitMenuRef.current && !desktopUnitMenuRef.current.contains(e.target)) {
      setIsUnitOpen(false);           
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        closeMobileMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeMobileMenu]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeMobileMenu();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMobileMenuOpen, closeMobileMenu]);

  useEffect(() => {
    closeMobileMenu();
    setIsAudienceOpen(false);
    setIsUnitOpen(false);
  }, [location.pathname, closeMobileMenu]);

  const activeAudienceObj = audiences.find((a) => a.id === selectedAudience?.id);
  const activeUnit = UNIT_OPTIONS.find((u) => u.code === selectedUnit) || null;
  const activeAudienceCode = resolveAudienceCode(activeAudienceObj || selectedAudience);
  const shouldShowRiasecLink = activeAudienceCode === "TUYENSINH";
  const activeAudienceMeta = activeAudienceCode
    ? AUDIENCE_META[activeAudienceCode] || {
        label: AUDIENCE_LABELS[activeAudienceCode] || activeAudienceObj?.name,
        icon: Briefcase,
      }
    : null;
  const ActiveAudienceIcon = activeAudienceMeta?.icon || Briefcase;

  const handleLogoClick = (event) => {
    closeMobileMenu();
    if (location.pathname === "/") {
      event.preventDefault();
      window.location.reload();
      return;
    }
    navigate("/");
  };

  const audienceList = (
    <>
      <div className="px-1 py-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-[0.16em]">
        Chuyển đổi đối tượng
      </div>
      {audiences.length === 0 ? (
        <p className="px-2.5 py-2 text-[12px] text-text-muted">Đang tải danh sách đối tượng...</p>
      ) : (
        audiences.map((audience) => {
          const meta = getAudienceMeta(audience);
          const AudienceIcon = meta.icon;
          const isSelected = selectedAudience?.id === audience.id;

          return (
            <button
              key={audience.id}
              type="button"
              onClick={() => handleAudienceSelect(audience)}
              className={`w-full text-left px-2.5 py-2.5 rounded-lg text-[12px] flex items-center justify-between transition-colors ${
                isSelected ? "bg-accent/12 text-accent" : "text-text-main hover:bg-primary/45"
              }`}
            >
              <span className="flex min-w-0 items-center gap-2 pr-2">
                <AudienceIcon size={14} className="shrink-0" />
                <span>{meta.label}</span>
              </span>
              {isSelected && <PhIcon name="check" size={13} weight="bold" className="shrink-0" />}
            </button>
          );
        })
      )}
    </>
  );
  const unitList = (
    <>
      <div className="px-1 py-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-[0.16em]">
        Chọn đơn vị
      </div>
      {UNIT_OPTIONS.map((unit) => {
        const isSelected = selectedUnit === unit.code;
        return (
          <button
            key={unit.code}
            type="button"
            onClick={() => handleUnitSelect(unit)}
            className={`w-full text-left px-2.5 py-2.5 rounded-lg text-[12px] flex items-center justify-between transition-colors ${
              isSelected ? "bg-accent/12 text-accent" : "text-text-main hover:bg-primary/45"
            }`}
          >
            <span className="flex min-w-0 items-center gap-2 pr-2">
              <Building2 size={14} className="shrink-0" />
              <span>{unit.label}</span>
            </span>
            {isSelected && <PhIcon name="check" size={13} weight="bold" className="shrink-0" />}
          </button>
        );
      })}
    </>
  );
  return (
    <header className="relative z-50 w-full min-w-0 shrink-0 bg-transparent overflow-visible text-text-main font-display antialiased">
      <div className="mx-auto flex w-full min-w-0 max-w-5xl items-center justify-between gap-2 sm:gap-4 px-3 py-3 sm:px-4 sm:py-4 md:px-7 overflow-visible">
        <Link
          to="/"
          className="flex min-w-0 cursor-pointer items-center gap-2 sm:gap-3 shrink-0"
          onClick={handleLogoClick}
        >
          <img
            src={schoolLogoUrl}
            alt="Logo Trường ĐH Giao thông Vận tải"
            className="h-9 w-9 sm:h-10 sm:w-10 object-contain shrink-0"
            loading="eager"
          />
          <div className="hidden min-[420px]:block md:block min-w-0">
            <div className="text-sm sm:text-base font-semibold text-[#facb01] leading-tight truncate max-w-[9rem] min-[420px]:max-w-[10rem] md:max-w-none">
              Trường ĐH Giao thông Vận tải
            </div>
            <div className="text-[10px] sm:text-xs text-text-muted -mt-0.5 truncate max-w-[9rem] min-[420px]:max-w-[10rem] md:max-w-none">
              Phân hiệu tại TP. Hồ Chí Minh
            </div>
          </div>
        </Link>

        {/* Mobile: hamburger */}
        <div className="md:hidden" ref={mobileMenuRef}>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={isMobileMenuOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border-main bg-surface/55 text-text-main hover:bg-surface transition-colors"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {isMobileMenuOpen && (
            <>
              <button
                type="button"
                aria-label="Đóng menu"
                className="fixed inset-0 z-[45] bg-black/25 md:hidden"
                onClick={closeMobileMenu}
              />
              <div className="absolute right-0 left-0 top-[calc(100%+0.25rem)] z-[60] max-h-[min(75dvh,calc(100dvh-5rem))] overflow-y-auto rounded-2xl border border-border-main/70 bg-sidebar shadow-2xl p-3 md:hidden">
                <section className="mb-3 rounded-xl border border-border-main/50 bg-surface/30 p-1.5">
                  {audienceList}
                </section>
                <section className="mb-3 rounded-xl border border-border-main/50 bg-surface/30 p-1.5">
                  {unitList}
                </section>
                <div className="space-y-2">
                  {isLoggedIn ? (
                    <button
                      type="button"
                      onClick={handleAuthenticatedNavigate}
                      className="w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm text-white hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <PhIcon name="user" size={16} />
                      Vào quản trị
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        closeMobileMenu();
                        navigate("/loginforad");
                      }}
                      className="w-full rounded-xl bg-black px-4 py-2.5 text-sm text-white hover:opacity-90"
                    >
                      Đăng nhập
                    </button>
                  )}

                  {isChatPrivateLoggedIn && (
                    <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-white/95 px-3 py-2 text-sm text-emerald-700">
                      <span className="inline-flex items-center gap-2 font-medium">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Dữ liệu nội bộ
                      </span>
                      {onChatPrivateLogout && (
                        <button
                          type="button"
                          onClick={() => {
                            onChatPrivateLogout();
                            closeMobileMenu();
                          }}
                          className="rounded-lg px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50"
                        >
                          Đăng xuất
                        </button>
                      )}
                    </div>
                  )}

                  {shouldShowRiasecLink && (
                    <Link
                      to="/riasec"
                      onClick={closeMobileMenu}
                      className="riasec-cta-reveal flex w-full items-center justify-center gap-2 rounded-xl bg-[#facb01] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#d95208]"
                    >
                      <PhIcon name="school" size={16} />
                      Tìm ngành (RIASEC)
                    </Link>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Desktop: inline controls */}
        <div className="hidden md:flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
          <div className="relative flex min-w-0 items-center gap-2" ref={desktopMenuRef}>
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.16em] shrink-0">
              Đối tượng
            </span>
            <button
              type="button"
              onClick={() => setIsAudienceOpen((open) => !open)}
              aria-label="Chọn đối tượng tra cứu"
              title={activeAudienceMeta?.label || "Trợ lý đại học"}
              className="inline-flex min-w-0 max-w-[130px] items-center gap-1.5 rounded-xl border border-border-main bg-surface/55 px-2.5 py-1.5 text-[11px] font-medium text-text-main hover:bg-surface transition-colors focus:outline-none"
            >
              <ActiveAudienceIcon size={13} className="text-accent shrink-0" />
              <span className="min-w-0 truncate">{activeAudienceMeta?.label || "Trợ lý đại học"}</span>
              <PhIcon name="expand_more" size={13} className="text-text-muted ml-0.5 shrink-0" />
            </button>

            {isAudienceOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 max-h-[min(18rem,calc(100dvh-6rem))] overflow-y-auto rounded-xl border border-border-main/70 bg-sidebar shadow-2xl p-1.5 z-[60]">
                {audienceList}
              </div>
            )}
          </div>
          <div className="relative flex min-w-0 items-center gap-2" ref={desktopUnitMenuRef}>
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.16em] shrink-0">
              Đơn vị
            </span>
            <button
              type="button"
              onClick={() => setIsUnitOpen((open) => !open)}
              aria-label="Chọn đơn vị"
              title={activeUnit?.label || "Chọn đơn vị"}
              className="inline-flex min-w-0 max-w-[110px] items-center gap-1.5 rounded-xl border border-border-main bg-surface/55 px-2.5 py-1.5 text-[11px] font-medium text-text-main hover:bg-surface transition-colors focus:outline-none"
            >
              <Building2 size={13} className="text-accent shrink-0" />
              <span className="min-w-0 truncate">{activeUnit?.label || "Chọn đơn vị"}</span>
              <PhIcon name="expand_more" size={13} className="text-text-muted ml-0.5 shrink-0" />
            </button>

            {isUnitOpen && (
              <div className="absolute top-full right-0 mt-2 w-44 rounded-xl border border-border-main/70 bg-sidebar shadow-2xl p-1.5 z-[60]">
                {unitList}
              </div>
            )}
          </div>
          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleAuthenticatedNavigate}
              className="rounded-full bg-green-600 px-4 py-1.5 text-sm text-white hover:bg-green-700 flex items-center gap-1.5 shrink-0"
            >
              <PhIcon name="user" size={14} />
              Vào quản trị
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/loginforad")}
              className="rounded-full bg-black px-4 py-1.5 text-sm text-white hover:opacity-90 whitespace-nowrap shrink-0"
            >
              Đăng nhập
            </button>
          )}

          {isChatPrivateLoggedIn && (
            <div
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/95 pl-2.5 pr-1 py-1 text-xs text-emerald-700 shadow-sm shrink-0"
              title="Đã đăng nhập dữ liệu nội bộ"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-medium">Dữ liệu nội bộ</span>
              {onChatPrivateLogout && (
                <button
                  type="button"
                  onClick={onChatPrivateLogout}
                  title="Đăng xuất"
                  aria-label="Đăng xuất dữ liệu nội bộ"
                  className="rounded-full p-1 hover:bg-emerald-50 text-emerald-600 transition-colors flex items-center justify-center"
                >
                  <PhIcon name="logout" size={14} />
                </button>
              )}
            </div>
          )}

          {shouldShowRiasecLink && (
            <Link
              to="/riasec"
              className="riasec-cta-reveal group inline-flex h-8 items-center gap-1.5 rounded-full bg-[#facb01] px-3 text-white transition hover:bg-[#d95208] shadow-sm shrink-0"
            >
              <PhIcon name="school" size={14} className="shrink-0" />
              <span className="text-xs font-medium">Tìm ngành</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
