// src/components/chatbotguest/ChatMessageBubble.jsx
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import PhIcon from "../ui/PhIcon.jsx";
import { API_CONFIG } from "../../config/api.js";
import { resolveAudienceCode } from "../../api/audienceApi.ts";

import { Briefcase, GraduationCap, HeartHandshake, ClipboardList } from "lucide-react";

const AUDIENCE_META = {
  CANBO: { color: "blue", icon: Briefcase, label: "Viên chức / Người lao động" },
  SINHVIEN: { color: "green", icon: GraduationCap, label: "Sinh viên" },
  PHUHUYNH: { color: "purple", icon: HeartHandshake, label: "Phụ huynh / Bên liên quan" },
  TUYENSINH: { color: "orange", icon: ClipboardList, label: "Tuyển sinh" },
};

const COLOR_MAP = {
  blue: { bg: "bg-blue-50", border: "border-blue-200", iconBg: "bg-blue-100", iconBorder: "border-blue-200", iconText: "text-blue-600", hoverBorder: "hover:border-blue-400", labelText: "text-blue-700" },
  green: { bg: "bg-emerald-50", border: "border-emerald-200", iconBg: "bg-emerald-100", iconBorder: "border-emerald-200", iconText: "text-emerald-600", hoverBorder: "hover:border-emerald-400", labelText: "text-emerald-700" },
  purple: { bg: "bg-violet-50", border: "border-violet-200", iconBg: "bg-violet-100", iconBorder: "border-violet-200", iconText: "text-violet-600", hoverBorder: "hover:border-violet-400", labelText: "text-violet-700" },
  orange: { bg: "bg-yellow-50", border: "border-yellow-200", iconBg: "bg-yellow-100", iconBorder: "border-yellow-200", iconText: "text-yellow-600", hoverBorder: "hover:border-yellow-400", labelText: "text-yellow-700" },
};

const FALLBACK_COLOR = "blue";

