// src/components/chatbotguest/ChatEmptyState.jsx
import React from "react";
import ReactMarkdown from "react-markdown";
import { Sparkle } from "lucide-react";
import { resolveAudienceCode } from "../../api/audienceApi.ts";

const AUDIENCE_META = {
  CANBO: { color: "blue", emoji: "👔", label: "Viên chức / Người lao động" },
  SINHVIEN: { color: "green", emoji: "🎓", label: "Sinh viên" },
  PHUHUYNH: { color: "purple", emoji: "👨‍👩‍👦", label: "Phụ huynh / Bên liên quan" },
  TUYENSINH: { color: "orange", emoji: "🗒️", label: "Tuyển sinh" },
};

const COLOR_MAP = {
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
    iconBorder: "border-blue-200",
    iconText: "text-blue-600",
    hoverBorder: "hover:border-blue-400",
    labelText: "text-blue-700",
  },
  green: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    iconBg: "bg-emerald-100",
    iconBorder: "border-emerald-200",
    iconText: "text-emerald-600",
    hoverBorder: "hover:border-emerald-400",
    labelText: "text-emerald-700",
  },
  purple: {
    bg: "bg-violet-50",
    border: "border-violet-200",
    iconBg: "bg-violet-100",
    iconBorder: "border-violet-200",
    iconText: "text-violet-600",
    hoverBorder: "hover:border-violet-400",
    labelText: "text-violet-700",
  },
  orange: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    iconBg: "bg-yellow-100",
    iconBorder: "border-yellow-200",
    iconText: "text-yellow-600",
    hoverBorder: "hover:border-yellow-400",
    labelText: "text-yellow-700",
  },
};

const FALLBACK_COLOR = "blue";

export default function ChatEmptyState({
  onSendMessage,
  suggestions,
  greeting,
  onAudienceChange,
  selectedAudience,
  audiences = [],
}) {
  const items = suggestions || [];

  return (
    <div className="flex flex-col gap-5 w-full pb-28 pr-1 md:pr-2">
      {/* Hero card */}
      <div className="chat-message mt-4 md:mt-8">
        <div className="rounded-3xl border border-border-main/70 bg-[linear-gradient(145deg,rgba(19,91,236,0.08),rgba(19,91,236,0.02)_42%,rgba(255,255,255,0.01)_100%)] px-6 py-7 md:px-8 md:py-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl border border-accent/25 bg-accent/12 text-accent flex items-center justify-center shrink-0">
              <Sparkle size={22} weight="regular" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
                Trợ lý thông minh ĐH GTVT
              </p>
              <h2 className="text-2xl md:text-[30px] font-semibold leading-tight text-text-main mt-1">
                Chọn đối tượng của bạn để bắt đầu
              </h2>
              <p className="text-sm text-text-muted mt-3 max-w-2xl leading-relaxed">
                Hệ thống sẽ cá nhân hóa toàn bộ trải nghiệm dựa trên vai trò của bạn — từ nghiệp vụ, quy chế đào tạo đến các quy định liên quan.
              </p>
            </div>
          </div>

          {/* Audience selection grid */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
            {audiences.map((audience) => {
              const audienceCode = resolveAudienceCode(audience);
              const meta = AUDIENCE_META[audienceCode] || {
                color: FALLBACK_COLOR,
                emoji: "👤",
                label: audience.name,
              };
              const c = COLOR_MAP[meta.color];
              const isSelected = selectedAudience?.id === audience.id;

              return (
                <button
                  key={audience.id}
                  onClick={() => onAudienceChange && onAudienceChange(audience)}
                  className={`role-card group relative rounded-2xl border-2 p-4 text-left transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
                    isSelected
                      ? `!border-accent shadow-md bg-accent/5 scale-[1.01] ring-1 ring-accent/30`
                      : `${c.border} ${c.bg} ${c.hoverBorder} hover:shadow-md opacity-80 hover:opacity-100`
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isSelected ? `bg-accent/10 border-accent/20 scale-110` : `${c.iconBorder} ${c.iconBg} group-hover:scale-110`
                    }`}>
                      <span style={{ fontSize: "22px", lineHeight: 1 }}>{meta.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold uppercase tracking-wide ${c.labelText} leading-tight`}>
                        {meta.label}
                      </p>
                      <p className="text-[12px] text-text-muted mt-1.5 leading-relaxed line-clamp-3">
                        {audience.description}
                      </p>
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className={`w-5 h-5 rounded-full ${c.iconBg} flex items-center justify-center`}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={c.iconText} />
                      </svg>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Greeting card from WebSocket */}
      {greeting && (
        <div className="chat-message">
          <div className="rounded-3xl border border-border-main/70 bg-[linear-gradient(145deg,rgba(19,91,236,0.08),rgba(19,91,236,0.02)_42%,rgba(255,255,255,0.01)_100%)] px-6 py-5 md:px-8 md:py-6 max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
              Trợ lý thông minh ĐH GTVT
            </p>
            <div className="text-sm md:text-[15px] text-text-main mt-3 leading-relaxed prose prose-sm max-w-none">
              <ReactMarkdown>{greeting}</ReactMarkdown>
            </div>
            {items.length > 0 && (
              <div className="mt-5">
                <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                  <Sparkle size={13} className="text-accent" />
                  Câu hỏi gợi ý
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {items.map((btn, i) => (
                    <button
                      key={i}
                      onClick={() => onSendMessage(btn.text)}
                      className="rounded-2xl border border-border-main bg-surface/40 px-3.5 py-2 text-left text-sm text-text-muted transition-all hover:border-accent/40 hover:bg-accent/8 hover:text-text-main"
                    >
                      {btn.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
