// src/components/chatbotguest/ChatInput.jsx
import React, { useRef, useState, useEffect } from "react";
import PhIcon from "../ui/PhIcon.jsx";

const DOMAINS = [
  // 1. Viên chức / Người lao động (officer)
  { id: "khoa-hoc-cong-nghe", label: "Khoa học công nghệ", roles: ["officer"] },
  { id: "hop-tac-doi-ngoai", label: "Hợp tác đối ngoại", roles: ["officer"] },
  { id: "luong-chinh-sach", label: "Lương - chính sách", roles: ["officer"] },
  { id: "quy-dinh-noi-bo", label: "Quy định nội bộ", roles: ["officer"] },
  { id: "chinh-sach-nhan-su", label: "Chính sách nhân sự", roles: ["officer"] },
  { id: "thue-tncn", label: "Thuế TNCN", roles: ["officer"] },
  { id: "dam-bao-chat-luong", label: "Đảm bảo chất lượng", roles: ["officer"] },
  { id: "khao-sat-y-kien", label: "Khảo sát ý kiến nội bộ", roles: ["officer"] },
  { id: "khao-thi-giang-vien", label: "Khảo thí giảng viên", roles: ["officer"] },

  // 2. Sinh viên (student)
  { id: "cong-tac-chinh-tri-sv", label: "Công tác chính trị sinh viên", roles: ["student"] },
  { id: "dao-tao-sinh-vien", label: "Đào tạo sinh viên", roles: ["student"] },
  { id: "noi-tru-ktx", label: "Nội trú KTX", roles: ["student"] },
  { id: "khao-thi-sinh-vien", label: "Khảo thí sinh viên", roles: ["student"] },
  { id: "khao-sat-nguoi-hoc", label: "Khảo sát người học", roles: ["student"] },

  // 3. Phụ huynh / Doanh nghiệp (parent)
  { id: "khao-sat-cac-ben", label: "Khảo sát các bên liên quan", roles: ["parent"] },

  // Mặc định (cho tất cả)
  { id: "chung", label: "Chung (Mặc định)", roles: ["all"] },
  { id: "tuyen-sinh", label: "Tuyển sinh", roles: ["all"] },
  { id: "cac-quyet-dinh", label: "Các quyết định", roles: ["all"] },
  { id: "hop-dong", label: "Hợp đồng", roles: ["all"] },
  { id: "dau-tu-cong", label: "Đầu tư công", roles: ["all"] },
];

