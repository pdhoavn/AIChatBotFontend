// src/pages/chatbot/ChatGuestPage.jsx
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { chatMarkdownComponents } from "../../components/chatbotguest/chatMarkdownComponents.jsx";
import { toast } from "react-toastify";
import ChatGuestHeader from "../../components/chatbotguest/ChatGuestHeader.jsx";
import ChatMessageBubble from "../../components/chatbotguest/ChatMessageBubble.jsx";
import ChatEmptyState from "../../components/chatbotguest/ChatEmptyState.jsx";
import ChatInput from "../../components/chatbotguest/ChatInput.jsx";
import PhIcon from "../../components/ui/PhIcon.jsx";
import { API_CONFIG } from "../../config/api.js";
import useSpeechRecognition from "../../hooks/useSpeechRecognition.js";
import { audienceAPI, resolveAudienceCode } from "../../api/audienceApi.ts";
import ChatLoginModal from "../../components/chatbotguest/ChatLoginModal.jsx";
import { clearChatSession, getChatAccessToken, getChatRequestToken } from "../../utils/chatAuth";

const CHATBOT_PREFILL_KEY = "chatbot_prefill_message";
const GUEST_ID_KEY = "guest_user_id_v1";
const GUEST_SESSION_KEY = "guest_session_id_v1";

const API_BASE_URL = API_CONFIG.FASTAPI_BASE_URL;

function generateNumericId() {
  const max = 2_000_000_000;
  return Math.floor(Math.random() * max);
}

function normalizeWsSources(sources) {
  if (!Array.isArray(sources)) return [];
  const seenDocIds = new Set();
  const normalized = [];

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

    if (!Number.isInteger(documentId) || documentId <= 0) {
      continue;
    }
    if (seenDocIds.has(documentId)) {
      continue;
    }

    seenDocIds.add(documentId);
    normalized.push({
      document_id: documentId,
      file_name: fileName,
    });
  }

  return normalized;
}

function buildRiasecPrefillMessage(answers) {
  if (!answers || typeof answers !== "object") return "";

  const normalizedScores = ["R", "I", "A", "S", "E", "C"].reduce(
    (acc, key) => {
      const rawValue = answers[key];
      const numericValue =
        typeof rawValue === "number" ? rawValue : Number(rawValue || 0);
      acc[key] = Number.isFinite(numericValue) ? numericValue : 0;
      return acc;
    },
    {}
  );

  const ranking = Object.entries(normalizedScores)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .map(([trait, score]) => `${trait}=${score}`);

  return [
    "Đây là kết quả trắc nghiệm RIASEC của tôi.",
    `Điểm từng nhóm: ${ranking.join(", ")}.`,
    "Hãy phân tích nhóm tính cách nổi trội, giải thích ý nghĩa của kết quả, và gợi ý ngành học hoặc định hướng phù hợp cho mục tiêu tuyển sinh.",
    "Ưu tiên trả lời ngắn gọn, rõ ràng, có thể hành động được.",
  ].join(" ");
}

function normalizeSuggestionQuestions(data) {
  const candidates = Array.isArray(data)
    ? data
    : data?.suggestions || data?.questions || data?.data || data?.items || [];

  if (!Array.isArray(candidates)) return [];

  return candidates
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }
      if (!item || typeof item !== "object") {
        return "";
      }
      const value =
        item.text ||
        item.question ||
        item.question_text ||
        item.content ||
        item.title ||
        "";
      return String(value).trim();
    })
    .filter(Boolean)
    .map((text) => ({ text }));
}

