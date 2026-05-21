import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Info, X, Briefcase, GraduationCap, HeartHandshake, ClipboardList, ChevronDown, Bot, ExternalLink, Sparkles, FileText, Copy, Check, Lock, LogIn, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface FloatingAiAssistantProps {
  apiUrl: string;
  /** @deprecated No longer used — SSE streaming replaces WebSocket */
  wsUrl?: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  type?: 'login_required';
  confidence?: number | null;
  sources?: Array<{ document_id: number; file_name?: string | null }>;
}

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function generateNumericId() {
  return Math.floor(Math.random() * 2_000_000_000);
}

// buildWebSocketUrl removed — SSE uses standard HTTP POST

const GUEST_ID_KEY = 'widget_guest_user_id';
const GUEST_SESSION_KEY = 'widget_guest_session_id';

function normalizeWsSources(sources: any[]): Array<{ document_id: number; file_name?: string | null }> {
  if (!Array.isArray(sources)) return [];
  const seen = new Set<number>();
  const result: Array<{ document_id: number; file_name?: string | null }> = [];
  for (const src of sources) {
    let documentId: number | null = null;
    let fileName: string | null = null;
    if (typeof src === 'number') { documentId = src; }
    else if (typeof src === 'string') { const p = Number(src.trim()); if (Number.isFinite(p)) documentId = p; }
    else if (src && typeof src === 'object') {
      const rawId = src.document_id ?? src.documentId ?? src.id;
      const pid = typeof rawId === 'number' ? rawId : Number(String(rawId ?? '').trim());
      if (Number.isFinite(pid)) documentId = pid;
      const rf = src.file_name ?? src.fileName ?? src.name;
      if (typeof rf === 'string' && rf.trim()) fileName = rf.trim();
    }
    if (!Number.isInteger(documentId) || documentId! <= 0 || seen.has(documentId!)) continue;
    seen.add(documentId!);
    result.push({ document_id: documentId!, file_name: fileName });
  }
  return result;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div className="mt-2 flex justify-end">
      <button
        onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
      >
        {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
        {copied ? <span className="text-emerald-500">Đã sao chép</span> : <span>Sao chép</span>}
      </button>
    </div>
  );
}

const markdownComponents = {
  p: ({ node, ...props }: any) => <p className="mb-2.5 leading-relaxed last:mb-0" {...props} />,
  strong: ({ node, ...props }: any) => <strong className="font-semibold text-blue-700" {...props} />,
  em: ({ node, ...props }: any) => <em className="italic text-gray-700" {...props} />,
  a: ({ node, ...props }: any) => <a className="text-blue-600 hover:underline font-medium hover:text-blue-800 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
  h1: ({ node, ...props }: any) => <h1 className="text-[15px] font-semibold mt-4 mb-2 text-gray-800" {...props} />,
  h2: ({ node, ...props }: any) => <h2 className="text-[14px] font-semibold mt-3.5 mb-2 text-gray-800" {...props} />,
  h3: ({ node, ...props }: any) => <h3 className="text-[13px] font-semibold mt-3 mb-1.5 text-gray-800" {...props} />,
  ul: ({ node, ...props }: any) => <ul className="list-disc pl-4 my-2.5 space-y-1.5 marker:text-blue-400" {...props} />,
  ol: ({ node, ...props }: any) => <ol className="list-decimal pl-4 my-2.5 space-y-1.5 marker:text-blue-500 marker:font-medium" {...props} />,
  li: ({ node, ...props }: any) => <li className="pl-0.5" {...props} />,
  code: ({ node, inline, className, children, ...props }: any) =>
    inline
      ? <code className="text-blue-700 bg-blue-50/80 px-1.5 py-0.5 rounded-md font-mono text-[12px] border border-blue-100/50" {...props}>{children}</code>
      : <pre className="bg-gray-800 text-gray-50 p-3.5 rounded-xl overflow-x-auto text-[12px] font-mono whitespace-pre shadow-sm my-3"><code {...props}>{children}</code></pre>,
  blockquote: ({ node, ...props }: any) => <blockquote className="border-l-4 border-blue-300 pl-3.5 italic text-gray-600 my-3 bg-blue-50/30 py-1.5 rounded-r-lg" {...props} />
};

