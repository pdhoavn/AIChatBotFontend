import React, { useEffect, useRef, useState } from "react";
import ChatGuestHeader from "../../components/chatbotguest/ChatGuestHeader.jsx";
import { API_CONFIG } from "../../config/api.js";
import ReactMarkdown from "react-markdown";

const CHATBOT_PREFILL_KEY = "chatbot_prefill_message";
const GUEST_ID_KEY = "guest_user_id_v1";
const GUEST_SESSION_KEY = "guest_session_id_v1";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function generateNumericId() {
  const max = 2_000_000_000;
  return Math.floor(Math.random() * max);
}

export default function ChatGuestPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [wsReady, setWsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [partial, setPartial] = useState("");

  // ❗️NEW: lưu RIASEC để gửi sau khi bot chào xong
  const [prefillMessage, setPrefillMessage] = useState(null);
  const [hasWelcomed, setHasWelcomed] = useState(false);

  const partialRef = useRef("");
  const wsRef = useRef(null);
  const listRef = useRef(null);
  const prefillSentRef = useRef(false);

  // guestId & sessionId (nếu sau này cần dùng)
  const [guestId] = useState(() => {
    let stored = localStorage.getItem(GUEST_ID_KEY);
    let numeric;
    if (stored && !Number.isNaN(Number(stored))) {
      numeric = Number(stored);
    } else {
      numeric = generateNumericId();
      localStorage.setItem(GUEST_ID_KEY, String(numeric));
    }
    return numeric;
  });

  const [sessionId] = useState(() => {
    let stored = localStorage.getItem(GUEST_SESSION_KEY);
    let numeric;
    if (stored && !Number.isNaN(Number(stored))) {
      numeric = Number(stored);
    } else {
      numeric = generateNumericId();
      localStorage.setItem(GUEST_SESSION_KEY, String(numeric));
    }
    return numeric;
  });

  // Auto-scroll xuống cuối mỗi khi có tin nhắn mới
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, partial]);

  // Kết nối WS khi mount
  useEffect(() => {
    const wsUrl = API_BASE_URL.replace(/^http/, "ws") + "/chat/ws/chat";

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsReady(true);
      setHasWelcomed(false);       // reset trạng thái chào
      prefillSentRef.current = false;

      // Gửi handshake ban đầu (guest không có user_id)
      ws.send(
        JSON.stringify({
          // có thể thêm guestId / sessionId nếu BE cần
        })
      );
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);

        switch (data.event) {
          case "session_created":
            // nếu muốn lấy session_id từ server thì xử lý ở đây
            break;

          case "chunk":
            setPartial((prev) => {
              const next = prev + (data.content ?? "");
              partialRef.current = next;
              return next;
            });
            break;

          case "go": {
            // go = kết thúc đoạn greeting đầu tiên
            const finalText = (partialRef.current || "").trim();
            if (finalText) {
              const botMsg = { sender: "bot", text: finalText };
              setMessages((prev) => [...prev, botMsg]);
            }
            partialRef.current = "";
            setPartial("");
            setIsLoading(false);

            setHasWelcomed(true);    
            break;
          }

          case "done": {
            // done cho các câu trả lời sau này
            const finalText = (partialRef.current || "").trim();
            if (finalText) {
              const botMsg = { sender: "bot", text: finalText };
              setMessages((prev) => [...prev, botMsg]);
            }
            partialRef.current = "";
            setPartial("");
            setIsLoading(false);
            break;
          }

          case "error":
            setIsLoading(false);
            break;

          default:
          // ignore log khác
        }
      } catch {
        // ignore non-JSON
      }
    };

    ws.onclose = () => {
      setWsReady(false);
    };

    return () => ws.close();
  }, [guestId, sessionId]);

  // Lấy dữ liệu từ localStorage (RIASEC JSON hoặc legacy text)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHATBOT_PREFILL_KEY);
      if (!raw) return;

      localStorage.removeItem(CHATBOT_PREFILL_KEY);

      let initial = "";
      try {
        const parsed = JSON.parse(raw);

        if (parsed && typeof parsed === "object" && "text" in parsed) {
          // legacy: { text: "..." }
          initial = parsed.text;
        }else if (
        parsed &&
        typeof parsed === "object" &&
        "answers" in parsed
      ) {
        initial = `Phân tích "answers":${JSON.stringify(parsed.answers)}`;
      } else {
        // fallback: stringify toàn bộ
        initial = JSON.stringify(parsed);
      }
    } catch {
      // không parse được => dùng raw
      initial = raw;
    }

    if (!initial) return;

    // ❗️CHỈ LƯU LẠI, KHÔNG PUSH LÊN UI NGAY
    setPrefillMessage(initial);
  } catch {
    /* ignore */
  }
}, []);

  // Sau khi WS sẵn sàng *và* bot đã chào xong -> mới gửi RIASEC lên
  useEffect(() => {
    if (!wsReady || !prefillMessage || !hasWelcomed) return;
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;
    if (prefillSentRef.current) return;

    // Hiển thị như 1 tin nhắn user
    const userMsg = { sender: "user", text: prefillMessage };
    setMessages((prev) => [...prev, userMsg]);

    setIsLoading(true);
    setPartial("");
    partialRef.current = "";

    // Gửi nội dung RIASEC sang server để bot phân tích
    wsRef.current.send(
      JSON.stringify({
        message: prefillMessage,
      })
    );

    prefillSentRef.current = true;
    setPrefillMessage(null);
  }, [wsReady, prefillMessage, hasWelcomed]);

  const send = (text) => {
    if (!text.trim()) return;

    const userMsg = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setPartial("");
    partialRef.current = "";

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          message: text,
        })
      );
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!wsReady) return;
    send(input);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <ChatGuestHeader />

      {/* Khung chat */}
      <main className="mx-auto max-w-3xl px-4">
        <div ref={listRef} className="min-h-[60vh] pt-6 pb-40 overflow-y-auto">
          {messages.length === 0 && (
            <div className="mt-16 text-center text-gray-400">
              Hỏi bất kỳ điều gì… ✨
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`mb-4 flex ${
                m.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm ${
                  m.sender === "user"
                    ? "bg-[#10a37f] text-white"
                    : "bg-white text-gray-800"
                }`}
              >
                {m.sender === "bot" ? (
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                ) : (
                  m.text
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="mb-4 flex justify-start">
              <div className="max-w-[85%] rounded-2xl bg-white px-4 py-3 text-[15px] text-gray-800 shadow-sm">
                {partial}
                <span className="ml-1 animate-pulse">▌</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Thanh nhập */}
      <form
        onSubmit={onSubmit}
        className="fixed bottom-0 left-0 right-0 z-20 border-t bg-[#f7f7f8]"
      >
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="rounded-2xl border bg-white shadow-sm">
            <div className="flex items-end gap-3 p-3">
<textarea
  rows={1}
  value={input}
  onChange={(e) => setInput(e.target.value)}
  placeholder={wsReady ? "Hỏi bất kỳ điều gì…" : "Đang kết nối…"}
  className="max-h-40 flex-1 resize-none border-none p-2 focus:outline-none"
  onKeyDown={(e) => {
    // Enter để gửi, Shift+Enter để xuống dòng
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (wsReady && input.trim()) {
        send(input);
      }
    }
  }}
/>
              <button
                type="submit"
                disabled={!wsReady || !input.trim()}
                className={`rounded-xl px-4 py-2 text-white ${
                  !wsReady || !input.trim()
                    ? "cursor-not-allowed bg-gray-300"
                    : "bg-[#10a37f] hover:opacity-90"
                }`}
              >
                Gửi
              </button>
            </div>
          </div>
          <div className="mt-2 text-center text-xs text-gray-400">
            Chatbot có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
          </div>
        </div>
      </form>
    </div>
  );
}
