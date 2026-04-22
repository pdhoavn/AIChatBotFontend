// src/pages/chatbot/ChatGuestPage.jsx
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import ChatGuestHeader from "../../components/chatbotguest/ChatGuestHeader.jsx";
import ChatMessageBubble from "../../components/chatbotguest/ChatMessageBubble.jsx";
import ChatEmptyState from "../../components/chatbotguest/ChatEmptyState.jsx";
import ChatInput from "../../components/chatbotguest/ChatInput.jsx";
import SourcesPanel, { SourcesButton } from "../../components/chatbotguest/SourcesPanel.jsx";
import LawDetailModal from "../../components/chatbotguest/LawDetailModal.jsx";
import PhIcon from "../../components/ui/PhIcon.jsx";
import { API_CONFIG } from "../../config/api.js";
import useSpeechRecognition from "../../hooks/useSpeechRecognition.js";

const ROLES = [
  {
    id: "officer",
    label: "Viên chức / Người lao động",
    greeting: "Xin chào! Bạn là viên chức hoặc người lao động tại ĐH Giao thông Vận tải Phân hiệu TP.HCM. Mình sẽ hỗ trợ bạn các vấn đề về nghiên cứu khoa học, hợp tác đối ngoại, chế độ lương - chính sách, quy trình nội bộ, nhân sự, thuế thu nhập cá nhân, đảm bảo chất lượng và công tác khảo thí. Bạn cần mình giúp gì?",
    context: "Bạn là trợ lý AI chuyên hỗ trợ các viên chức và người lao động tại ĐH Giao thông Vận tải Phân hiệu TP.HCM. Ngữ cảnh: nghiên cứu khoa học, hợp tác đối ngoại, chế độ lương - chính sách, quy trình nội bộ, chính sách nhân sự, thuế thu nhập cá nhân, đảm bảo chất lượng và công tác khảo thí.",
  },
  {
    id: "student",
    label: "Sinh viên",
    greeting: "Xin chào! Bạn là sinh viên ĐH Giao thông Vận tải Phân hiệu TP.HCM. Mình sẽ hỗ trợ bạn các thắc mắc về công tác chính trị sinh viên, quy chế đào tạo (đăng ký học phần, điều kiện tốt nghiệp, xét học bổng...), thủ tục nội trú (ký túc xá), quy định khảo thí và các đợt khảo sát lấy ý kiến người học. Bạn cần mình giúp gì?",
    context: "Bạn là trợ lý AI chuyên hỗ trợ sinh viên ĐH Giao thông Vận tải Phân hiệu TP.HCM. Ngữ cảnh: công tác chính trị sinh viên, quy chế đào tạo (đăng ký học phần, điều kiện tốt nghiệp, xét học bổng...), thủ tục nội trú (ký túc xá), quy định khảo thí và các đợt khảo sát lấy ý kiến người học.",
  },
  {
    id: "parent",
    label: "Phụ huynh / Bên liên quan",
    greeting: "Xin chào! Bạn là phụ huynh hoặc bên liên quan của ĐH Giao thông Vận tải Phân hiệu TP.HCM. Mình sẽ hỗ trợ bạn tra cứu thông tin chung về nhà trường và các quy định liên quan đến việc khảo sát, lấy ý kiến của các bên liên quan (phụ huynh, doanh nghiệp). Bạn cần mình giúp gì?",
    context: "Bạn là trợ lý AI chuyên hỗ trợ phụ huynh và các bên liên quan của ĐH Giao thông Vận tải Phân hiệu TP.HCM. Ngữ cảnh: tra cứu thông tin chung về nhà trường và các quy định liên quan đến việc khảo sát, lấy ý kiến của các bên liên quan (phụ huynh, doanh nghiệp).",
  },
  {
    id: "admission",
    label: "Tuyển sinh",
    greeting: "Xin chào! Bạn đang quan tâm đến tuyển sinh của ĐH Giao thông Vận tải Phân hiệu TP.HCM. Mình sẽ hỗ trợ bạn các thông tin về tuyển sinh đại học, cao đẳng (xét tuyển, điểm chuẩn, ngành đào tạo, học phí, chính sách học bổng, điều kiện xét tuyển và quy trình đăng ký). Bạn cần mình giúp gì?",
    context: "Bạn là trợ lý AI chuyên hỗ trợ thông tin tuyển sinh của ĐH Giao thông Vận tải Phân hiệu TP.HCM. Ngữ cảnh: tuyển sinh đại học, cao đẳng (xét tuyển, điểm chuẩn, ngành đào tạo, học phí, chính sách học bổng, điều kiện xét tuyển và quy trình đăng ký).",
  },
];

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
  const [prefillMessage, setPrefillMessage] = useState(null);
  const [hasWelcomed, setHasWelcomed] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [selectedLaw, setSelectedLaw] = useState(null);
  const [isLawModalOpen, setIsLawModalOpen] = useState(false);
  const [greeting, setGreeting] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const {
    isListening,
    isSupported: isSpeechSupported,
    isMicrophoneAvailable,
    transcript,
    startListening,
    stopListening,
    clearTranscript,
  } = useSpeechRecognition();

  // Ref để tránh effect ghi đè input khi bắt đầu nghe mới
  const isStartingRef = useRef(false);
  // Lưu input trước khi bấm mic (để khôi phục nếu cancel)
  const inputBeforeMicRef = useRef("");

  // Khi dừng nghe, giữ transcript trong input để user thấy
  useEffect(() => {
    if (isStartingRef.current) {
      isStartingRef.current = false;
      return;
    }
    if (!isListening && transcript) {
      setInput(transcript);
    }
  }, [isListening, transcript]);

  const partialRef = useRef("");
  const isStoppedRef = useRef(false);
  const wsRef = useRef(null);
  const prefillSentRef = useRef(false);
  const sources = [];
  const autoScrollRef = useRef(null);

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

  useEffect(() => {
    if (autoScrollRef.current) {
      autoScrollRef.current.scrollTo({
        top: autoScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, partial]);

  useEffect(() => {
    const wsUrl = API_BASE_URL.replace(/^http/, "ws") + "/chat/ws/chat";
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsReady(true);
      setHasWelcomed(false);
      prefillSentRef.current = false;
      isStoppedRef.current = false;
      ws.send(JSON.stringify({}));
    };

    ws.onmessage = (e) => {
      if (isStoppedRef.current) return;
      try {
        const data = JSON.parse(e.data);
        switch (data.event) {
          case "chunk":
            setPartial((prev) => {
              const next = prev + (data.content ?? "");
              partialRef.current = next;
              return next;
            });
            break;
          case "go":
          case "done": {
            if (isStoppedRef.current) return;
            const finalText = (partialRef.current || "").trim();
            if (finalText) {
              setMessages((prev) => {
                if (prev.length === 0) {
                  setGreeting(finalText);
                  return prev;
                }
                return [...prev, { sender: "bot", text: finalText }];
              });
            }
            partialRef.current = "";
            setPartial("");
            setIsLoading(false);
            if (data.event === "go") setHasWelcomed(true);
            break;
          }
          case "error":
            setIsLoading(false);
            break;
          default:
            break;
        }
      } catch {
        // ignore non-JSON
      }
    };

    ws.onclose = () => setWsReady(false);
    ws.onerror = () => setWsReady(false);

    return () => ws.close();
  }, [guestId, sessionId]);

  useEffect(() => {
    if (!wsReady || !prefillMessage || !hasWelcomed) return;
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;
    if (prefillSentRef.current) return;

    setMessages((prev) => [...prev, { sender: "user", text: prefillMessage }]);
    setIsLoading(true);
    setPartial("");
    partialRef.current = "";
    isStoppedRef.current = false;

    wsRef.current.send(JSON.stringify({ message: prefillMessage }));
    prefillSentRef.current = true;
    setPrefillMessage(null);
  }, [wsReady, prefillMessage, hasWelcomed]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHATBOT_PREFILL_KEY);
      if (!raw) return;
      localStorage.removeItem(CHATBOT_PREFILL_KEY);

      let initial = "";
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && "text" in parsed) {
          initial = parsed.text;
        } else if (parsed && typeof parsed === "object" && "answers" in parsed) {
          initial = `Phân tích "answers":${JSON.stringify(parsed.answers)}`;
        } else {
          initial = JSON.stringify(parsed);
        }
      } catch {
        initial = raw;
      }

      if (!initial) return;
      setPrefillMessage(initial);
    } catch {
      /* ignore */
    }
  }, []);

  const send = (text, roleContext) => {
    if (!text.trim()) return;

    const userMessage = text;
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setIsLoading(true);
    setPartial("");
    partialRef.current = "";
    isStoppedRef.current = false;

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        message: userMessage,
        context: roleContext || null
      }));
    }
  };

  const handleSubmit = (fileContent) => {
    if (!input.trim() && !fileContent) return;
    const selectedRoleObj = ROLES.find((r) => r.id === selectedRole);
    send(fileContent || input, selectedRoleObj?.context);
  };

  const handleSuggestionClick = (text) => {
    if (!wsReady) return;
    const selectedRoleObj = ROLES.find((r) => r.id === selectedRole);
    send(text, selectedRoleObj?.context);
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role.id);
    const selectedRoleObj = ROLES.find((r) => r.id === role.id);
    if (selectedRoleObj) {
      setGreeting(selectedRoleObj.greeting);
    }
  };

  const handleMicClick = () => {
    if (!isSpeechSupported) {
      alert("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.");
      return;
    }
    if (isMicrophoneAvailable === false) {
      alert("Vui lòng cho phép truy cập microphone trong trình duyệt.");
      return;
    }
    isStartingRef.current = true;
    inputBeforeMicRef.current = input;
    setInput("");
    startListening();
  };

  const handleStop = () => {
    isStoppedRef.current = true;
    setIsLoading(false);
  };

  const handleMicStop = () => {
    if (!transcript.trim()) {
      setInput(inputBeforeMicRef.current);
    }
    stopListening();
  };

  const handleTranscriptConfirm = () => {
    const confirmed = transcript.trim();
    if (!confirmed) return;
    stopListening();
    clearTranscript();
    const selectedRoleObj = ROLES.find((r) => r.id === selectedRole);
    send(confirmed, selectedRoleObj?.context);
    setInput("");
  };

  return (
    <div className="chat-shell flex flex-col h-screen bg-sidebar relative w-full transition-colors duration-300 overflow-hidden">
      <ChatGuestHeader 
        roles={ROLES}
        selectedRole={selectedRole}
        onRoleChange={handleRoleSelect}
      />

      <div
        ref={autoScrollRef}
        className="flex-1 overflow-y-auto w-full relative"
      >
        <div className="max-w-5xl mx-auto w-full px-3 md:px-6 flex flex-col pb-36 min-h-full">
          <div className="relative z-20 mb-4">
            <SourcesPanel
              sources={sources}
              showSources={showSources}
              onToggle={() => setShowSources(!showSources)}
              onClose={() => setShowSources(false)}
            />
          </div>

          <div className="w-full flex-1">
            {messages.length === 0 && (
              <ChatEmptyState
                greeting={greeting}
                onSendMessage={handleSuggestionClick}
                onRoleSelect={handleRoleSelect}
                selectedRole={selectedRole}
              />
            )}

            {messages.map((m, i) => (
              <div key={i} className="mb-4 chat-message">
                <ChatMessageBubble message={m} />
              </div>
            ))}

            {(isLoading || partial) && (
              <div className="mb-4 chat-message flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-surface border border-border-main/50 px-5 py-3.5 shadow-sm">
                  {partial ? (
                    <div className="text-sm leading-relaxed text-text-main prose prose-sm max-w-none">
                      <ReactMarkdown>{partial}</ReactMarkdown>
                      {isLoading && <span className="ml-1 animate-pulse text-accent">|</span>}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-text-muted">
                      <span className="inline-block w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                      <span className="inline-block w-1.5 h-1.5 bg-accent rounded-full animate-pulse [animation-delay:150ms]" />
                      <span className="inline-block w-1.5 h-1.5 bg-accent rounded-full animate-pulse [animation-delay:300ms]" />
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 w-full z-20 px-3 md:px-6 pb-3 pt-2 pointer-events-none">
        <div className="mx-auto w-full max-w-5xl">
          <ChatInput
            input={input}
            isLoading={isLoading}
            wsReady={wsReady}
            onInputChange={setInput}
            onSubmit={handleSubmit}
            onOpenCall={handleMicClick}
            selectedRole={selectedRole}
            isListening={isListening}
            transcript={transcript}
            onMicClick={handleMicClick}
            onMicStop={handleMicStop}
            onTranscriptConfirm={handleTranscriptConfirm}
            onStop={handleStop}
          />
          <div className="mt-2 w-full flex justify-center pointer-events-auto text-xs text-text-muted">
            <span className="bg-sidebar/80 backdrop-blur-sm px-3 py-0.5 rounded-full">
              Chatbot có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
            </span>
          </div>
        </div>
      </div>

      <LawDetailModal
        isOpen={isLawModalOpen}
        law={selectedLaw}
        onClose={() => setIsLawModalOpen(false)}
      />
    </div>
  );
}
