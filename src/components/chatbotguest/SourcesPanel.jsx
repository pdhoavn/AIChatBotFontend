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
      {sourcesCount} trích dẫn
    </button>
  );
}

export default function SourcesPanel({ sources, showSources, onClose }) {
  if (!showSources || sources.length === 0) return null;

  return (
    <div className="w-[22rem] max-w-full bg-sidebar/95 backdrop-blur-xl border border-border-main rounded-2xl shadow-2xl p-4 max-h-[68vh] overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h3 className="text-sm font-semibold text-text-main">Trích dẫn</h3>
          <p className="text-[11px] text-text-muted mt-0.5">
            Chọn trích dẫn để mở tài liệu ở tab mới
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface/60 transition-colors"
        >
          <PhIcon name="close" size={16} />
        </button>
      </div>
      <div className="space-y-2">
        {sources.map((source) => (
          <a
            key={source.documentId}
            href={source.viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-surface/65 rounded-xl border border-border-main/65 transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-medium text-text-main">
                Trích dẫn #{source.documentId}
              </div>
              <span className="text-[11px] font-medium px-2 py-1 rounded-lg bg-accent/10 text-accent transition-colors">
                Mở tab mới
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
