// src/components/chatbotguest/LawDetailModal.jsx
import React from "react";
import PhIcon from "../ui/PhIcon.jsx";

function parseLawContent(raw) {
  if (!raw || !raw.trim()) return [];

  let text = raw;
  text = text.replace(/(?<=[\.\;\)\s])\s*(\d{1,3})\.\s+(?=[A-ZÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴa-zđ])/g, "\n$1. ");
  text = text.replace(/(?<=[\.\;\:\s])\s*([a-z])\)\s+/g, "\n$1) ");
  text = text.replace(/(?<=.)\s*(Điều\s+\d)/g, "\n$1");

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const segments = [];

  for (const line of lines) {
    if (/^Điều\s+/i.test(line)) {
      segments.push({ type: "title", text: line });
      continue;
    }
    const clauseMatch = line.match(/^(\d{1,3})\.\s+([\s\S]*)/);
    if (clauseMatch) {
      segments.push({ type: "clause", number: clauseMatch[1], text: clauseMatch[2] });
      continue;
    }
    const subMatch = line.match(/^([a-zđ])\)\s+([\s\S]*)/);
    if (subMatch) {
      segments.push({ type: "sub-clause", number: subMatch[1], text: subMatch[2] });
      continue;
    }
    segments.push({ type: "body", text: line });
  }

  return segments;
}

function FormattedLawContent({ content }) {
  const segments = parseLawContent(content);

  if (segments.length === 0) {
    return <p className="text-sm text-text-muted italic">Không có nội dung</p>;
  }

  return (
    <div className="space-y-0">
      {segments.map((seg, i) => {
        switch (seg.type) {
          case "title":
            return (
              <div key={i} className="pb-3 mb-3 border-b border-accent/15">
                <p className="text-[15px] font-black text-text-main leading-snug">
                  {seg.text}
                </p>
              </div>
            );
          case "clause":
            return (
              <div key={i} className="flex gap-2.5 py-2 border-t border-border-main/20 first:border-t-0">
                <span className="shrink-0 w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-xs font-black text-accent">
                  {seg.number}
                </span>
                <p className="text-[13px] text-text-main leading-relaxed flex-1 pt-0.5">
                  {seg.text}
                </p>
              </div>
            );
          case "sub-clause":
            return (
              <div key={i} className="flex gap-2 py-1 ml-9">
                <span className="shrink-0 w-5 h-5 rounded-md bg-surface border border-border-main/60 flex items-center justify-center text-[10px] font-bold text-text-muted mt-0.5">
                  {seg.number}
                </span>
                <p className="text-[13px] text-text-main/85 leading-relaxed flex-1">
                  {seg.text}
                </p>
              </div>
            );
          case "body":
            return (
              <p key={i} className="text-[13px] text-text-main leading-relaxed py-1">
                {seg.text}
              </p>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

export default function LawDetailModal({ isOpen, law, onClose }) {
  if (!isOpen || !law) return null;

  const isLoading = law.content?.includes("Vui lòng chờ");

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border-main w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-border-main/50 flex items-center justify-between bg-primary/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
              <PhIcon name="gavel" size={20} className="text-accent" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-main tracking-tight">
                Chi tiết Điều luật
              </h3>
              <p className="text-[10px] text-text-muted font-medium">LAWSHIELDVN Legal Database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-surface flex items-center justify-center text-text-muted transition-colors border border-transparent hover:border-border-main"
          >
            <PhIcon name="close" size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-4">
            {/* Article name */}
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-accent/10 border border-accent/20 rounded-full">
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest leading-none">
                  Căn cứ pháp lý
                </span>
              </div>
              <h4 className="text-lg font-black text-text-main leading-tight tracking-tight">
                {law.dieu_ten}
              </h4>
            </div>

            {/* Metadata tags */}
            <div className="flex flex-wrap gap-2">
              {law.de_muc && (
                <div className="px-3 py-1.5 bg-primary border border-border-main rounded-xl flex items-center gap-2 shadow-sm">
                  <PhIcon name="bookmark" size={14} className="text-text-muted" />
                  <span className="text-[11px] font-bold text-text-muted">{law.de_muc}</span>
                </div>
              )}
              {law.chuong && (
                <div className="px-3 py-1.5 bg-primary border border-border-main rounded-xl flex items-center gap-2 shadow-sm">
                  <PhIcon name="account_tree" size={14} className="text-text-muted" />
                  <span className="text-[11px] font-bold text-text-muted">{law.chuong}</span>
                </div>
              )}
            </div>

            {/* Formatted content */}
            <div className="p-5 bg-primary/40 rounded-2xl border border-border-main/50 relative">
              {isLoading ? (
                <div className="flex items-center gap-3 py-8 justify-center">
                  <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                  <span className="text-sm text-text-muted font-medium">
                    Đang tải nội dung điều luật...
                  </span>
                </div>
              ) : (
                <FormattedLawContent content={law.content} />
              )}

              <div className="absolute top-4 right-4 opacity-[0.03] pointer-events-none">
                <PhIcon name="balance" size={16} className="text-5xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-sidebar/50 border-t border-border-main/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">
              Nguồn: LAWSHIELDVN Database
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-text-main text-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-black/10"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
