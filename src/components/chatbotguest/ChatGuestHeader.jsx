// src/components/chatbotguest/ChatGuestHeader.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BadgeCheck, GraduationCap, School, Users } from "lucide-react";
import PhIcon from "../ui/PhIcon.jsx";
import { resolveAudienceCode } from "../../api/audienceApi.ts";

const AUDIENCE_LABELS = {
  CANBO: "Viên chức / Người lao động",
  SINHVIEN: "Sinh viên",
  PHUHUYNH: "Phụ huynh / Bên liên quan",
  TUYENSINH: "Tuyển sinh",
};

const AUDIENCE_META = {
  CANBO: { label: "Viên chức / Người lao động", icon: BadgeCheck },
  SINHVIEN: { label: "Sinh viên", icon: School },
  PHUHUYNH: { label: "Phụ huynh / Bên liên quan", icon: Users },
  TUYENSINH: { label: "Tuyển sinh", icon: GraduationCap },
};

export default function ChatGuestHeader({ selectedAudience, onAudienceChange, audiences = [] }) {
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

  const activeAudienceObj = audiences.find((a) => a.id === selectedAudience?.id);
  const activeAudienceCode = resolveAudienceCode(activeAudienceObj || selectedAudience);
  const shouldShowRiasecLink = activeAudienceCode === "TUYENSINH";
  const activeAudienceMeta = activeAudienceCode
    ? AUDIENCE_META[activeAudienceCode] || {
        label: AUDIENCE_LABELS[activeAudienceCode] || activeAudienceObj?.name,
        icon: BadgeCheck,
      }
    : null;
  const ActiveAudienceIcon = activeAudienceMeta?.icon || BadgeCheck;

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
              <ActiveAudienceIcon size={13} className="text-accent" />
              <span className="max-w-[130px] truncate">
                {activeAudienceMeta?.label || "Trợ lý đại học"}
              </span>
              <PhIcon name="expand_more" size={13} className="text-text-muted ml-0.5" />
            </button>
            
            {isMenuOpen && audiences.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-56 rounded-xl border border-border-main/70 bg-sidebar shadow-2xl p-1.5 z-50">
                <div className="px-2 py-1.5 mb-1 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                  Chuyển đổi đối tượng
                </div>
                {audiences.map((audience) => {
                  const audienceCode = resolveAudienceCode(audience);
                  const meta = AUDIENCE_META[audienceCode] || {
                    label: AUDIENCE_LABELS[audienceCode] || audience.name,
                    icon: BadgeCheck,
                  };
                  const AudienceIcon = meta.icon;

                  return (
                    <button
                      key={audience.id}
                      onClick={() => {
                        onAudienceChange && onAudienceChange(audience);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-[12px] flex items-center justify-between transition-colors ${
                        selectedAudience?.id === audience.id ? "bg-accent/12 text-accent" : "text-text-main hover:bg-primary/45"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2 pr-2">
                        <AudienceIcon size={13} className="shrink-0" />
                        <span className="truncate">{meta.label}</span>
                      </span>
                      {selectedAudience?.id === audience.id && <PhIcon name="check" size={13} weight="bold" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <button
            onClick={() => navigate("/loginforad")}
            className="rounded-full bg-black px-4 py-1.5 text-sm text-white hover:opacity-90"
          >
            Đăng nhập
          </button>
          {shouldShowRiasecLink && (
            <Link
              to="/riasec"
              className="riasec-cta-reveal group inline-flex h-9 items-center gap-2 rounded-full border border-[#EB5A0D]/20 bg-[#EB5A0D] px-3 text-white transition hover:bg-[#d95208]"
            >
              <PhIcon name="school" size={15} className="shrink-0" />
              <span className="text-sm font-medium">
                Tìm ngành phù hợp
              </span>
              <span className="hidden rounded-full bg-white/18 px-2 py-0.5 text-[10px] font-medium text-orange-50 md:inline-flex">
                RIASEC 3-5 phút
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