export default function ChatMessageBubble({ message, onLoginClick, isPrivateLoggedIn = false, audiences = [], selectedAudience, onAudienceChange }) {
  const [isCopied, setIsCopied] = useState(false);
  // Fix logic: Lock the excluded audience when this bubble renders, so options don't jump when user clicks one.
  const [excludedAudienceId] = useState(selectedAudience?.id);

  const navigate = useNavigate();
  const isUser = message.sender === "user";
  const isLoginRequired = message.type === "login_required";
  
  let cleanContentStr = message.text || "";
  const hasLawyerSuggestion = cleanContentStr.includes("[SUGGEST_LAWYER]");
  cleanContentStr = cleanContentStr.replace("[SUGGEST_LAWYER]", "");
  
  const hasSetAudience = cleanContentStr.includes("[[user/setaudience]]");
  cleanContentStr = cleanContentStr.replace("[[user/setaudience]]", "").trim();
  
  const cleanContent = cleanContentStr;

  const API_BASE_URL = API_CONFIG.FASTAPI_BASE_URL;

  const sources = Array.isArray(message.sources) ? message.sources : [];

  const citationsByDocId = new Map();
  for (const source of sources) {
    let documentId = null;
    let fileName = null;

    if (typeof source === "number") {
      documentId = source;
    } else if (typeof source === "string") {
      const parsed = Number(source.trim());
      documentId = Number.isFinite(parsed) ? parsed : null;
    } else if (source && typeof source === "object") {
      const rawId = source.document_id ?? source.documentId ?? source.id;
      const parsedId =
        typeof rawId === "number" ? rawId : Number(String(rawId ?? "").trim());
      if (Number.isFinite(parsedId)) {
        documentId = parsedId;
      }

      const rawFileName = source.file_name ?? source.fileName ?? source.name;
      if (typeof rawFileName === "string" && rawFileName.trim()) {
        fileName = rawFileName.trim();
      }
    }

    if (!Number.isInteger(documentId) || documentId <= 0) continue;

    if (!citationsByDocId.has(documentId)) {
      citationsByDocId.set(documentId, {
        documentId,
        fileName: fileName || null,
      });
    }
  }

  const citations = Array.from(citationsByDocId.values());

  // Render đặc biệt cho yêu cầu đăng nhập
  if (isLoginRequired) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-2xl px-5 py-4 bg-surface border border-amber-300/50 shadow-sm rounded-bl-md transition-all duration-300">
          {/* Header bot */}
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border-main/30">
            <div className="w-5 h-5 rounded-md bg-accent/20 flex items-center justify-center">
              <PhIcon name="balance" size={12} className="text-accent" />
            </div>
            <span className="text-[10px] font-bold text-text-muted">
              Trợ lý ảo Phân Hiệu Trường Đại học Giao thông Vận tải tại TP. Hồ Chí Minh
            </span>
          </div>
          {/* Lock icon + message */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <PhIcon name="lock" size={20} className="text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-main mb-1">
                Yêu cầu đăng nhập
              </p>
              <p className="text-sm text-text-muted leading-relaxed">
                {message.text}
              </p>
            </div>
          </div>
          {/* Login button */}
          <button
            onClick={() => onLoginClick ? onLoginClick() : navigate("/loginprivate")}
            className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl transition-all shadow-sm text-sm font-semibold ${
              isPrivateLoggedIn
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-accent text-white hover:bg-accent/90 active:scale-[0.98]"
            }`}
          >
            <PhIcon name={isPrivateLoggedIn ? "check" : "login"} size={16} />
            {isPrivateLoggedIn ? "Đã đăng nhập dữ liệu nội bộ" : "Đăng nhập"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-5 py-3.5 transition-all duration-300 ${
          isUser
            ? "bg-accent text-white rounded-br-md shadow-lg shadow-accent/20"
            : "bg-surface border border-border-main/50 text-text-main rounded-bl-md shadow-sm"
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border-main/30">
            <div className="w-5 h-5 rounded-md bg-accent/20 flex items-center justify-center">
              <PhIcon name="balance" size={12} className="text-accent" />
            </div>
            <span className="text-[10px] font-bold text-text-muted">
              Trợ lý ảo Phân Hiệu Trường Đại học Giao thông Vận tải tại TP. Hồ Chí Minh
            </span>
          </div>
        )}
        <div className="text-sm leading-relaxed">
          {message.text ? (
            isUser ? (
              <span className="whitespace-pre-wrap">{message.text}</span>
            ) : (
              <>
                <div className="prose prose-sm max-w-none text-text-main prose-strong:text-accent prose-a:text-accent prose-headings:text-text-main prose-headings:font-semibold prose-h1:text-[17px] prose-h2:text-[16px] prose-h3:text-[15px] prose-headings:mt-4 prose-headings:mb-2 prose-p:leading-relaxed prose-p:mb-2 prose-ul:my-2 prose-li:my-0.5 prose-code:text-accent">
                  <ReactMarkdown>{cleanContent}</ReactMarkdown>
                </div>
                {hasLawyerSuggestion && (
                  <div className="mt-5 p-4 rounded-xl border border-accent/20 bg-accent/5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shrink-0 shadow-md">
                        <PhIcon name="gavel" size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-text-main">
                          Cần tư vấn chuyên môn sâu hơn?
                        </div>
                        <div className="text-xs text-text-muted mt-0.5">
                          Vấn đề của bạn mang tính rủi ro cao, bạn nên tham vấn trực tiếp chuyên gia thực tế.
                        </div>
                      </div>
                    </div>
                    <a
                      href="/lawyers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-accent text-white hover:bg-accent/90 transition-colors shadow-sm text-sm font-bold"
                    >
                      <PhIcon name="search" size={18} />
                      Tìm Chuyên Gia Ngay
                    </a>
                  </div>
                )}

                {hasSetAudience && audiences.filter(a => a.id !== excludedAudienceId).length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border-main/20">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0 border border-accent/20">
                        <PhIcon name="groups" size={15} />
                      </div>
                      <span className="text-[13px] font-semibold text-text-main">
                        Dạ, nội dung này có thể thuộc phạm vi của nhóm đối tượng khác. Vui lòng chọn lại nhóm phù hợp:
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 sm:pl-9">
                      {audiences.filter(a => a.id !== excludedAudienceId).map((audience) => {
                        const audienceCode = resolveAudienceCode(audience);
                        const meta = AUDIENCE_META[audienceCode] || {
                          color: FALLBACK_COLOR,
                          icon: Briefcase,
                          label: audience.name,
                        };
                        const c = COLOR_MAP[meta.color];
                        const AudienceIcon = meta.icon;
                        const isSelected = selectedAudience?.id === audience.id;
                        
                        return (
                          <button
                            key={audience.id}
                            onClick={() => onAudienceChange && onAudienceChange(audience)}
                            className={`group flex items-center gap-2 rounded-xl border px-3 py-1.5 transition-all ${
                              isSelected 
                                ? "bg-accent text-white border-accent shadow-md ring-2 ring-accent/20 scale-[1.02]" 
                                : `bg-surface/50 ${c.border} ${c.hoverBorder} hover:shadow-sm hover:bg-white`
                            }`}
                          >
                            <div className={`flex items-center justify-center transition-transform group-hover:scale-110 ${isSelected ? "text-white" : c.iconText}`}>
                              <AudienceIcon size={14} strokeWidth={2.5} />
                            </div>
                            <span className={`text-[12px] font-bold ${isSelected ? "text-white" : c.labelText}`}>
                              {meta.label}
                            </span>
                            {isSelected && (
                              <div className="ml-0.5 flex items-center justify-center text-white">
                                <PhIcon name="check" size={14} weight="bold" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {citations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border-main/20">
                    <div className="flex items-center gap-1.5 mb-2">
                      <PhIcon name="menu_book" size={12} className="text-accent" />
                      <span className="text-[11px] font-medium text-text-muted">
                        Tài liệu tham khảo
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {citations.map((citation) => (
                        <div
                          key={citation.documentId}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/8 border border-accent/20 text-accent text-xs font-medium"
                        >
                          <PhIcon name="description" size={12} />
                          {citation.fileName || `Tài liệu #${citation.documentId}`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* COPY BUTTON ROW */}
                {cleanContent && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(cleanContent);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium text-text-muted hover:bg-surface/60 hover:text-text-main transition-all"
                      title="Sao chép tin nhắn"
                    >
                      <PhIcon name={isCopied ? "check" : "content_copy"} size={14} className={isCopied ? "text-emerald-500" : ""} />
                      {isCopied ? <span className="text-emerald-500">Đã lưu vào bộ nhớ tạm</span> : <span>Sao chép</span>}
                    </button>
                  </div>
                )}
              </>
            )
          ) : (
            <span className="inline-flex items-center gap-1.5 text-text-muted">
              <span className="inline-block w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              <span className="inline-block w-1.5 h-1.5 bg-accent rounded-full animate-pulse [animation-delay:150ms]" />
              <span className="inline-block w-1.5 h-1.5 bg-accent rounded-full animate-pulse [animation-delay:300ms]" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