export default function ChatGuestPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [partial, setPartial] = useState("");
  const [prefillMessage, setPrefillMessage] = useState(null);
  const [greeting, setGreeting] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingMessage, setPendingMessage] = useState(null);
  const [isChatPrivateLoggedIn, setIsChatPrivateLoggedIn] = useState(Boolean(getChatAccessToken()));

  const [audiences, setAudiences] = useState([]);
  const [intents, setIntents] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedAudience, setSelectedAudience] = useState(null);
  const [selectedIntent, setSelectedIntent] = useState(null);
  const [prefillAudienceCode, setPrefillAudienceCode] = useState(null);

  const {
    isListening,
    isSupported: isSpeechSupported,
    isMicrophoneAvailable,
    transcript,
    startListening,
    stopListening,
    clearTranscript,
    error: speechError,
  } = useSpeechRecognition();

  const isStartingRef = useRef(false);
  const inputBeforeMicRef = useRef("");

  useEffect(() => {
    const syncChatPrivateAuth = () => {
      setIsChatPrivateLoggedIn(Boolean(getChatAccessToken()));
    };

    syncChatPrivateAuth();
    window.addEventListener("storage", syncChatPrivateAuth);
    window.addEventListener("chat-auth-change", syncChatPrivateAuth);

    return () => {
      window.removeEventListener("storage", syncChatPrivateAuth);
      window.removeEventListener("chat-auth-change", syncChatPrivateAuth);
    };
  }, []);

  // Hiển thị lỗi speech recognition cho user
  useEffect(() => {
    if (!speechError) return;
    const errorMessages = {
      "not-allowed": "Bạn đã chặn quyền microphone. Vui lòng cấp lại trong cài đặt trình duyệt.",
      "network": "Trình duyệt này không hỗ trợ dịch vụ giọng nói. Vui lòng sử dụng Chrome hoặc Safari.",
      "no-mic": "Không tìm thấy microphone trên thiết bị.",
      "not-supported": "Trình duyệt hiện tại không hỗ trợ nhập giọng nói. Vui lòng sử dụng Chrome hoặc Safari.",
      "start-failed": "Không thể khởi động nhận diện giọng nói. Vui lòng sử dụng Chrome hoặc Safari.",
    };
    toast.info(errorMessages[speechError] || "Lỗi nhận diện giọng nói.", { toastId: "speech-error", autoClose: 5000 });
  }, [speechError]);

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
  const abortControllerRef = useRef(null);
  const prefillSentRef = useRef(false);
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

  // Fetch audiences on mount; intents loaded per-audience via /knowledge/intentbyid
  useEffect(() => {
    let isActive = true;

    audienceAPI
      .getAudiences()
      .then((data) => {
        if (!isActive) return;
        setAudiences(data || []);
      })
      .catch(() => {
        if (!isActive) return;
        toast.error("Không thể tải danh sách đối tượng.");
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!prefillAudienceCode || audiences.length === 0 || selectedAudience) return;

    const matchedAudience = audiences.find(
      (audience) => resolveAudienceCode(audience) === prefillAudienceCode
    );

    if (matchedAudience) {
      setSelectedAudience(matchedAudience);
      if (matchedAudience.description) {
        setGreeting(matchedAudience.description);
      }
    }
  }, [audiences, prefillAudienceCode, selectedAudience]);

  // Load intents with docs when audience changes
  useEffect(() => {
    if (!selectedAudience) {
      setIntents([]);
      setSuggestions([]);
      return;
    }

    const code = resolveAudienceCode(selectedAudience);

    if (!code) {
      setIntents([]);
      return;
    }
    audienceAPI
      .getIntentsByAudience(code)
      .then((data) => setIntents(data || []))
      .catch(() => {
        toast.error("Không thể tải danh sách lĩnh vực.");
        setIntents([]);
      });
  }, [selectedAudience]);

  useEffect(() => {
    if (!selectedAudience?.id) {
      setSuggestions([]);
      return;
    }

    let isActive = true;
    const intentId = selectedIntent?.intent_id || 0;

    audienceAPI
      .getSuggestionQuestions(selectedAudience.id, intentId)
      .then((data) => {
        if (!isActive) return;
        setSuggestions(normalizeSuggestionQuestions(data));
      })
      .catch(() => {
        if (!isActive) return;
        setSuggestions([]);
      });

    return () => {
      isActive = false;
    };
  }, [selectedAudience, selectedIntent]);

  useEffect(() => {
    if (isAutoScrollEnabled && autoScrollRef.current) {
      autoScrollRef.current.scrollTo({
        top: autoScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, partial, isAutoScrollEnabled]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Consider "near bottom" if within 150px of the bottom
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
    
    setIsAutoScrollEnabled(isNearBottom);
    setShowScrollButton(!isNearBottom);
  };

  // SSE streaming helper: gửi message qua POST, đọc response SSE
  const sendMessageSSE = async (text, audienceId, intentId) => {
    setIsLoading(true);
    setHasError(false);
    setPartial("");
    partialRef.current = "";
    isStoppedRef.current = false;

    // Abort request trước đó nếu có
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Đính kèm JWT token nếu người dùng đã đăng nhập
      const token = getChatRequestToken();
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
          user_id: guestId,
          audience_id: audienceId || null,
          intent_id: intentId || null,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (isStoppedRef.current) {
          reader.cancel();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));

            switch (data.event) {
              case "session":
                // Cập nhật session_id nếu server tạo mới
                if (data.session_id) {
                  localStorage.setItem(GUEST_SESSION_KEY, String(data.session_id));
                }
                break;
              case "chunk":
                if (isStoppedRef.current) break;
                partialRef.current += data.content ?? "";
                setPartial(partialRef.current);
                break;
              case "login_required": {
                // Backend yêu cầu đăng nhập để xem nội dung bảo mật
                const loginMsg = "Câu hỏi của bạn liên quan đến dữ liệu nội bộ, vui lòng đăng nhập để hệ thống trả lời.";

                // Show modal and save pending text
                setPendingMessage(text);
                setShowLoginModal(false);

                setMessages((prev) => [
                  ...prev,
                  {
                    sender: "bot",
                    text: loginMsg,
                    type: "login_required",
                  },
                ]);
                partialRef.current = "";
                setPartial("");
                setIsLoading(false);
                break;
              }
              case "done": {
                if (isStoppedRef.current) break;
                const finalText = (partialRef.current || "").trim();
                const confidence =
                  typeof data.confidence === "number" ? data.confidence : null;
                const normalizedSources = normalizeWsSources(data.sources);

                if (finalText) {
                  setMessages((prev) => [
                    ...prev,
                    {
                      sender: "bot",
                      text: finalText,
                      confidence,
                      sources: normalizedSources,
                    },
                  ]);
                }

                partialRef.current = "";
                setPartial("");
                setIsLoading(false);
                break;
              }
              case "error":
                setIsLoading(false);
                setHasError(true);
                break;
              default:
                break;
            }
          } catch {
            // ignore non-JSON lines
          }
        }
      }

      // Stream kết thúc mà chưa nhận done event → finalize
      if (!isStoppedRef.current && partialRef.current) {
        const finalText = partialRef.current.trim();
        if (finalText) {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: finalText, confidence: null, sources: [] },
          ]);
        }
        partialRef.current = "";
        setPartial("");
        setIsLoading(false);
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("SSE stream error:", err);
      setIsLoading(false);
      setHasError(true);
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (!prefillMessage) return;
    if (
      prefillAudienceCode &&
      resolveAudienceCode(selectedAudience) !== prefillAudienceCode
    ) {
      return;
    }
    if (prefillSentRef.current) return;

    setMessages((prev) => [...prev, { sender: "user", text: prefillMessage }]);
    prefillSentRef.current = true;

    sendMessageSSE(
      prefillMessage,
      selectedAudience?.id || null,
      null,
    );
    setPrefillMessage(null);
    setPrefillAudienceCode(null);
  }, [prefillMessage, prefillAudienceCode, selectedAudience]);

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
          initial = buildRiasecPrefillMessage(parsed.answers);
          const audienceCode = resolveAudienceCode(parsed.target_audience);
          if (audienceCode) {
            setPrefillAudienceCode(audienceCode);
          }
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

  const send = (text, intentId, audienceId = selectedAudience?.id ?? null) => {
    if (!text.trim()) return;

    const userMessage = text;
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");

    sendMessageSSE(
      userMessage,
      audienceId,
      intentId ?? selectedIntent?.intent_id ?? null,
    );
  };

  const resendLastUserMessage = (audienceId) => {
    const lastUserMsg = [...messages].reverse().find((m) => m.sender === "user");
    if (!lastUserMsg?.text?.trim() || !audienceId) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    isStoppedRef.current = false;
    partialRef.current = "";
    setPartial("");
    setIsLoading(false);
    setHasError(false);

    sendMessageSSE(lastUserMsg.text, audienceId, null);
  };

  const handleSubmit = (intentId) => {
    if (!selectedAudience) {
      toast.warning("Vui lòng chọn đối tượng tra cứu trước khi nhắn tin.", { toastId: "no-audience-submit" });
      return;
    }
    if (!input.trim()) return;
    send(input, intentId);
  };

  const handleSuggestionClick = (text) => {
    if (!selectedAudience) {
      toast.warning("Vui lòng chọn đối tượng tra cứu trước khi nhắn tin.", { toastId: "no-audience-suggestion" });
      return;
    }
    send(text);
  };

  const handleAudienceChange = (audience, options = {}) => {
    if (!audience) return;

    const isSameAudience = selectedAudience?.id === audience.id;

    setSelectedAudience(audience);
    setSelectedIntent(null);
    if (audience?.description) {
      setGreeting(audience.description);
    }

    if (options.resendLastMessage && !isSameAudience) {
      resendLastUserMessage(audience.id);
    }
  };

  const handleIntentChange = (intent) => {
    setSelectedIntent(intent);
  };

  const handleMicClick = () => {
    if (!isSpeechSupported) {
      toast.info(
        "Trình duyệt hiện tại không hỗ trợ nhập giọng nói. Vui lòng sử dụng Chrome hoặc Safari để dùng tính năng này.",
        { toastId: "no-speech", autoClose: 5000 }
      );
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
    // Abort đang stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const handleMicStop = () => {
    if (!transcript.trim()) {
      setInput(inputBeforeMicRef.current);
    }
    stopListening();
  };

  const handleTranscriptConfirm = () => {
    if (!selectedAudience) {
      toast.warning("Vui lòng chọn đối tượng tra cứu trước khi nhắn tin.", { toastId: "no-audience-transcript" });
      return;
    }
    const confirmed = transcript.trim();
    if (!confirmed) return;
    stopListening();
    clearTranscript();
    send(confirmed);
    setInput("");
  };

  const handlePrivateLoginClick = () => {
    if (getChatAccessToken()) {
      setShowLoginModal(false);
      toast.info("Bạn đã đăng nhập dữ liệu nội bộ.", { toastId: "chat-private-already-logged-in" });
      return;
    }

    setShowLoginModal(true);
  };

  const handlePrivateLogout = () => {
    clearChatSession();
    setShowLoginModal(false);
    setPendingMessage(null);
    toast.info("Đã đăng xuất.", { toastId: "chat-private-logout" });
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setIsChatPrivateLoggedIn(Boolean(getChatAccessToken()));
    if (pendingMessage) {
      setTimeout(() => {
        send(pendingMessage, selectedIntent?.intent_id);
        setPendingMessage(null);
      }, 300);
    }
  };

  return (
    <div className="chat-shell font-display flex h-[100dvh] min-h-[100svh] flex-col bg-sidebar relative w-full transition-colors duration-300 overflow-x-hidden">
      <ChatGuestHeader
        audiences={audiences}
        selectedAudience={selectedAudience}
        onAudienceChange={handleAudienceChange}
        isChatPrivateLoggedIn={isChatPrivateLoggedIn}
        onChatPrivateLogout={handlePrivateLogout}
      />

      <div
        ref={autoScrollRef}
        onScroll={handleScroll}
        className="relative z-0 flex-1 overflow-y-auto w-full"
      >
        <div className="max-w-5xl mx-auto w-full px-3 md:px-6 flex flex-col pb-52 sm:pb-44 min-h-full">
          <div className="w-full flex-1">

            {messages.length === 0 && (
              <ChatEmptyState
                greeting={greeting}
                onSendMessage={handleSuggestionClick}
                suggestions={suggestions}
                onAudienceChange={handleAudienceChange}
                selectedAudience={selectedAudience}
                audiences={audiences}
              />
            )}

            {messages.map((m, i) => (
              <div key={i} className="mb-4 chat-message">
                <ChatMessageBubble 
                  message={m} 
                  onLoginClick={handlePrivateLoginClick} 
                  isPrivateLoggedIn={isChatPrivateLoggedIn}
                  audiences={audiences}
                  selectedAudience={selectedAudience}
                  onAudienceChange={handleAudienceChange}
                />
              </div>
            ))}

            {showLoginModal && (
              <div className="mb-4 chat-message">
                <ChatLoginModal
                  isOpen={showLoginModal}
                  onClose={() => setShowLoginModal(false)}
                  onSuccess={handleLoginSuccess}
                />
              </div>
            )}

            {(isLoading || partial) && (
              <div className="mb-4 chat-message flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-surface border border-border-main/50 px-5 py-3.5 shadow-sm">
                  {partial ? (
                    <div className="text-sm leading-relaxed text-text-main prose prose-sm max-w-none">
                      <ReactMarkdown components={chatMarkdownComponents}>{partial}</ReactMarkdown>
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

            {hasError && (
              <div className="mb-4 flex justify-center">
                <div className="bg-red-500/10 text-red-500 px-4 py-2 rounded-xl text-[13px] flex items-center gap-3 border border-red-500/20 shadow-sm max-w-[85%]">
                  <PhIcon name="error" size={18} className="shrink-0" />
                  <span>Kết nối bị gián đoạn. Vui lòng thử lại.</span>
                  <button 
                    onClick={() => {
                      setHasError(false);
                      const lastUserMsg = [...messages].reverse().find(m => m.sender === "user");
                      if (lastUserMsg) {
                        send(lastUserMsg.text);
                      }
                    }}
                    className="shrink-0 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold shadow-sm flex items-center gap-1.5 ml-2"
                  >
                    <PhIcon name="arrows_clockwise" size={14} />
                    Thử lại
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 w-full z-20 px-2 sm:px-3 md:px-6 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 pointer-events-none">
        <div className="mx-auto w-full max-w-5xl relative">
          
          {/* Scroll to bottom button */}
          {showScrollButton && (
            <div className="absolute -top-14 left-1/2 -translate-x-1/2 pointer-events-auto">
              <button
                onClick={() => {
                  if (autoScrollRef.current) {
                    autoScrollRef.current.scrollTo({
                      top: autoScrollRef.current.scrollHeight,
                      behavior: "smooth",
                    });
                  }
                }}
                className={`rounded-full bg-surface/95 backdrop-blur-sm border border-border-main shadow-[0_4px_16px_rgba(0,0,0,0.1)] flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/40 transition-all hover:scale-105 ${
                  (isLoading || partial) ? "h-9 px-4 gap-2" : "w-9 h-9"
                }`}
                title="Cuộn xuống tin nhắn mới nhất"
              >
                {(isLoading || partial) ? (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                    <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse [animation-delay:300ms]" />
                  </span>
                ) : (
                  <PhIcon name="expand_more" size={18} />
                )}
              </button>
            </div>
          )}

          <ChatInput
            input={input}
            isLoading={isLoading}
            wsReady={true}
            onInputChange={setInput}
            onSubmit={handleSubmit}
            onOpenCall={handleMicClick}
            selectedAudience={selectedAudience}
            selectedIntent={selectedIntent}
            onIntentChange={handleIntentChange}
            intents={intents}
            isListening={isListening}
            isSpeechSupported={isSpeechSupported}
            transcript={transcript}
            onMicClick={handleMicClick}
            onMicStop={handleMicStop}
            onTranscriptConfirm={handleTranscriptConfirm}
            onStop={handleStop}
          />
          <div className="mt-1.5 sm:mt-2 w-full flex justify-center pointer-events-auto">
            <p
              role="note"
              className="w-full max-w-3xl rounded-xl border border-border-main/30 bg-sidebar/85 px-3 py-2 text-center text-[10px] leading-snug text-text-muted/85 shadow-sm backdrop-blur-sm sm:rounded-2xl sm:px-4 sm:text-[11px] sm:leading-relaxed md:rounded-full md:px-5 md:py-1.5"
            >
              Chatbot UTC2 hỗ trợ tra cứu với giá trị tham khảo, không thay thế văn bản chính thức.
              <br />
              Vui lòng không nhập vào hệ thống thông tin bí mật, dữ liệu nhạy cảm, hoặc chưa được phép công khai.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
