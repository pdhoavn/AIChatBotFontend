// src/components/chatbotguest/ChatMessageBubble.jsx
import React from "react";
import ReactMarkdown from "react-markdown";
import PhIcon from "../ui/PhIcon.jsx";

export default function ChatMessageBubble({ message }) {
  const isUser = message.sender === "user";
  const hasLawyerSuggestion = message.text?.includes("[SUGGEST_LAWYER]");
  const cleanContent = message.text?.replace("[SUGGEST_LAWYER]", "").trim();

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

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
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              ĐẠI HỌC GTVT BOT
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
                        <a
                          key={citation.documentId}
                          href={`${API_BASE_URL}/knowledge/documents/${citation.documentId}/public-view`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/8 border border-accent/20 text-accent text-xs font-medium hover:bg-accent/15 hover:border-accent/30 transition-colors"
                        >
                          <PhIcon name="description" size={12} />
                          {citation.fileName || `Tài liệu #${citation.documentId}`}
                          <PhIcon name="open_in_new" size={10} />
                        </a>
                      ))}
                    </div>
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