export default function ChatInput({ input, isLoading, wsReady, onInputChange, onSubmit, onOpenCall, selectedRole }) {
  const textareaRef = useRef(null);
  const wrapperRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [isToolMenuOpen, setIsToolMenuOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const isExpanded = isFocused || !!input.trim() || !!attachedFile || isLoading;

  const availableOptions = DOMAINS.filter(
    (d) => d.roles.includes("all") || (selectedRole && d.roles.includes(selectedRole))
  );

  useEffect(() => {
    if (!isToolMenuOpen && !isFocused) return;
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsToolMenuOpen(false);
        if (!input.trim() && !attachedFile) {
          setIsFocused(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isToolMenuOpen, isFocused, input, attachedFile]);

  const handleFileSelect = async (file) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx", "txt"].includes(ext || "")) {
      alert("Chỉ hỗ trợ file PDF, DOCX, TXT");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File quá lớn. Giới hạn 10MB.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/chat/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload thất bại" }));
        alert(err.error || "Không thể đọc file");
        return;
      }
      const data = await res.json();
      setAttachedFile({ name: data.fileName || file.name, text: data.text || "", type: ext });
    } catch {
      alert("Lỗi khi upload file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() && !attachedFile) return;
    if (!wsReady) return;

    const fileContent = attachedFile ? attachedFile.text : null;
    onSubmit(fileContent);
    setAttachedFile(null);
    setIsToolMenuOpen(false);
    setSelectedTool(null);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div
      ref={wrapperRef}
      className={`pt-0 mx-auto transition-all duration-300 ease-out w-full pointer-events-auto ${
        isExpanded ? "max-w-5xl" : "max-w-md"
      }`}
    >
      <form
        onSubmit={handleSubmit}
        onBlur={(e) => {
          if (wrapperRef.current?.contains(e.relatedTarget)) return;
          setTimeout(() => {
            if (!input.trim() && !attachedFile && !isToolMenuOpen) {
              setIsFocused(false);
            }
          }, 150);
        }}
      >
        <div
          className={`rounded-2xl relative overflow-visible transition-all duration-300 ease-out bg-sidebar ${
            isExpanded
              ? "p-2.5 md:p-3 border border-accent/30 shadow-[0_-4px_24px_-4px_rgba(19,91,236,0.12),0_4px_16px_-4px_rgba(0,0,0,0.1)]"
              : "p-1.5 md:p-2 border border-border-main/50 hover:border-border-main/80 shadow-[0_-2px_12px_-2px_rgba(0,0,0,0.08)]"
          }`}
          onClick={() => !isFocused && setIsFocused(true)}
        >
          {/* Attached file badge */}
          {attachedFile && (
            <div className="mx-2 md:mx-3 mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/8 border border-accent/20">
              {attachedFile.type === "pdf" ? (
                <PhIcon name="picture_as_pdf" size={16} className="text-accent" />
              ) : attachedFile.type === "docx" ? (
                <PhIcon name="article" size={16} className="text-accent" />
              ) : (
                <PhIcon name="text_snippet" size={16} className="text-accent" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-text-main truncate">
                  {attachedFile.name}
                </div>
                <div className="text-[10px] text-text-muted">
                  Sẵn sàng gửi
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAttachedFile(null);
                }}
                className="w-5 h-5 rounded-md hover:bg-red-500/10 flex items-center justify-center text-text-muted hover:text-red-400 transition-colors"
              >
                <PhIcon name="close" size={14} />
              </button>
            </div>
          )}

          {/* Uploading indicator */}
          {isUploading && (
            <div className="mx-2 md:mx-3 mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/50 border border-border-main/70">
              <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              <span className="text-[11px] text-text-muted">Đang trích xuất nội dung file...</span>
            </div>
          )}

          <div
            className={`flex items-center gap-2 transition-all duration-300 ease-out ${
              isExpanded ? "px-2 md:px-3 pt-2.5 pb-1.5" : "px-2 md:px-2 py-0.5"
            }`}
          >
            {/* Action buttons — only visible when expanded */}
            <div
              className={`flex items-center gap-2 transition-all duration-300 ease-out overflow-hidden shrink-0 ${
                isExpanded ? "max-w-[300px] opacity-100" : "max-w-0 opacity-0"
              }`}
            >
              <button
                type="button"
                title="Đính kèm tệp"
                aria-label="Đính kèm tệp"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isLoading}
                className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full border border-border-main/60 text-text-muted hover:text-accent hover:border-accent/30 hover:bg-accent/10 transition-colors disabled:opacity-40"
              >
                <PhIcon name="attach_file" size={15} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />

              <button
                type="button"
                title="Trao đổi giọng nói"
                aria-label="Trao đổi giọng nói"
                onMouseDown={(e) => e.preventDefault()}
                onClick={onOpenCall}
                disabled={isLoading || isUploading}
                className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full border border-border-main/60 text-text-muted hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-colors disabled:opacity-40"
              >
                <PhIcon name="mic" size={15} />
              </button>

              <div className="relative shrink-0">
                <button
                  type="button"
                  title="Chọn lĩnh vực tra cứu"
                  aria-label="Chọn lĩnh vực tra cứu"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setIsToolMenuOpen((prev) => !prev)}
                  disabled={isLoading || isUploading}
                  className={`h-9 px-2.5 shrink-0 inline-flex items-center gap-1.5 rounded-full border transition-colors disabled:opacity-40 ${
                    selectedTool
                      ? "border-accent/40 bg-accent/10 text-accent"
                      : "border-border-main/60 text-text-muted hover:text-text-main hover:bg-primary/50"
                  }`}
                >
                  <PhIcon name="database" size={14} />
                  <span className="text-[11px] max-w-[92px] truncate">
                    {selectedTool
                      ? DOMAINS.find((t) => t.id === selectedTool)?.label
                      : "Lĩnh vực"}
                  </span>
                  <PhIcon name="expand_more" size={11} />
                </button>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              className={`flex-1 min-w-0 bg-transparent border-none outline-none text-text-main placeholder-text-muted/95 focus:ring-0 p-0 transition-all duration-300 resize-none overflow-y-auto ${
                isExpanded ? "text-[15px] md:text-base" : "text-[14px] md:text-[15px]"
              }`}
              placeholder={
                attachedFile
                  ? "Bạn muốn mình hỗ trợ gì với tài liệu này?"
                  : isExpanded
                  ? "Nêu vấn đề theo cách của bạn..."
                  : "Nhập câu hỏi..."
              }
              rows={1}
              value={input}
              onChange={(e) => {
                onInputChange(e.target.value);
                const el = textareaRef.current;
                if (el) {
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 160) + "px";
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              onFocus={() => setIsFocused(true)}
              disabled={isLoading || isUploading}
            />

            {/* Loading spinner */}
            {isLoading && (
              <div className="shrink-0">
                <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              </div>
            )}

            {/* Send button */}
            <button
              type="submit"
              disabled={isLoading || isUploading || (!input.trim() && !attachedFile) || !wsReady}
              className={`shrink-0 rounded-full bg-accent text-white flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-35 disabled:cursor-not-allowed shadow-[0_10px_22px_-14px_rgba(19,91,236,0.8)] ${
                isExpanded ? "w-9 h-9" : "w-8 h-8"
              }`}
            >
              <PhIcon name="arrow_upward" size={isExpanded ? 17 : 15} weight="bold" />
            </button>
          </div>

          {/* Tool dropdown */}
          {isToolMenuOpen && (
            <div className="absolute bottom-full left-2 md:left-3 z-30 pb-2">
              <div className="w-56 overflow-y-auto max-h-[320px] rounded-xl border border-border-main/70 bg-sidebar shadow-2xl p-1.5 scrollbar-thin scrollbar-thumb-border-main scrollbar-track-transparent">
                {availableOptions.map((tool) => {
                  const active = selectedTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSelectedTool(tool.id);
                        setIsToolMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-[12px] flex items-center justify-between transition-colors ${
                        active
                          ? "bg-accent/12 text-accent"
                          : "text-text-main hover:bg-primary/45"
                      }`}
                    >
                      <span className="truncate pr-2">{tool.label}</span>
                      {active && <PhIcon name="check" size={13} weight="bold" className="shrink-0" />}
                    </button>
                  );
                })}
                {selectedTool && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSelectedTool(null);
                      setIsToolMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 mt-1 border-t border-border-main/50 rounded-lg text-[11px] text-text-muted hover:text-text-main hover:bg-primary/45 transition-colors"
                  >
                    Bỏ chọn lĩnh vực (All)
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