const FloatingAiAssistant = ({ apiUrl }: Partial<FloatingAiAssistantProps> = {}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [partial, setPartial] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const effectiveApiUrl = apiUrl || import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' ? `${window.location.origin.replace(/\/$/, '')}/api` : '');

  useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(!!localStorage.getItem('access_token'));
    };
    checkLogin();
    const interval = setInterval(checkLogin, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
  };

  const defaultAudienceOptions = [
    { id: 'CANBO', label: 'Viên chức / Người lao động', icon: Briefcase },
    { id: 'SINHVIEN', label: 'Sinh viên', icon: GraduationCap },
    { id: 'PHUHUYNH', label: 'Phụ huynh / Bên liên quan', icon: HeartHandshake },
    { id: 'TUYENSINH', label: 'Tuyển sinh', icon: ClipboardList },
  ];
  
  const [audiences, setAudiences] = useState<any[]>(defaultAudienceOptions);
  const [selectedAudience, setSelectedAudience] = useState<any>(defaultAudienceOptions[0]);
  const [intents, setIntents] = useState<any[]>([]);
  const [selectedIntent, setSelectedIntent] = useState<any>(null);
  const [isIntentMenuOpen, setIsIntentMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const maxChars = 2000;

  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const partialRef = useRef('');
  const isStoppedRef = useRef(false);

  const [_guestId] = useState(() => {
    let stored = localStorage.getItem(GUEST_ID_KEY);
    if (stored && !Number.isNaN(Number(stored))) return Number(stored);
    const id = generateNumericId();
    localStorage.setItem(GUEST_ID_KEY, String(id));
    return id;
  });

  const [_sessionId] = useState(() => {
    let stored = localStorage.getItem(GUEST_SESSION_KEY);
    if (stored && !Number.isNaN(Number(stored))) return Number(stored);
    const id = generateNumericId();
    localStorage.setItem(GUEST_SESSION_KEY, String(id));
    return id;
  });

  const ICONS: Record<string, any> = {
    CANBO: Briefcase,
    SINHVIEN: GraduationCap,
    PHUHUYNH: HeartHandshake,
    TUYENSINH: ClipboardList
  };

  const AUDIENCE_LABELS: Record<string, string> = {
    CANBO: "Viên chức / Người lao động",
    SINHVIEN: "Sinh viên",
    PHUHUYNH: "Phụ huynh / Bên liên quan",
    TUYENSINH: "Tuyển sinh",
  };

  const AUDIENCE_CODE_MAP: Record<string, string> = {
    "viên chức/người lao động": "CANBO",
    "viên chức / người lao động": "CANBO",
    "sinh viên": "SINHVIEN",
    "phụ huynh": "PHUHUYNH",
    "phụ huynh / bên liên quan": "PHUHUYNH",
    "tuyển sinh": "TUYENSINH",
    "canbo": "CANBO",
    "sinhvien": "SINHVIEN",
    "phuhuynh": "PHUHUYNH",
    "tuyensinh": "TUYENSINH",
  };

  const AUDIENCE_COLORS: Record<string, { active: string, hover: string }> = {
    CANBO: { active: 'text-indigo-600 bg-white ring-indigo-200', hover: 'hover:text-indigo-600 hover:bg-indigo-50' },
    SINHVIEN: { active: 'text-emerald-600 bg-white ring-emerald-200', hover: 'hover:text-emerald-600 hover:bg-emerald-50' },
    PHUHUYNH: { active: 'text-purple-600 bg-white ring-purple-200', hover: 'hover:text-purple-600 hover:bg-purple-50' },
    TUYENSINH: { active: 'text-amber-600 bg-white ring-amber-200', hover: 'hover:text-amber-600 hover:bg-amber-50' },
    UNKNOWN: { active: 'text-blue-600 bg-white ring-blue-200', hover: 'hover:text-blue-600 hover:bg-blue-50' },
  };

  useEffect(() => {
    fetch(`${apiUrl}/audiences/target-audience`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(item => {
            const rawName = (item.name || '').toLowerCase();
            const rawCode = (item.code || '').toLowerCase();
            const rawSlug = (item.slug || '').toLowerCase();

            let code = AUDIENCE_CODE_MAP[rawCode] || AUDIENCE_CODE_MAP[rawSlug] || AUDIENCE_CODE_MAP[rawName];
            
            if (!code) {
              if (rawName.includes('sinh vien') || rawName.includes('sinh viên')) code = 'SINHVIEN';
              else if (rawName.includes('can bo') || rawName.includes('cán bộ') || rawName.includes('viên chức')) code = 'CANBO';
              else if (rawName.includes('phu huynh') || rawName.includes('phụ huynh')) code = 'PHUHUYNH';
              else if (rawName.includes('tuyen sinh') || rawName.includes('tuyển sinh')) code = 'TUYENSINH';
              else code = 'UNKNOWN';
            }

            return {
              id: code !== 'UNKNOWN' ? code : (item.id || 'UNKNOWN'),
              dbId: item.id,
              rawName: item.name,
              label: AUDIENCE_LABELS[code] || item.name,
              icon: ICONS[code] || Briefcase,
              color: AUDIENCE_COLORS[code] || AUDIENCE_COLORS.UNKNOWN,
              description: item.description
            };
          });
          setAudiences(mapped);
          setSelectedAudience(mapped[0]);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedAudience?.rawName) {
      fetch(`${apiUrl}/knowledge/intentbyid?target_audience=${encodeURIComponent(selectedAudience.rawName)}`)
        .then(res => res.json())
        .then(data => {
          setIntents(Array.isArray(data) ? data : []);
          setSelectedIntent(null);
        })
        .catch(console.error);
    } else {
      setIntents([]);
      setSelectedIntent(null);
    }
  }, [selectedAudience]);

  useEffect(() => {
    if (selectedAudience?.dbId) {
      const intentId = selectedIntent?.intent_id ?? 0;
      fetch(`${apiUrl}/question/suggestions?target_audience_id=${selectedAudience.dbId}&intent_id=${intentId}`)
        .then(res => res.json())
        .then(data => {
          setSuggestions(Array.isArray(data) ? data : (data?.suggestions || []));
        })
        .catch(console.error);
    } else {
      setSuggestions([]);
    }
  }, [selectedAudience, selectedIntent]);

  // SSE streaming: gửi message qua POST, đọc response SSE
  const sendMessageSSE = async (text: string) => {
    setIsLoading(true);
    setHasError(false);
    setPartial('');
    partialRef.current = '';
    isStoppedRef.current = false;

    // Abort request trước đó nếu có
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${effectiveApiUrl}/chat/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: text,
          session_id: _sessionId,
          user_id: _guestId,
          audience_id: selectedAudience?.dbId ?? null,
          intent_id: selectedIntent?.intent_id ?? null,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (isStoppedRef.current) {
          reader.cancel();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));

            switch (data.event) {
              case 'session':
                if (data.session_id) {
                  localStorage.setItem(GUEST_SESSION_KEY, String(data.session_id));
                }
                break;
              case 'chunk':
                if (isStoppedRef.current) break;
                partialRef.current += data.content ?? '';
                setPartial(partialRef.current);
                break;
              case 'login_required': {
                const loginMsg = data.message || 'Nội dung này yêu cầu đăng nhập để xem.';
                setMessages(prev => [
                  ...prev,
                  {
                    id: Date.now().toString(),
                    text: loginMsg,
                    sender: 'ai',
                    type: 'login_required',
                  },
                ]);
                partialRef.current = '';
                setPartial('');
                setIsLoading(false);
                break;
              }
              case 'done': {
                if (isStoppedRef.current) break;
                const finalText = (partialRef.current || '').trim();
                const normalizedSources = normalizeWsSources(data.sources || []);
                if (finalText) {
                  setMessages(prev => [
                    ...prev,
                    {
                      id: Date.now().toString(),
                      text: finalText,
                      sender: 'ai',
                      confidence: typeof data.confidence === 'number' ? data.confidence : null,
                      sources: normalizedSources,
                    },
                  ]);
                }
                partialRef.current = '';
                setPartial('');
                setIsLoading(false);
                break;
              }
              case 'error':
                setIsLoading(false);
                setHasError(true);
                break;
              default:
                break;
            }
          } catch { /* ignore non-JSON */ }
        }
      }

      // Stream kết thúc mà chưa nhận done event → finalize
      if (!isStoppedRef.current && partialRef.current) {
        const finalText = partialRef.current.trim();
        if (finalText) {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: finalText,
            sender: 'ai',
            confidence: null,
            sources: [],
          }]);
        }
        partialRef.current = '';
        setPartial('');
        setIsLoading(false);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('SSE stream error:', err);
      setIsLoading(false);
      setHasError(true);
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  const handleSend = (textOverride?: string) => {
    const text = (textOverride ?? message).trim();
    if (!text || isLoading) return;
    if (!selectedAudience?.dbId) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setMessage('');
    setCharCount(0);

    sendMessageSSE(text);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    setCharCount(value.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, partial, isChatOpen]);

useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (!chatRef.current) return;
      
      // Sử dụng composedPath() để xuyên qua bức tường Shadow DOM
      const path = event.composedPath();
      
      // Kiểm tra xem trong đường dẫn click có chứa khung chatbot không
      const isInsideChat = path.includes(chatRef.current);
      
      // Kiểm tra xem có click trúng nút bong bóng chat không
      const isFloatingButton = path.some(
        (el) => (el as Element)?.classList?.contains('floating-ai-button')
      );

      if (!isInsideChat && !isFloatingButton) {
        setIsChatOpen(false);
      }
    };

    const rootNode = chatRef.current?.getRootNode?.();
    const listenerTarget = (rootNode instanceof ShadowRoot) ? rootNode : document;
    
    listenerTarget.addEventListener('mousedown', handleClickOutside);
    return () => listenerTarget.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="utc-widget-shell fixed bottom-6 right-6 z-50">
      {/* Floating 3D Glowing AI Logo */}
      <button
        className={`floating-ai-button relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 transform ${isChatOpen ? 'rotate-90' : 'rotate-0'
          }`}
        onClick={() => setIsChatOpen(!isChatOpen)}
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.9) 0%, rgba(29,78,216,0.9) 100%)',
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(37, 99, 235, 0.3), 0 0 60px rgba(29, 78, 216, 0.2)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* 3D effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-30"></div>

        {/* Inner glow */}
        <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>

        {/* AI Icon */}
        <div className="relative z-10 flex items-center justify-center">
          {isChatOpen ? <X className="w-8 h-8 text-white" /> : <Bot className="w-8 h-8 text-white" />}
        </div>

        {/* Glowing animation */}
        <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-blue-400"></div>
      </button>

      {/* Chat Interface */}
      {isChatOpen && (
        <div
          ref={chatRef}
          className="absolute bottom-20 right-0 w-[calc(100vw-3rem)] sm:w-[420px] transition-all duration-300 origin-bottom-right"
          style={{
            animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          }}
        >
          <div className="relative flex flex-col rounded-3xl bg-white/95 border border-gray-200/50 shadow-2xl backdrop-blur-3xl overflow-visible">

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-1">
              <div className="flex items-center gap-2">
                <img src="https://utc2.edu.vn/images/030820230730_U09Tn.png" alt="Logo" className="h-6 w-6 object-contain" />
                <div 
                  className="flex items-center gap-1 group cursor-pointer" 
                  onClick={() => window.open(import.meta.env.VITE_MAIN_CHATBOT_URL || 'http://localhost:5173', '_blank')}
                >
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Trợ lý ảo tư vấn</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
              {/* WS status & Actions */}
              <div className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full mr-1 ${!hasError ? 'bg-green-400' : 'bg-red-400'}`} title={!hasError ? 'Sẵn sàng' : 'Lỗi kết nối'} />
                
                {isLoggedIn ? (
                  <button onClick={handleLogout} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors" title="Đăng xuất">
                    <LogOut className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={() => window.open((import.meta.env.VITE_MAIN_CHATBOT_URL || 'http://localhost:5173') + '/loginprivate', '_blank')} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors" title="Đăng nhập">
                    <LogIn className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Section */}
            <div className="flex flex-col px-6 py-4 space-y-4 h-[320px] overflow-y-auto scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              
              {/* Dynamic Welcome Message */}
              {messages.length === 0 && selectedAudience && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
                  className="flex w-full justify-start"
                >
                  <div className="w-[95%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm bg-white/80 text-gray-800 rounded-bl-sm border border-gray-200/50 backdrop-blur-md">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-gray-400 font-bold mb-1.5">
                      Trợ lý ảo Phân Hiệu Trường Đại học Giao thông Vận tải tại TP. Hồ Chí Minh
                    </p>
                    <p className="text-[13px] text-gray-700 font-medium mb-3 leading-relaxed">
                      {selectedAudience.description || 'Hệ thống sẽ cá nhân hóa toàn bộ trải nghiệm dựa trên vai trò của bạn — từ nghiệp vụ, quy chế đào tạo đến các quy định liên quan.'}
                    </p>
                    {suggestions.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-500 mb-2.5 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> Câu hỏi gợi ý
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                          {suggestions.map((sug, i) => {
                            // API returns { question, intent_id, created_at }
                            const btnText = typeof sug === 'string' 
                              ? sug 
                              : (sug.question || sug.text || sug.question_text || sug.content || '');
                            if (!btnText) return null;
                            return (
                              <button
                                key={i}
                                onClick={() => handleSend(btnText)}
                                className="flex-shrink-0 px-3 py-1.5 bg-gray-50/80 border border-gray-200 rounded-2xl text-[12px] text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors text-left shadow-sm max-w-[200px] truncate"
                              >
                                {btnText}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              <AnimatePresence>
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  const isLoginRequired = msg.type === 'login_required';
                  const sources = Array.isArray(msg.sources) ? msg.sources : [];

                  // Render đặc biệt cho yêu cầu đăng nhập
                  if (isLoginRequired) {
                    const mainChatbotUrl = import.meta.env.VITE_MAIN_CHATBOT_URL || 'http://localhost:5173';
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3, type: 'spring', bounce: 0.3 }}
                        className="flex w-full justify-start"
                      >
                        <div className="max-w-[92%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed shadow-sm bg-white/80 text-gray-800 rounded-bl-sm border border-amber-200/70 backdrop-blur-md">
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                              <Lock className="w-4 h-4 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-gray-800 mb-0.5">Yêu cầu đăng nhập</p>
                              <p className="text-[12.5px] text-gray-600 leading-relaxed">{msg.text}</p>
                            </div>
                          </div>
                          <a
                            href={`${mainChatbotUrl}/loginprivate`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500 active:scale-[0.98] transition-all shadow-sm text-[12.5px] font-semibold"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            Đăng nhập
                          </a>
                        </div>
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3, type: 'spring', bounce: 0.3 }}
                      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-br-sm shadow-md'
                          : 'bg-white/80 text-gray-800 rounded-bl-sm border border-gray-200/50 backdrop-blur-md'
                      }`}>
                        {isUser ? (
                          <span className="whitespace-pre-wrap">{msg.text}</span>
                        ) : (
                          <>
                            {/* Markdown content */}
                            <div className="text-gray-800">
                              <ReactMarkdown components={markdownComponents}>{msg.text}</ReactMarkdown>
                            </div>

                            {/* Document citations */}
                            {sources.length > 0 && (
                              <div className="mt-3 pt-2.5 border-t border-gray-200/60">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                  <FileText className="w-3 h-3" /> Tài liệu tham khảo
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {sources.map((src) => (
                                    <a
                                      key={src.document_id}
                                      href={`${effectiveApiUrl.replace(/\/$/, '')}/knowledge/documents/${src.document_id}/public-view`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 text-[11px] font-medium hover:bg-blue-100 hover:border-blue-300 transition-colors"
                                    >
                                      <FileText className="w-3 h-3" />
                                      {src.file_name || `Tài liệu #${src.document_id}`}
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Copy button */}
                            <CopyButton text={msg.text} />
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Streaming partial bubble */}
              {partial && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm bg-white/80 text-gray-800 rounded-bl-sm border border-gray-200/50 backdrop-blur-md">
                    <div className="text-gray-800 inline">
                      <ReactMarkdown components={markdownComponents}>{partial}</ReactMarkdown>
                    </div>
                    <span className="inline-block w-1.5 h-3 bg-blue-500 animate-pulse ml-1 align-baseline rounded-sm" />
                  </div>
                </motion.div>
              )}

              {/* Loading dots (before any chunk arrives) */}
              {isLoading && !partial && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/80 border border-gray-200/50 backdrop-blur-md rounded-2xl rounded-bl-sm px-4 py-3.5 flex items-center gap-1.5 shadow-sm">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -5, 0], scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2, ease: 'easeInOut' }}
                        className="w-1.5 h-1.5 bg-gradient-to-t from-blue-400 to-indigo-400 rounded-full"
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Error state */}
              {hasError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-red-50 text-red-600 border border-red-200 rounded-bl-sm">
                    Kết nối bị gián đoạn. Vui lòng thử lại.
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Wrapper */}
            <div className="px-4 pb-4">
              <div className="relative flex flex-col bg-white/70 backdrop-blur-md border border-gray-200/50 focus-within:border-blue-400 focus-within:bg-white/95 rounded-2xl transition-all duration-300 overflow-visible shadow-inner">
                {/* Input Section */}
                <div className="relative">
                  <textarea
                    value={message}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-transparent border-none outline-none resize-none text-[15px] font-normal leading-relaxed min-h-[60px] text-gray-800 placeholder-gray-400 scrollbar-none"
                    placeholder="Bạn muốn khám phá điều gì hôm nay? Hãy hỏi bất cứ thứ gì..."
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-2xl"
                    style={{ background: 'linear-gradient(to top, rgba(255, 255, 255, 0.9), transparent)' }}
                  ></div>
                </div>

                {/* Controls Section */}
                <div className="px-3 pb-3 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Audience Selection */}
                      <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200">
                        {audiences.map((audience) => (
                          <button
                            key={audience.dbId || audience.id}
                            onClick={() => setSelectedAudience(audience)}
                            className={`group relative p-2 bg-transparent border-none rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:-rotate-3 transform ${
                              selectedAudience?.id === audience.id 
                                ? `${audience.color?.active || 'text-blue-600 bg-white ring-blue-200'} shadow-sm ring-1` 
                                : `text-gray-500 ${audience.color?.hover || 'hover:text-blue-600 hover:bg-blue-50'}`
                            }`}
                          >
                            <audience.icon className="w-4 h-4 transition-all duration-300 group-hover:scale-110" />
                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:-translate-y-1 shadow-lg border border-gray-200 backdrop-blur-sm z-50">
                              {audience.label}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Intent Selection moved to footer */}

                      {/* Voice Button */}
                      <button className="group relative p-2.5 bg-transparent border border-gray-300 rounded-lg cursor-pointer transition-all duration-300 text-gray-500 hover:text-blue-600 hover:bg-gray-200 hover:scale-110 hover:rotate-2 transform hover:border-blue-500/30">
                        <Mic className="w-4 h-4 transition-all duration-300 group-hover:scale-125 group-hover:-rotate-3" />
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:-translate-y-1 shadow-lg border border-gray-200 backdrop-blur-sm">
                          Nhập bằng giọng nói
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                        </div>
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Character Counter */}
                      <div className="text-xs font-medium text-gray-500">
                        <span>{charCount}</span>/<span className="text-gray-400">{maxChars}</span>
                      </div>

                      {/* Send Button */}
                      <button
                        onClick={() => handleSend()}
                        disabled={isLoading || !message.trim()}
                        className={`group relative p-3 border-none rounded-xl cursor-pointer transition-all duration-300 text-white shadow-lg transform ${
                          isLoading || !message.trim()
                            ? 'bg-gray-300 cursor-not-allowed opacity-60'
                            : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 hover:scale-110 hover:shadow-blue-500/30 hover:shadow-xl active:scale-95 hover:-rotate-2'
                        }`}
                      >
                        <Send className="w-5 h-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:rotate-12 group-hover:scale-110" />

                        {/* Animated background glow */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-lg transform scale-110"></div>

                        {/* Ripple effect on click */}
                        <div className="absolute inset-0 rounded-xl overflow-hidden">
                          <div className="absolute inset-0 bg-white/20 transform scale-0 group-active:scale-100 transition-transform duration-200 rounded-xl"></div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Footer Info / Intent Selection */}
                  <div className="flex items-center mt-3 pt-3 border-t border-gray-200 gap-6">
                    {intents.length > 0 && (
                      <motion.div 
                        key={selectedAudience?.id || 'intent-group'}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          Lĩnh vực
                        </span>
                        <div className="relative">
                          <button
                            onClick={() => setIsIntentMenuOpen(!isIntentMenuOpen)}
                            className={`flex items-center gap-1.5 p-1.5 rounded-lg border transition-colors ${
                              selectedIntent 
                                ? 'bg-blue-50 text-blue-600 border-blue-200' 
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            <Info className="w-3 h-3" />
                            <span className="text-[11px] font-medium max-w-[120px] truncate">
                              {selectedIntent ? selectedIntent.intent_name : "Tất cả"}
                            </span>
                            <ChevronDown className="w-3 h-3" />
                          </button>

                        {isIntentMenuOpen && (
                          <div className="absolute bottom-full left-0 mb-2 w-56 rounded-xl border border-gray-200 bg-white shadow-xl p-1.5 z-50 max-h-60 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            <button
                              onClick={() => {
                                setSelectedIntent(null);
                                setIsIntentMenuOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-2 rounded-lg text-[12px] transition-colors ${!selectedIntent ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                              Chung / Tất cả
                            </button>
                            {intents.map((intent) => (
                              <button
                                key={intent.intent_id}
                                onClick={() => {
                                  setSelectedIntent(intent);
                                  setIsIntentMenuOpen(false);
                                }}
                                className={`w-full text-left px-2.5 py-2 rounded-lg text-[12px] transition-colors ${selectedIntent?.intent_id === intent.intent_id ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                              >
                                <span className="block truncate">{intent.intent_name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Overlay */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.03), transparent, rgba(37, 99, 235, 0.03))'
              }}
            ></div>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes ping {
          75%, 100% {
            transform: scale(1.1);
            opacity: 0;
          }
        }
        
        .floating-ai-button:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 0 30px rgba(139, 92, 246, 0.9), 0 0 50px rgba(124, 58, 237, 0.7), 0 0 70px rgba(109, 40, 217, 0.5);
        }
      `}</style>
    </div>
  );
};

export { FloatingAiAssistant };
