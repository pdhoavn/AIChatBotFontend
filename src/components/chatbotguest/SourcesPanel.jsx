// src/components/chatbotguest/SourcesPanel.jsx
import React from "react";
import PhIcon from "../ui/PhIcon.jsx";

export function SourcesButton({ sourcesCount, showSources, onToggle }) {
  if (sourcesCount === 0) return null;

  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        showSources
          ? "bg-accent text-white border border-accent/80 shadow-sm shadow-accent/20"
          : "bg-surface/70 border border-border-main/70 text-text-muted hover:text-text-main hover:border-border-main"
      }`}
    >
      <PhIcon name="menu_book" size={14} />
      {sourcesCount} tài liệu dẫn chiếu
    </button>
  );
}

export default function SourcesPanel({ sources, showSources, onClose }) {
  if (!showSources || sources.length === 0) return null;

  return (
    <div className="w-[22rem] max-w-full bg-sidebar/95 backdrop-blur-xl border border-border-main rounded-2xl shadow-2xl p-4 max-h-[68vh] overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h3 className="text-sm font-semibold text-text-main">Nguồn tham khảo</h3>
          <p className="text-[11px] text-text-muted mt-0.5">
            Thông tin được sử dụng để xây dựng phản hồi
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface/60 transition-colors"
        >
          <PhIcon name="close" size={16} />
        </button>
      </div>
      <div className="space-y-2.5">
        {sources.map((source, i) => (
          <div
            key={i}
            className="p-3 bg-surface/65 rounded-xl border border-border-main/65 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="text-xs font-medium text-text-main">{source.dieu_ten}</div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-accent/10 text-accent shrink-0">
                {source.similarity}%
              </span>
            </div>
            <div className="text-[10px] text-text-muted mt-1">
              {source.de_muc} — {source.chuong}
            </div>
            <p className="text-[11px] text-text-muted/90 mt-2 leading-relaxed line-clamp-3">
              {source.content}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-border-main rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${source.similarity}%` }}
                />
              </div>
              <span className="text-[10px] text-text-muted whitespace-nowrap">
                Độ phù hợp
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
