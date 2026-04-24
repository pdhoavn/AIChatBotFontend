// src/pages/chatbot/ChatGuestPage.jsx
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "react-toastify";
import ChatGuestHeader from "../../components/chatbotguest/ChatGuestHeader.jsx";
import ChatMessageBubble from "../../components/chatbotguest/ChatMessageBubble.jsx";
import ChatEmptyState from "../../components/chatbotguest/ChatEmptyState.jsx";
import ChatInput from "../../components/chatbotguest/ChatInput.jsx";
import SourcesPanel, { SourcesButton } from "../../components/chatbotguest/SourcesPanel.jsx";
import LawDetailModal from "../../components/chatbotguest/LawDetailModal.jsx";
import PhIcon from "../../components/ui/PhIcon.jsx";
import { API_CONFIG } from "../../config/api.js";
import useSpeechRecognition from "../../hooks/useSpeechRecognition.js";
import { audienceAPI } from "../../api/audienceApi.ts";

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

  const [audiences, setAudiences] = useState([]);
  const [intents, setIntents] = useState([]);
  const [selectedAudience, setSelectedAudience] = useState(null);
  const [selectedIntent, setSelectedIntent] = useState(null);

  const {
    isListening,
    isSupported: isSpeechSupported,
    isMicrophoneAvailable,
    transcript,
    startListening,
    stopListening,
    clearTranscript,
  } = useSpeechRecognition();

  const isStartingRef = useRef(false);
  const inputBeforeMicRef = useRef("");

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

  // Fetch audiences and intents on mount
  useEffect(() => {
    Promise.all([
      audienceAPI.getAudiences(),
      audienceAPI.getIntents(),
    ])
      .then(([audiencesData, intentsData]) => {
        setAudiences(audiencesData || []);
        setIntents(intentsData || []);
      })
      .catch(() => {
        toast.error("Không thể tải danh sách đối tượng và lĩnh vực.");
      });
  }, []);

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

  const send = (text, intentId) => {
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
        audience_id: selectedAudience?.id || null,
        intent_id: intentId ?? selectedIntent?.intent_id ?? null,
      }));
    }
  };

  const handleSubmit = (fileContent, intentId) => {
    if (!selectedAudience) {
      toast.warning("Vui lòng chọn đối tượng tra cứu trước khi nhắn tin.", { toastId: "no-audience-submit" });
      return;
    }
    if (!input.trim() && !fileContent) return;
    send(fileContent || input, intentId);
  };

  const handleSuggestionClick = (text) => {
    if (!selectedAudience) {
      toast.warning("Vui lòng chọn đối tượng tra cứu trước khi nhắn tin.", { toastId: "no-audience-suggestion" });
      return;
    }
    if (!wsReady) return;
    send(text);
  };

  const handleAudienceChange = (audience) => {
    setSelectedAudience(audience);
    setSelectedIntent(null);
    if (audience?.description) {
      setGreeting(audience.description);
    }
  };

  const handleIntentChange = (intent) => {
    setSelectedIntent(intent);
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

  return (
    <div className="chat-shell flex flex-col h-screen bg-sidebar relative w-full transition-colors duration-300 overflow-hidden">
      <ChatGuestHeader
        audiences={audiences}
        selectedAudience={selectedAudience}
        onAudienceChange={handleAudienceChange}
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
                onAudienceChange={handleAudienceChange}
                selectedAudience={selectedAudience}
                audiences={audiences}
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
            selectedAudience={selectedAudience}
            selectedIntent={selectedIntent}
            onIntentChange={handleIntentChange}
            intents={intents}
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
