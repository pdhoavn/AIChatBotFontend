// src/components/chatbotguest/ChatInput.jsx
import React, { useRef, useState, useEffect } from "react";
import PhIcon from "../ui/PhIcon.jsx";

export default function ChatInput({
  input,
  isLoading,
  wsReady,
  onInputChange,
  onSubmit,
  onOpenCall,
  selectedAudience,
  selectedIntent,
  onIntentChange,
  intents = [],
  isListening = false,
  transcript = "",
  onMicClick,
  onMicStop,
  onTranscriptConfirm,
  onStop,
}) {
  const textareaRef = useRef(null);
  const wrapperRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isToolMenuOpen, setIsToolMenuOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const isExpanded = isFocused || !!input.trim() || !!attachedFile || isLoading;

  const availableIntents = selectedAudience
    ? intents.filter((i) => i.target_audience_id === selectedAudience.id)
    : [];

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
    onSubmit(fileContent, selectedIntent?.intent_id || null);
    setAttachedFile(null);
    setIsToolMenuOpen(false);
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

          {/* Live transcript banner */}
          {isListening && (
            <div className="mx-2 md:mx-3 mb-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-400/30">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse shrink-0" />
              <span className="flex-1 text-[12px] text-red-300 italic min-w-0 truncate">
                {transcript || "Đang nghe..."}
              </span>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onTranscriptConfirm?.();
                }}
                className="shrink-0 px-2 py-0.5 rounded-full bg-red-400/20 hover:bg-red-400/30 text-[11px] text-red-300 font-medium transition-colors"
              >
                Gửi
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onMicStop?.();
                }}
                className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-400/20 transition-colors"
              >
                <PhIcon name="close" size={12} className="text-red-300" />
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
                title={isListening ? "Dừng ghi âm" : "Trao đổi giọng nói"}
                aria-label={isListening ? "Dừng ghi âm" : "Trao đổi giọng nói"}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (isListening) {
                    onMicStop?.();
                  } else {
                    onMicClick?.();
                  }
                }}
                disabled={isLoading || isUploading}
                className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-full border transition-all disabled:opacity-40 ${
                  isListening
                    ? "border-red-400/50 bg-red-500/15 text-red-400 animate-pulse"
                    : "border-border-main/60 text-text-muted hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10"
                }`}
              >
                <PhIcon
                  name={isListening ? "call_end" : "mic"}
                  size={15}
                  className={isListening ? "text-red-400" : ""}
                />
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
                    selectedIntent
                      ? "border-accent/40 bg-accent/10 text-accent"
                      : "border-border-main/60 text-text-muted hover:text-text-main hover:bg-primary/50"
                  }`}
                >
                  <PhIcon name="database" size={14} />
                  <span className="text-[11px] max-w-[92px] truncate">
                    {selectedIntent ? selectedIntent.intent_name : "Lĩnh vực"}
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
              value={isListening ? transcript : input}
              onChange={(e) => {
                if (!isListening) onInputChange(e.target.value);
                const el = textareaRef.current;
                if (el) {
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 160) + "px";
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (isListening) {
                    onTranscriptConfirm?.();
                  } else {
                    handleSubmit(e);
                  }
                }
              }}
              onFocus={() => setIsFocused(true)}
              disabled={isLoading || isUploading}
            />

            {/* Send / Stop button */}
            {isLoading ? (
              <button
                type="button"
                title="Dừng phản hồi"
                onClick={onStop}
                className={`shrink-0 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-[0_10px_22px_-14px_rgba(239,68,68,0.8)] ${
                  isExpanded ? "w-9 h-9" : "w-8 h-8"
                }`}
              >
                <PhIcon name="stop" size={isExpanded ? 15 : 13} weight="fill" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isUploading || (!input.trim() && !attachedFile) || !wsReady}
                className={`shrink-0 rounded-full bg-accent text-white flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-35 disabled:cursor-not-allowed shadow-[0_10px_22px_-14px_rgba(19,91,236,0.8)] ${
                  isExpanded ? "w-9 h-9" : "w-8 h-8"
                }`}
              >
                <PhIcon name="arrow_upward" size={isExpanded ? 17 : 15} weight="bold" />
              </button>
            )}
          </div>

          {/* Intent dropdown */}
          {isToolMenuOpen && (
            <div className="absolute bottom-full left-2 md:left-3 z-30 pb-2">
              <div className="w-56 overflow-y-auto max-h-[320px] rounded-xl border border-border-main/70 bg-sidebar shadow-2xl p-1.5 scrollbar-thin scrollbar-thumb-border-main scrollbar-track-transparent">
                {availableIntents.map((intent) => {
                  const active = selectedIntent?.intent_id === intent.intent_id;
                  return (
                    <button
                      key={intent.intent_id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        onIntentChange(intent);
                        setIsToolMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-[12px] flex items-center justify-between transition-colors ${
                        active
                          ? "bg-accent/12 text-accent"
                          : "text-text-main hover:bg-primary/45"
                      }`}
                    >
                      <span className="truncate pr-2">{intent.intent_name}</span>
                      {active && <PhIcon name="check" size={13} weight="bold" className="shrink-0" />}
                    </button>
                  );
                })}
                {selectedIntent && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onIntentChange(null);
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
