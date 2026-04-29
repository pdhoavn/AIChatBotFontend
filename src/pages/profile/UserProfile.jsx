// src/pages/private/UserProfile.jsx
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import banner from "@/assets/images/login-private.jpg";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/Auth";
// Removed: liveChat.ts imports - now using dedicated /live-chat page
import { liveChatAPI } from "@/services/fastapi";
import { toast } from "react-toastify";
import { useWebSocket } from "@/components/admission/chat/useWebSocket";
import { API_CONFIG } from "../../config/api.js";
import ReactMarkdown from "react-markdown";
import { Navigate } from "react-router-dom";



const API_BASE_URL = API_CONFIG.FASTAPI_BASE_URL;
const SAFARI_WS_CONNECT_DELAY_MS = 500;

function isSafariBrowser() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /safari/i.test(ua) && !/chrome|chromium|crios|fxios|edg/i.test(ua);
}

function buildWebSocketUrl(baseUrl, path) {
  const fallbackOrigin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost";
  const url = new URL(baseUrl || fallbackOrigin, fallbackOrigin);
  const isSecurePage =
    typeof window !== "undefined" && window.location.protocol === "https:";
  const isLoopback = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(
    url.hostname
  );

  url.protocol = url.protocol === "https:" || (isSecurePage && !isLoopback)
    ? "wss:"
    : "ws:";
  url.pathname = `${url.pathname.replace(/\/$/, "")}${path}`;
  url.search = "";
  url.hash = "";

  return url.toString();
}

const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const SidebarItem = ({ active, icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition ${
      active ? "bg-[#FFFDE7] text-[#facb01]" : "hover:bg-gray-50 text-gray-600"
    }`}
  >
    <span className="text-base">{icon}</span>
    <span>{label}</span>
  </button>
);


const LiveChatHistory = ({ user }) => {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);


  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm("Xoá phiên chat này khỏi lịch sử?")) return;

    try {
      // TÁI SỬ DỤNG API DELETE /chat/session/{id} giống chatbot
      await axios.delete(`${API_BASE_URL}/chat/session/${sessionId}`, {
        params: { user_id: user.id },
        headers: authHeaders(),
      });

      setSessions((prev) => {
        const filtered = prev.filter((s) => s.session_id !== sessionId);

        // Nếu đang xem chính phiên vừa xoá -> chọn phiên khác / clear
        if (selectedSessionId === sessionId) {
          const nextSelected = filtered[0]?.session_id ?? null;
          setSelectedSessionId(nextSelected);
          if (!nextSelected) {
            setMessages([]);
          }
        }

        return filtered;
      });
    } catch (err) {
      console.error("Failed to delete live session", err);
      toast.error("Không xoá được phiên, vui lòng thử lại.");
    }
  };


  // Lấy danh sách các phiên live chat của học sinh
  useEffect(() => {
    if (!user) return;

    const fetchSessions = async () => {
      try {
        setLoadingSessions(true);
        const res = await axios.get(
          `${API_BASE_URL}/live_chat/livechat/customer/${user.id}/sessions`,
          { headers: authHeaders() }
        );

        const data = res.data?.sessions || res.data || [];
        setSessions(data);

        if (data.length && !selectedSessionId) {
          setSelectedSessionId(data[0].session_id);
        }
      } catch (err) {
        setSessions([]);
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchSessions();
  }, [user, selectedSessionId]);

  // Lấy tin nhắn của phiên đang chọn
  useEffect(() => {
    if (!selectedSessionId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const res = await axios.get(
          `${API_BASE_URL}/live_chat/livechat/session/${selectedSessionId}/messages`,
          { headers: authHeaders() }
        );

        const msgs = res.data || [];
        const mapped = msgs.map((m) => ({
          interaction_id: m.interaction_id,
          sender_id: m.sender_id,
          message_text: m.message_text,
          timestamp: m.timestamp,
        }));

        setMessages(mapped);
      } catch (err) {
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedSessionId]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 min-h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Lịch sử chat với tư vấn viên
        </h2>
        {sessions.length > 0 && (
          <span className="text-xs text-gray-500">
            Tổng: {sessions.length} phiên
          </span>
        )}
      </div>

      {loadingSessions && (
        <p className="text-sm text-gray-500 mb-3">Đang tải danh sách phiên...</p>
      )}

      <div className="grid grid-cols-12 gap-4 flex-1">
        {/* Danh sách phiên */}
        <div className="col-span-12 md:col-span-4 border border-gray-200 rounded-xl bg-white max-h-[460px] overflow-y-auto">
          {sessions.length === 0 && !loadingSessions ? (
            <p className="text-xs text-gray-400 p-3">
              Bạn chưa có cuộc trò chuyện nào với tư vấn viên.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
{sessions.map((s) => (
<li
  key={s.session_id}
  className={`px-3 py-2 text-xs cursor-pointer hover:bg-gray-50 ${
    s.session_id === selectedSessionId ? "bg-yellow-50" : ""
  }`}
  onClick={() => setSelectedSessionId(s.session_id)}
>
  <div className="flex items-start justify-between gap-2">

    <div className="flex-1">
      <div className="font-semibold text-sm truncate">
        {s.last_message_preview || "Cuộc trò chuyện với tư vấn viên"}
      </div>

      <div className="text-[11px] text-gray-400 mt-0.5">
        {s.start_time &&
          new Date(s.start_time).toLocaleDateString("vi-VN")}
      </div>
    </div>

    <button
      type="button"
      className="text-[11px] text-red-500 flex-shrink-0"
      onClick={(e) => {
        e.stopPropagation();         
        handleDeleteSession(s.session_id);  
      }}
    >
      Xoá
    </button>
  </div>
</li>
))}
            </ul>
          )}
        </div>

        {/* Nội dung tin nhắn của phiên đã chọn */}
        <div className="col-span-12 md:col-span-8 border border-gray-200 rounded-xl bg-gray-50 max-h-[460px] overflow-y-auto p-3">
          {!selectedSessionId ? (
            <p className="text-xs text-gray-400 text-center mt-4">
              Hãy chọn một phiên bên trái để xem lại nội dung.
            </p>
          ) : loadingMessages ? (
            <p className="text-xs text-gray-400 text-center mt-4">
              Đang tải tin nhắn...
            </p>
          ) : messages.length === 0 ? (
            <p className="text-xs text-gray-400 text-center mt-4">
              Không có tin nhắn trong phiên này.
            </p>
          ) : (
            messages.map((msg) => {
              const isMyMessage = msg.sender_id === parseInt(user.id);
              return (
                <div
                  key={msg.interaction_id}
                  className={`flex ${
                    isMyMessage ? "justify-end" : "justify-start"
                  } mb-1`}
                >
                  <div
                    className={`px-3 py-1.5 max-w-[70%] rounded-xl text-xs ${
                      isMyMessage
                        ? "bg-[#facb01] text-white"
                        : "bg-white text-gray-800 border border-gray-200"
                    }`}
                  >
                    {msg.message_text}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};


const newConv = () => ({
  id: crypto.randomUUID(),
  title: "Cuộc trò chuyện mới",
  messages: [],
  rating: null,           
  createdAt: Date.now(),
  updatedAt: Date.now(),
});


const CHAT_RATING_KEY = "utc2_chatbot_session_ratings_v1";
const CHATBOT_PREFILL_KEY = "chatbot_prefill_message";


const loadRatings = () => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CHAT_RATING_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const loadStoredConvs = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CHAT_CONV_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch (e) {
    return null;
  }
};

const UserProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const [tab, setTab] = useState("profile");
  const location = useLocation();
  const [editing, setEditing] = useState(false);
  const [prefillSent, setPrefillSent] = useState(false);
const [sessionRatings, setSessionRatings] = useState(() => loadRatings());

 //LẤY ROLE TỪ PROFILE THAY VÌ TỪ TOKEN
  const roleName = (user?.role_name || user?.role || "").toLowerCase();
  const isStudent =
    roleName === "student" ||
    roleName === "parent" ||
    roleName === "customer";

// đọc query param ?tab=...
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const qpTab = params.get("tab");
  if (qpTab && ["profile", "chatbot", "consultant", "live_history", "transcript"].includes(qpTab)) {
    setTab(qpTab);
  }
}, [location.search]);

useEffect(() => {
  try {
    localStorage.setItem(CHAT_RATING_KEY, JSON.stringify(sessionRatings));
  } catch (e) {
  }
}, [sessionRatings]);


  // ====== HỌC BẠ ======
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState([]);

  const ACCEPTED = ["application/pdf", "image/jpeg", "image/png"];
  const MAX_MB = 10;

  const onPickFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    const valid = [];
    const errors = [];

    picked.forEach((file) => {
      if (!ACCEPTED.includes(file.type)) {
        errors.push(`File ${file.name} định dạng không hỗ trợ (PDF/JPG/PNG).`);
        return;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        errors.push(`File ${file.name}: vượt quá ${MAX_MB}MB.`);
        return;
      }
      valid.push(file);
    });

    if (errors.length) alert(errors.join("\n"));
    if (valid.length) setFiles((prev) => [...prev, ...valid]);
    e.target.value = "";
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadTranscript = async () => {
    if (!files.length) {
      alert("Vui lòng chọn tối thiểu 1 file.");
      return;
    }
    try {
      setUploading(true);
      const results = files.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
      }));
      setUploaded((prev) => [...prev, ...results]);
      setFiles([]);
      alert("Tải lên học bạ thành công!");
    } catch (e) {
      alert("Tải lên thất bại, thử lại sau.");
    } finally {
      setUploading(false);
    }
  };

// --- helper: build payload from scores state ---
const buildAcademicPayload = () => {
  const subjects = [...subjectsLeft, ...subjectsRight];
  const entries = subjects.map((subject) => {
    const s = scores[subject] || {};
    // normalize empty -> null so backend can ignore empty
    return {
      subject,
      grade_11: s["11"] ? String(s["11"]) : null,
      grade_12: s["12"] ? String(s["12"]) : null,
    };
  }).filter(e => e.grade_11 !== null || e.grade_12 !== null); // keep only filled subjects

  return {
    // adjust field names if backend expects different ones
    customer_id: user.id,
    entries, // array of { subject, grade_11, grade_12 }
  };
};

// --- Save academic scores ---
const saveAcademicScores = async (e) => {
  e?.preventDefault?.();

  const payload = {};

  Object.entries(SUBJECT_API_FIELDS).forEach(([label, apiField]) => {
    const s = scores[label] || {};
    const vRaw = s["12"]; // chỉ dùng Học kỳ 2

    if (vRaw !== undefined && vRaw !== "") {
      const n = parseFloat(vRaw);
      if (!Number.isNaN(n)) {
        payload[apiField] = n;
      }
    }
  });

  const filledSubjects = Object.keys(payload).length;
  if (filledSubjects < 6) {
    alert("Cần nhập tối thiểu 06 môn.");
    return;
  }

  setUploading(true);

  try {
    const res = await axios.post(
      `${API_BASE_URL}/academic-score/upload`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
      }
    );

    alert("Lưu học bạ thành công!");
  } catch (err) {
    alert("Lưu thất bại, vui lòng kiểm tra lại.");
  } finally {
    setUploading(false);
  }
};


// call once when tab/transcript visible or when user changes
useEffect(() => {
    if (!user) return;

    const fetchScores = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/academic-score/users/${user.id}/academic-scores`,
          { headers: authHeaders() }
        );

        const data = res.data;
        if (!data) return;

        // Map từ object BE
        const next = {};
Object.entries(SUBJECT_API_FIELDS).forEach(([label, apiField]) => {
  const v = data[apiField];
  if (v !== null && v !== undefined) {
    next[label] = {
      "12": v.toString(),  
    };
  }
});

        setScores(next);
      } catch (err) {
        const status = err?.response?.status;

        if (status === 404 || status === 500) {
          return;
        }
      }
    };

    fetchScores();
  }, [user]);

  useEffect(() => {
    return () => {
      uploaded.forEach((u) => u.preview && URL.revokeObjectURL(u.preview));
    };
  }, [uploaded]);

// mỗi conv = 1 ChatSession trong DB
// { id: session_id, title, createdAt, updatedAt, last_message_preview }
const [convs, setConvs] = useState([]);
const [activeId, setActiveId] = useState(null);
const activeConv = convs.find((c) => c.id === activeId) || null;
// message đang hiển thị của session active
const [messages, setMessages] = useState([]);

  const convsRef = useRef(convs);
  useEffect(() => {
    convsRef.current = convs;
  }, [convs]);
  const [chatSessionId, setChatSessionId] = useState(null);
  const chatSessionIdRef = useRef(null);

useEffect(() => {
  chatSessionIdRef.current = chatSessionId;
}, [chatSessionId]);

// CHATBOT – quản lý list phiên
useEffect(() => {
  if (tab !== "chatbot" || !user) return;

  const fetchSessions = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/chat/user/${user.id}/sessions`,
        { headers: authHeaders() }
      );
      const sessions = res.data?.sessions || [];

      setConvs((prev) => {
        const prevMap = new Map(prev.map((c) => [c.id, c]));
        return sessions.map((s) => {
          const old = prevMap.get(s.session_id);
          return {
            id: s.session_id,
title:
  old?.title ||
  s.last_message_preview ||   // dùng preview làm title
  "Cuộc trò chuyện",
            createdAt: s.start_time ? new Date(s.start_time).getTime() : Date.now(),
            updatedAt: s.last_message_time
              ? new Date(s.last_message_time).getTime()
              : (s.start_time ? new Date(s.start_time).getTime() : Date.now()),
            last_message_preview: s.last_message_preview || "",
          };
        });
      });

      if (sessions.length) {
        // nếu chưa có session đang chọn thì chọn cái mới nhất
        setActiveId((current) => current ?? sessions[0].session_id);
        setChatSessionId((current) => current ?? sessions[0].session_id);
      } else {
        // chưa có session nào -> tạo mới
        try {
          const resCreate = await axios.post(
            `${API_BASE_URL}/chat/session/create`,
            null,
            {
              params: { user_id: user.id, session_type: "chatbot" },
              headers: authHeaders(),
            }
          );
          const newId = resCreate.data.session_id;
          const newConv = {
            id: newId,
            title: "Cuộc trò chuyện mới",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            last_message_preview: "",
          };
          setConvs([newConv]);
          setActiveId(newId);
          setChatSessionId(newId);
        } catch (e) {
        }
      }
    } catch (err) {
    }
  };

  fetchSessions();
}, [tab, user]);

const [queueStatus, setQueueStatus] = useState('idle');
const [queueInfo, setQueueInfo] = useState(null);
const [sessionId, setSessionId] = useState(null);
const [liveMessages, setLiveMessages] = useState([]);
const [liveInput, setLiveInput] = useState('');
const [loading, setLoading] = useState(false);


useEffect(() => {
  if (tab !== "consultant" || !user) return;

  const bootstrapLiveChat = async () => {
    try {
      //Lấy danh sách phiên live chat của customer
      const res = await axios.get(
        `${API_BASE_URL}/live_chat/livechat/customer/${user.id}/sessions`,
        { headers: authHeaders() }
      );

      const sessions = res.data?.sessions || res.data || [];

      //Tìm phiên đang hoạt động
      const active = sessions.find(
        (s) =>
          s.status === "active" ||
          s.status === "chatting" ||
          s.is_active === true
      );

      if (!active) {
        // Không có phiên đang chat / đang chờ -> để trạng thái idle
        setSessionId(null);
        setQueueStatus("idle");
        setLiveMessages([]);
        return;
      }

      //Có phiên đang chat -> gắn lại vào FE
      setSessionId(active.session_id);
      setQueueStatus("chatting");

      //Load lại toàn bộ tin nhắn của phiên đó
      const msgRes = await axios.get(
        `${API_BASE_URL}/live_chat/livechat/session/${active.session_id}/messages`,
        { headers: authHeaders() }
      );

      const msgs = msgRes.data || [];
      const mapped = msgs.map((m) => ({
        interaction_id: m.interaction_id,
        sender_id: m.sender_id,
        message_text: m.message_text,
        timestamp: m.timestamp,
      }));

      setLiveMessages(mapped);
    } catch (err) {
      console.error("bootstrapLiveChat failed", err);

      setSessionId(null);
      setQueueStatus("idle");
      setLiveMessages([]);
    }
  };

  bootstrapLiveChat();
}, [tab, user]);




const customerIdRef = useRef(null);
useEffect(() => {
  if (user?.id) {
    customerIdRef.current = parseInt(user.id);
  }
}, [user]);

useEffect(() => {

  if (isAuthenticated) return;

  const customerId = customerIdRef.current;
  if (!customerId) return;

  if (queueStatus === "in_queue") {
    (async () => {
      try {
        await liveChatAPI.cancelQueueRequest(customerId);
      } catch (err) {
        console.error("Cancel queue on logout failed", err);
      } finally {
        setQueueStatus("idle");
        setQueueInfo(null);
      }
    })();
  }

          disconnect();             
        setSessionId(null);
        setLiveMessages([]);
}, [isAuthenticated]); 

// timeout hàng chờ + popup
const queueTimeoutRef = useRef(null);
const [showQueueTimeoutModal, setShowQueueTimeoutModal] = useState(false);

// popup đánh giá sau khi kết thúc phiên tư vấn viên
const [showLiveRatingModal, setShowLiveRatingModal] = useState(false);
const [liveRating, setLiveRating] = useState(0);

//Lịch sử chat với tư vấn viên
const [liveHistorySessions, setLiveHistorySessions] = useState([]);
const [selectedHistorySessionId, setSelectedHistorySessionId] = useState(null);
const [historyMessages, setHistoryMessages] = useState([]);
const lastSessionIdRef = useRef(null);
const handleMessageReceived = (newMsg) => {
  if (newMsg.event === "chat_ended") {
    disconnect();
    setQueueStatus("ended");
    setSessionId(null);
    setLiveMessages([]);
    setShowLiveRatingModal(true);    
    setLiveRating(0);
    toast.info("Chat session ended");
    return; 
  }

  setLiveMessages((prev) => [...prev, newMsg]);
};

const { isConnected, sendMessage: wsSendMessage, disconnect } = useWebSocket(sessionId, handleMessageReceived);

  useEffect(() => {
    chatSessionIdRef.current = chatSessionId;
  }, [chatSessionId]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [partialResponse, setPartialResponse] = useState("");
  const wsRef = useRef(null);
  const partialRef = useRef("");
  const [wsReady, setWsReady] = useState(false);

  // cập nhật messages của conversation đang active
const pushToActive = (msg) => {
  const currentId = chatSessionIdRef.current;
  if (!currentId) return;

  const isUser = msg.sender === "user";

  setConvs((prev) =>
    prev.map((c) => {
      if (c.id !== currentId) return c;

      const preview =
        msg.text.length > 50 ? msg.text.slice(0, 50) + "..." : msg.text;

      const isDefaultTitle =
        !c.title ||
        c.title === "Cuộc trò chuyện" ||
        c.title === "Cuộc trò chuyện mới";

      return {
        ...c,
        last_message_preview: preview,
        updatedAt: Date.now(),
        title: isUser && isDefaultTitle ? preview : c.title,
      };
    })
  );
};

  //set rating cho phiên đang active
const setRatingForActive = (value) => {
  if (!activeId) return;
  setConvs((prev) =>
    prev.map((c) =>
      c.id === activeId
        ? { ...c, rating: value, updatedAt: Date.now() }
        : c
    )
  );
};

const createConversation = async () => {
  if (!user) return;
  try {
    const res = await axios.post(
      `${API_BASE_URL}/chat/session/create`,
      null,
      {
        params: { user_id: user.id, session_type: "chatbot" },
        headers: authHeaders(),
      }
    );
    const newId = res.data.session_id;

    const newConv = {
      id: newId,
      title: "Cuộc trò chuyện mới",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      last_message_preview: "",
    };

    setConvs((prev) => [newConv, ...prev]);
    setActiveId(newId);
    setChatSessionId(newId);
    setMessages([]);
  } catch (err) {
    alert("Không tạo được phiên chat mới, thử lại sau.");
  }
};

const selectConversation = (id) => {
  setActiveId(id);
  setChatSessionId(id);      
};

useEffect(() => {
  if (tab !== "chatbot" || !user || !chatSessionId) {
    setMessages([]);
    return;
  }

  const fetchHistory = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/chat/session/${chatSessionId}/history`,
        { headers: authHeaders() }
      );
      const msgs = res.data?.messages || [];
      const mapped = msgs.map((m) => ({
        sender: m.is_from_bot ? "bot" : "user",
        text: m.message_text,
      }));
      setMessages(mapped);
    } catch (err) {
      setMessages([]);
    }
  };

  fetchHistory();
}, [tab, user, chatSessionId]);



 

const deleteConversation = async (id) => {
  if (!confirm("Xoá phiên chat này?")) return;

  try {
    await axios.delete(`${API_BASE_URL}/chat/session/${id}`, {
      params: { user_id: user.id },
      headers: authHeaders(),
    });

    setConvs((prev) => {
      const next = prev.filter((c) => c.id !== id);

      if (activeId === id) {
        const newActive = next[0] || null;
        setActiveId(newActive ? newActive.id : null);
        setChatSessionId(newActive ? newActive.id : null);  
        setMessages([]);
      }

      return next;
    });
  } catch (err) {
    alert("Không xoá được session, vui lòng thử lại.");
  }
};

  // ====== LIVE CHAT QUEUE ======
  const handleJoinQueue = async () => {
  if (!user) {
    toast.error("Please login first");
    return;
  }
  setLoading(true);
  try {
    const response = await liveChatAPI.joinQueue(parseInt(user.id));
    if (response.error) {
      let msg = "Cannot join queue";
      if (response.error === "no_officers_available") msg = "No admission officers online.";
      if (response.error === "customer_banned") msg = "Your account has been deactivated.";
      toast.error(msg);
      return;
    }
    setQueueInfo(response);
    setQueueStatus("in_queue");
    toast.success("Joined queue successfully!");
  } catch (err) {
    toast.error("Failed to join queue.");
  } finally {
    setLoading(false);
  }
};

const handleCancelQueue = async () => {
  if (!user) return;
  try {
    const response = await liveChatAPI.cancelQueueRequest(parseInt(user.id));
    if (response.error) return toast.error("Failed to cancel request");
    setQueueStatus("idle");
    setQueueInfo(null);
    toast.info("Queue request canceled");
  } catch {
    toast.error("Failed to cancel request");
  }
};

const handleEndLiveChat = async () => {
  if (!sessionId || !user) return;
  try {
    await liveChatAPI.endSession(sessionId, parseInt(user.id));
    disconnect();
    setQueueStatus("ended");
    setSessionId(null);
    setLiveMessages([]);
    setShowLiveRatingModal(true); //mở popup rating
    setLiveRating(0);
    toast.success("Chat session ended");
  } catch {
    toast.error("Failed to end session");
  }
};

const handleReconnectAfterTimeout = async () => {
  // đóng popup
  setShowQueueTimeoutModal(false);

  // nếu lỡ còn session thì kết thúc cho sạch
  if (sessionId && user) {
    try {
      await liveChatAPI.endSession(sessionId, parseInt(user.id));
    } catch (err) {
    } finally {
      disconnect();
      setSessionId(null);
      setLiveMessages([]);
    }
  }

  // reset trạng thái rồi join queue mới
  setQueueStatus("idle");
  setQueueInfo(null);
  handleJoinQueue();
};



const handleSendLiveMessage = (e) => {
  e.preventDefault();
  if (!liveInput.trim() || !sessionId || !user) return;
  const success = wsSendMessage(user.id, liveInput);
  if (success) setLiveInput("");
};

const handleChooseLiveRating = (value) => {
  setLiveRating(value);
};

const handleSubmitLiveRating = async () => {
  if (!liveRating) {
    toast.info("Vui lòng chọn số sao.");
    return;
  }

  if (!lastSessionIdRef.current) {
    toast.error("Không xác định được phiên chat.");
    return;
  }

  try {
    await axios.post(
      `${API_BASE_URL}/live_chat/livechat/session/rate`,
      null,
      {
        params: {
          session_id: lastSessionIdRef.current,
          rating: liveRating,
        },
        headers: authHeaders(),
      }
    );

    toast.success("Cảm ơn bạn đã đánh giá!");
  } catch (err) {
    toast.error("Gửi đánh giá thất bại.");
  } finally {
    setShowLiveRatingModal(false);
    setLiveRating(0);
    lastSessionIdRef.current = null; // reset cho phiên sau
  }
};

const handleSkipLiveRating = () => {
  setShowLiveRatingModal(false);
  setLiveRating(0);
};

  // ====== SSE CUSTOMER (queue + accepted + chat_ended) ======
useEffect(() => {
  if (
    !user ||
    (queueStatus !== "in_queue" && queueStatus !== "chatting")
  ) {
    return;
  }

  const token = localStorage.getItem("access_token") || "";
  const sseUrl = `${API_BASE_URL}/live_chat/livechat/sse/customer/${user.id}?token=${encodeURIComponent(token)}`;
  const eventSource = new EventSource(sseUrl);


  // Hàm xử lý chung cho mọi event SSE
  const handleSseData = (rawData, sseType) => {
    let data;
    try {
      data = JSON.parse(rawData);
    } catch (err) {
      return;
    }

    const ev = data.event || sseType; // ưu tiên field event trong JSON, fallback sang loại SSE

    if (ev === "accepted") {
      const newSessionId = data.session_id || data.data?.session_id;
      if (newSessionId) {
        setSessionId(newSessionId);
        setQueueStatus("chatting");
        toast.success("Connected to consultant!");
      }
    } else if (ev === "chat_ended") {
  const endedSessionId =
    data.session_id || data.data?.session_id;

  if (endedSessionId) {
    lastSessionIdRef.current = endedSessionId; // ✅ QUAN TRỌNG
  }

  disconnect();
  setQueueStatus("ended");
  setSessionId(null);
  setLiveMessages([]);
  setShowLiveRatingModal(true);
  setLiveRating(0);
  toast.info("Chat session ended");
}
  };

  // Trường hợp server dùng event: message (data.event = "accepted"/"chat_ended")
  eventSource.onmessage = (event) =>
    handleSseData(event.data, "message");

  // Trường hợp server dùng event: accepted / event: chat_ended
  eventSource.addEventListener("accepted", (event) =>
    handleSseData(event.data, "accepted")
  );
  eventSource.addEventListener("chat_ended", (event) =>
    handleSseData(event.data, "chat_ended")
  );


  return () => {
    eventSource.close();
  };
}, [user, queueStatus, disconnect]);


// ====== LỊCH SỬ LIVE CHAT ======
useEffect(() => {
  if (tab !== "consultant" || !user) return;

  const fetchLiveSessions = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/live_chat/livechat/customer/${user.id}/sessions`,
        { headers: authHeaders() }
      );

      const sessions = res.data?.sessions || res.data || [];
      setLiveHistorySessions(sessions);

      if (sessions.length && !selectedHistorySessionId) {
        setSelectedHistorySessionId(sessions[0].session_id);
      }
    } catch (err) {
      console.error("Failed to load live chat history sessions", err);
      setLiveHistorySessions([]);
    }
  };

  fetchLiveSessions();
}, [tab, user]);



// ====== lấy tin nhắn của phiên đang chọn ======
useEffect(() => {
  if (tab !== "consultant" || !selectedHistorySessionId) {
    setHistoryMessages([]);
    return;
  }

  const fetchHistoryMessages = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/live_chat/livechat/session/${selectedHistorySessionId}/messages`,
        { headers: authHeaders() }
      );

      const msgs = res.data || [];
      const mapped = msgs.map((m) => ({
        interaction_id: m.interaction_id,
        sender_id: m.sender_id,
        message_text: m.message_text,
        timestamp: m.timestamp,
      }));

      setHistoryMessages(mapped);
    } catch (err) {
       console.error("Failed to load live history messages", err);
      setHistoryMessages([]);
    }
  };

  fetchHistoryMessages();
}, [tab, selectedHistorySessionId]);



// Auto hủy hàng chờ sau 3 phút nếu chưa được nối
useEffect(() => {
  // chỉ set timeout khi đang trong hàng chờ
  if (queueStatus === "in_queue") {
    if (queueTimeoutRef.current) {
      clearTimeout(queueTimeoutRef.current);
    }

    queueTimeoutRef.current = setTimeout(async () => {

      try {
        if (user) {
          await liveChatAPI.cancelQueueRequest(parseInt(user.id));
        }
      } catch (err) {
      }

      setQueueStatus("timeout");
      setQueueInfo(null);
      setShowQueueTimeoutModal(true);
      toast.info("Các tư vấn viên đang bận, vui lòng thử kết nối lại.");
    }, 3 * 60 * 1000); // 3 phút
  } else {
    // rời khỏi trạng thái in_queue -> clear timeout
    if (queueTimeoutRef.current) {
      clearTimeout(queueTimeoutRef.current);
      queueTimeoutRef.current = null;
    }
  }

  // cleanup khi unmount
  return () => {
    if (queueTimeoutRef.current) {
      clearTimeout(queueTimeoutRef.current);
      queueTimeoutRef.current = null;
    }
  };
}, [queueStatus, user]);



  // ====== PROFILE ======
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    admissionScore: "",
    subjects: "",
    preferredMajor: "",   
    region: "",    
  });

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          return;
        }

        const res = await axios.get(`${API_BASE_URL}/profile/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

 const data = res.data;
const sp = data.student_profile || {};
const interest = sp.interest || {};   // ✅ lấy interest từ trong student_profile

const preferredMajor =
  interest.desired_major ||
  sp.preferred_major ||
  data.interest_desired_major ||
  "";

const riasecCode =
  sp.riasec_code ||
  sp.riasec_result?.result ||
  interest.riasec_code ||
  "";

setForm({
  fullName: data.full_name || "",
  email: data.email || user.email,
  phone: data.phone_number || "",
  subjects: sp.subjects || "",
  preferredMajor,              // sẽ là "design"
  region: interest.region || "", // sẽ là "student"
  riasecCode,
});
      } catch (error) {
      }
    };

    fetchProfile();
  }, [user]);

  // ====== WebSocket Chatbot (LLM) ======
  useEffect(() => {
  // nếu không ở tab chatbot hoặc chưa có user / session -> đóng WS
  if (tab !== "chatbot" || !user || !chatSessionId) {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    wsRef.current = null;
    setWsReady(false);
    setIsLoading(false);
    setPartialResponse("");
    partialRef.current = "";
    return;
  }

  let ws = null;
  const connectTimer = window.setTimeout(
    () => {
      // đã có session_id -> mở WS mới cho phiên đó
      const wsUrl = buildWebSocketUrl(API_BASE_URL, "/chat/ws/chat");
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            user_id: user.id,
            session_id: chatSessionIdRef.current,
          })
        );
        setWsReady(true);
      };

      ws.onmessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch (err) {
          return;
        }

        const ev = data.event || data.type;

        switch (ev) {
          case "session_created": {
            if (data.session_id) {
              setChatSessionId(data.session_id);
            }
            break;
          }

          case "chunk": {
            const chunk = data.content ?? data.text ?? data.message ?? "";
            setPartialResponse((prev) => {
              const updated = prev + chunk;
              partialRef.current = updated;
              return updated;
            });
            setIsLoading(true);
            break;
          }

          case "done": {
            const finalText = (partialRef.current || "").trim();
            if (finalText) {
              const botMsg = { sender: "bot", text: finalText };
              setMessages((prev) => [...prev, botMsg]);
              pushToActive(botMsg);
            }

            partialRef.current = "";
            setPartialResponse("");
            setIsLoading(false);
            break;
          }

          case "error": {
            const errText =
              data.message ||
              "Xin lỗi, đã có lỗi xảy ra trong quá trình xử lý câu hỏi. Bạn hãy thử lại sau hoặc thử một câu hỏi khác nhé.";
            const botMsg = { sender: "bot", text: errText };
            setMessages((prev) => [...prev, botMsg]);
            pushToActive(botMsg);
            setIsLoading(false);
            break;
          }

          default:
        }
      };

      ws.onclose = () => {
        setWsReady(false);
        setIsLoading(false);
        setPartialResponse("");
        partialRef.current = "";
      };
    },
    isSafariBrowser() ? SAFARI_WS_CONNECT_DELAY_MS : 0
  );

  return () => {
    window.clearTimeout(connectTimer);
    if (wsRef.current === ws) {
      wsRef.current = null;
    }
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  };
}, [tab, user, chatSessionId]);  


useEffect(() => {
  // chỉ chạy khi đang ở tab chatbot, đã login, có session & WS sẵn sàng
  if (
    tab !== "chatbot" ||
    !user ||
    !chatSessionId ||
    !wsReady ||
    prefillSent
  ) {
    return;
  }

  const raw = localStorage.getItem(CHATBOT_PREFILL_KEY);
  if (!raw) return;

  const text = raw;

  // hiển thị như tin nhắn user
  const userMsg = { sender: "user", text };
  setMessages((prev) => [...prev, userMsg]);
  pushToActive(userMsg);

  if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
    wsRef.current.send(
      JSON.stringify({
        message: text,
        user_id: user.id,
        session_id: chatSessionIdRef.current ?? chatSessionId,
      })
    );
  }

  setPrefillSent(true);
  localStorage.removeItem(CHATBOT_PREFILL_KEY);
}, [tab, user, wsReady, chatSessionId, prefillSent]);


  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeId) return;

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      alert(
        "Kết nối chatbot đã bị ngắt. Hãy đổi sang tab khác rồi quay lại Chatbot hoặc reload trang."
      );
      return;
    }

    const text = input.trim();
    const userMsg = { sender: "user", text };

    setMessages((prev) => [...prev, userMsg]);
    pushToActive(userMsg);

wsRef.current.send(
  JSON.stringify({
    message: text,
    user_id: user.id,
    session_id: chatSessionIdRef.current ?? null,
  })
);

    setInput("");
    setPartialResponse("");
    partialRef.current = "";
    setIsLoading(true);
  };

  // ====== Profile handlers, transcript... (giữ nguyên) ======
  const handleChange = (e) => {
    if (!editing) return;
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleAdmissionScoreChange = (e) => {
    if (!editing) return;
    let val = e.target.value;
    if (val === "") {
      setForm((p) => ({ ...p, admissionScore: "" }));
      return;
    }
    const num = Number(val);
    if (Number.isNaN(num)) return;
    const clamped = Math.max(0, Math.min(30, num));
    setForm((p) => ({ ...p, admissionScore: clamped }));
  };

  const onSave = async (e) => {
    e?.preventDefault?.();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email)) {
      alert("Vui lòng nhập đúng định dạng email.");
      return;
    }
    const phonePattern = /^0\d{9}$/;
    if (!phonePattern.test(form.phone)) {
      alert("Số điện thoại phải bắt đầu bằng 0 và gồm 10 chữ số.");
      return;
    }
    // if (
    //   form.admissionScore === "" ||
    //   Number.isNaN(Number(form.admissionScore)) ||
    //   Number(form.admissionScore) > 30 ||
    //   Number(form.admissionScore) < 0
    // ) {
    //   alert("Admission score chỉ được nhập số từ 0 đến 30.");
    //   return;
    // }

    try {
      alert("Profile saved!");
      setEditing(false);
    } catch (error) {
      alert("Cập nhật thất bại!");
    }
  };

  const onCancel = () => setEditing(false);

  const subjectsLeft = [
    "Toán học(*)",
    "Ngoại ngữ",
    "Hóa học",
    "Lịch sử",
  ];

  const subjectsRight = [
    "Ngữ văn(*)",
    "Vật lý",
    "Sinh học",
    "Địa lý",
  ];

    const SUBJECT_API_FIELDS = {
    "Toán học(*)": "math",
    "Ngữ văn(*)": "literature",
    "Ngoại ngữ": "english",
    "Vật lý": "physics",
    "Hóa học": "chemistry",
    "Sinh học": "biology",
    "Lịch sử": "history",
    "Địa lý": "geography",
  };

  const [scores, setScores] = useState({});

  const handleScoreChange = (subject, grade, rawValue) => {
    let value = rawValue;
    value = value.replace(/[^0-9.]/g, "");
    const digits = value.replace(/\./g, "");
    if (digits.length > 2) value = digits.slice(0, 2);

    if (/^[0-9]{2}$/.test(value)) {
      const intVal = parseInt(value, 10);
      if (intVal > 10) value = (intVal / 10).toFixed(1);
    }

    if (/^[0-9]\.[0-9]$/.test(value)) {
      let f = parseFloat(value);
      if (f > 10) f = 10;
      value = f.toString();
    }

    let num = parseFloat(value);
    if (!isNaN(num) && num > 10) value = "10";
    value = value.match(/^\d{1,2}(\.\d{0,1})?/)?.[0] || "";

    setScores((prev) => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        [grade]: value,
      },
    }));
  };

const renderScoreInput = (subject) => (
  <input
    type="text"
    maxLength={4}
    value={scores?.[subject]?.["12"] ?? ""}
    onChange={(e) => handleScoreChange(subject, "12", e.target.value)}
    className="w-full px-3 py-2 rounded-md text-black placeholder-gray-400"
  />
);

  // Chưa đăng nhập -> bắt login
if (!isAuthenticated) {
  return (
    <>
      <Header />
      <div className="text-center py-10">
        Bạn cần đăng nhập để xem trang này.
      </div>
      <Footer />
    </>
  );
}

// 🟢 Đã đăng nhập nhưng profile chưa load xong -> chờ
if (isAuthenticated && !user) {
  return (
    <>
      <Header />
      <div className="text-center py-10">
        Đang tải thông tin tài khoản...
      </div>
      <Footer />
    </>
  );
}

// ❌ Đã đăng nhập, đã có user nhưng KO phải student/parent/customer -> đá ra
if (isAuthenticated && user && !isStudent) {
  return <Navigate to="/loginprivate" replace />;
}

  return (
    <>
      <Header />

      <div className="container mx-auto px-4 py-10">
        {/* Banner */}
        <div className="mb-8">
          <img
            src={banner}
            alt="Profile Banner"
            className="w-full h-[250px] object-cover rounded-2xl shadow-md"
          />
        </div>

        <h1 className="text-2xl md:text-3xl font-semibold mb-6">
          Chào mừng, <span className="text-[#facb01]">{form.fullName}</span>
        </h1>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="col-span-12 md:col-span-3">
            <div className="rounded-2xl border border-gray-200 p-4 sticky top-4">
              <SidebarItem
                active={tab === "profile"}
                icon="👤"
                label="Hồ sơ"
                onClick={() => setTab("profile")}
              />
              <SidebarItem
                active={tab === "chatbot"}
                icon="🤖"
                label="Chatbot"
                onClick={() => setTab("chatbot")}
              />
              <SidebarItem
                active={tab === "consultant"}
                icon="💼"
                label="Tư vấn"
                onClick={() => setTab("consultant")}
              />
              <SidebarItem
              active={tab === "live_history"}
              icon="📜"
              label="Lịch sử chat"
              onClick={() => setTab("live_history")}
              />
              <SidebarItem
                active={tab === "transcript"}
                icon="📄"
                label="Học bạ"
                onClick={() => setTab("transcript")}
              />
              <div className="mt-6 text-xs text-gray-400 px-2">Help</div>
            </div>
          </aside>

          {/* RIGHT CONTENT */}
          <section className="col-span-12 md:col-span-9">
            {/* PROFILE TAB */}
            {tab === "profile" && (
              <div className="rounded-2xl overflow-hidden border border-gray-200">
                <div className="h-14 bg-[#facb01]" />
                <div className="p-6">
                  {/* name + email */}
                  <div className="flex items-end gap-4 mb-6 -mt-2">
                    <div className="pb-1">
                      <div className="font-semibold">{form.fullName}</div>
                      <div className="text-sm text-gray-500">{form.email}</div>
                    </div>
                    <div className="pb-1 flex-1 flex justify-end">
                      <Link
                        to="/riasec"
                        className="shrink-0 whitespace-nowrap inline-flex items-center gap-2
               px-3 py-1.5 rounded-md text-xs bg-[#facb01] text-white hover:opacity-90"
                        title="Làm bài trắc nghiệm RIASEC"
                      >
                        RIASEC
                      </Link>
                    </div>
                  </div>

                  <form
                    onSubmit={onSave}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                  >
                    {/* Họ tên */}
                    <div>
                      <label className="text-sm text-gray-500">Họ và tên</label>
                      <input
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        disabled={!editing}
                        className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#facb01]"
                      />
                    </div>

                    {/* Giới tính */}
                    {/* <div>
                      <label className="text-sm text-gray-500">Gender</label>
                      <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        disabled={!editing}
                        className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#facb01] bg-white"
                      >
                        {GENDERS.map((g) => (
                          <option key={g.value} value={g.value}>
                            {g.label}
                          </option>
                        ))}
                      </select>
                    </div> */}

                    {/* Ngày sinh */}
                    {/* <div>
                      <label className="text-sm text-gray-500">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={form.dob}
                        onChange={handleChange}
                        disabled={!editing}
                        className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#facb01]"
                      />
                    </div> */}

                    {/* Email */}
                    <div>
                      <label className="text-sm text-gray-500">Email</label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        disabled={!editing}
                        className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#facb01]"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="text-sm text-gray-500">
                        Số điện thoại
                      </label>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        disabled={!editing}
                        className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#facb01]"
                      />
                    </div>

                    {/* Address */}
                    {/* <div>
                      <label className="text-sm text-gray-500">Address</label>
                      <input
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        disabled={!editing}
                        className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#facb01]"
                      />
                    </div> */}

                    {/* Trường */}
                    {/* <div>
                      <label className="text-sm text-gray-500">
                        High School
                      </label>
                      <input
                        name="school"
                        value={form.school}
                        onChange={handleChange}
                        disabled={!editing}
                        className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#facb01]"
                      />
                    </div> */}

                    {/* Lớp/Khối */}
                    {/* <div>
                      <label className="text-sm text-gray-500">Grade</label>
                      <select
                        name="grade"
                        value={form.grade}
                        onChange={handleChange}
                        disabled={!editing}
                        className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#facb01] bg-white"
                      >
                        {GRADES.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div> */}

                    {/* Điểm xét tuyển */}
                    {/* <div>
                      <label className="text-sm text-gray-500">
                        Admission score
                      </label>
                      <input
                        name="admissionScore"
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        min="0"
                        max="30"
                        value={form.admissionScore}
                        onChange={handleAdmissionScoreChange}
                        disabled={!editing}
                        className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#facb01]"
                      />
                    </div> */}

                    {/* Tổ hợp môn */}
                    {/* <div>
                      <label className="text-sm text-gray-500">
                        Combination of 3 subjects
                      </label>
                      <select
                        name="subjects"
                        value={form.subjects}
                        onChange={handleChange}
                        disabled={!editing}
                        className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm 
               focus:outline-none focus:ring-2 focus:ring-[#facb01] bg-white"
                      >
                        <option value="">Chọn tổ hợp</option>
                        <option value="A00">A00 - Toán, Lý, Hóa</option>
                        <option value="A01">A01 - Toán, Lý, Anh</option>
                        <option value="B00">B00 - Toán, Hóa, Sinh</option>
                        <option value="C00">C00 - Văn, Sử, Địa</option>
                        <option value="D01">D01 - Toán, Văn, Anh</option>
                        <option value="D07">D07 - Toán, Hóa, Anh</option>
                        <option value="D90">D90 - Toán, Anh, KHTN</option>
                      </select>
                    </div> */}

                    {/* Ngành mong muốn */}
                    <div>
                      <label className="text-sm text-gray-500">
                        Ngành mong muốn 
                      </label>
                      <select
                        name="preferredMajor"
                        value={form.preferredMajor}
                        onChange={handleChange}
                        disabled={!editing}
                        className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm 
               focus:outline-none focus:ring-2 focus:ring-[#facb01] bg-white"
                      >
                        <option value="">Chọn ngành học</option>
                        <option value="software">Kỹ thuật phần mềm</option>
                        <option value="design">Thiết kế đồ họa</option>
                        <option value="ai">Trí tuệ nhân tạo</option>
                        <option value="security">An ninh mạng</option>
                        <option value="business">Kinh doanh số</option>
                        <option value="game">Thiết kế trò chơi</option>
                      </select>
                    </div>

                    {/* Khu vực (region) */}
<div>
  <label className="text-sm text-gray-500">Khu vực</label>
  <input
    name="region"
    value={form.region}
    onChange={handleChange}
    disabled={!editing}
    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm 
       focus:outline-none focus:ring-2 focus:ring-[#facb01]"
    placeholder="Ví dụ: HCM, HN, Miền Nam..."
  />
</div>

                    {/* Mã RIASEC */}
                    {/* <div>
                      <label className="text-sm text-gray-500">
                        RIASEC code
                      </label>
                      <input
                        name="riasecCode"
                        value={form.riasecCode}
                        onChange={handleChange}
                        disabled={!editing}
                        className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#facb01]"
                      />
                    </div> */}

                    {/* Actions */}
                    <div className="col-span-1 sm:col-span-2 flex items-center justify-center gap-3 mt-2">
                      {!editing ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setEditing(true);
                          }}
                          className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Sửa
                        </button>
                      ) : (
                        <>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600"
                          >
                            Lưu
                          </button>
                          <button
                            type="button"
                            onClick={onCancel}
                            className="px-5 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            )}

{/* CHATBOT TAB */}
{tab === "chatbot" && (
  <div className="rounded-2xl border border-gray-200 bg-white grid grid-cols-12 overflow-hidden min-h-[600px]">
    {/* LEFT: danh sách phiên */}
    <aside className="col-span-12 md:col-span-4 border-r border-gray-100 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-[#FFFDE7]">
        <div className="font-semibold text-[#facb01]">Đoạn chat</div>
        <button
          onClick={createConversation}
          className="px-3 py-1 rounded-md bg-[#facb01] text-white text-sm hover:opacity-90"
        >
          + Phiên mới
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-gray-100">
          {convs.map((c) => (
            <li
              key={c.id}
              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                c.id === activeId ? "bg-yellow-50" : ""
              }`}
              onClick={() => selectConversation(c.id)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="truncate font-medium">{c.title}</div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(c.id);
                    }}
                    className="text-xs text-red-600 hover:text-red-700"
                    title="Xoá"
                  >
                    Xoá
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(c.updatedAt).toLocaleDateString('vi-VN')}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>

    {/* RIGHT: khung chat */}
    <section className="col-span-12 md:col-span-8 flex flex-col">
      <div className="bg-[#facb01] text-white px-6 py-3 flex items-center justify-between">
        <div className="text-lg font-semibold">ChatBot GTVT</div>

        {activeConv && (
          <div className="flex items-center gap-1 text-sm">
            <span className="hidden sm:inline mr-2">Đánh giá phiên:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRatingForActive(star)}
                className="focus:outline-none"
              >
                <span
                  className={
                    star <= (activeConv.rating || 0)
                      ? "text-yellow-300"
                      : "text-white/50"
                  }
                >
                  ★
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {!messages.length ? (
          <p className="text-gray-400 text-center mt-10">
            Hãy bắt đầu trò chuyện…
          </p>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 max-w-[70%] rounded-xl text-sm ${
                  m.sender === "user"
                    ? "bg-[#facb01] text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
{m.sender === "bot" ? (
  <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
    <ReactMarkdown>{m.text}</ReactMarkdown>
  </div>
) : (
  m.text
)}
              </div>
            </div>
          ))
        )}

      {isLoading && (
  <div className="flex justify-start mt-1">
    <div className="px-4 py-2 max-w-[70%] rounded-xl text-sm bg-gray-200 text-gray-800">
      <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
      <span className="animate-pulse">▌</span>
      </div>

    </div>
  </div>
)}
      </div>

      <form
        onSubmit={handleSend}
        className="flex items-center gap-3 border-t border-gray-200 p-4"
      >
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSend(e);    
    }
  }}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#facb01]"
        />
        <button
          type="submit"
          disabled={!wsReady || !input.trim() || !activeId}
          className={`px-4 py-2 rounded-md text-white ${
            !wsReady || !input.trim() || !activeId
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#facb01] hover:opacity-90"
          }`}
        >
          {wsReady ? "Gửi" : "Đang kết nối..."}
        </button>
      </form>
    </section>
              </div>
            )}

{/* CONSULTANT TAB */}
{tab === "consultant" && (
  <div className="rounded-2xl border border-gray-200 bg-white flex flex-col min-h-[600px]">
    {/* Header */}
    <div className="bg-[#facb01] text-white px-6 py-3 flex items-center justify-between">
      <div className="text-lg font-semibold">
        Live chat với tư vấn viên
      </div>
      <div className="text-sm">
        Trạng thái:{" "}
        <span className="font-semibold">
          {queueStatus === "idle" && "Chưa bắt đầu"}
          {queueStatus === "in_queue" && "Đang trong hàng chờ"}
          {queueStatus === "chatting" && "Đang trò chuyện"}
          {queueStatus === "ended" && "Đã kết thúc"}
          {queueStatus === "timeout" && "Tư vấn viên đang bận"}
        </span>
      </div>
    </div>

    {/* Info hàng chờ / tư vấn viên */}
    <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap items-center gap-4 text-sm text-gray-700">
      {queueStatus === "idle" && (
        <>
          <p>
            Ấn nút dưới đây để vào hàng chờ và kết nối với tư vấn viên tuyển sinh.
          </p>
          <button
            onClick={handleJoinQueue}
            disabled={loading}
            className="ml-auto bg-[#facb01] text-white px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang vào hàng chờ..." : "Bắt đầu chat"}
          </button>
        </>
      )}

      {queueStatus === "in_queue" && (
        <>
          <p>
            Bạn đang trong hàng chờ…
            {queueInfo?.position != null && (
              <span> Vị trí hiện tại: {queueInfo.position}</span>
            )}
          </p>
          <button
            onClick={handleCancelQueue}
            className="ml-auto text-sm text-red-600 hover:underline"
          >
            Hủy yêu cầu
          </button>
        </>
      )}

      {queueStatus === "chatting" && sessionId && (
        <>
          <p>
            Đang trò chuyện với{" "}
            <span className="font-semibold">tư vấn viên tuyển sinh</span>
          </p>
          <span className="text-xs text-green-200">
            {isConnected ? "🟢 Đã kết nối" : "🔴 Mất kết nối, đang thử lại..."}
          </span>
          <button
            onClick={handleEndLiveChat}
            className="ml-auto text-sm text-red-600 hover:underline"
          >
            Kết thúc phiên
          </button>
        </>
      )}

      {queueStatus === "ended" && (
        <>
          <p>Phiên chat đã kết thúc. Bạn có thể bắt đầu lại nếu cần.</p>
          <button
            onClick={handleJoinQueue}
            className="ml-auto bg-[#facb01] text-white px-4 py-2 rounded-md hover:opacity-90"
          >
            Bắt đầu lại
          </button>
        </>
      )}
    </div>

    {/* KHUNG CHAT */}
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-3">
      {!liveMessages.length ? (
        <p className="text-gray-400 text-center mt-10">
          {queueStatus === "idle"
            ? "Chưa có cuộc hội thoại nào."
            : "Đang chờ tin nhắn..."}
        </p>
      ) : (
        liveMessages.map((msg, index) => {
          const isMyMessage = msg.sender_id === parseInt(user.id);
          return (
            <div
              key={msg.interaction_id || index}
              className={`flex ${
                isMyMessage ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 max-w-[70%] rounded-xl text-sm ${
                  isMyMessage
                    ? "bg-[#facb01] text-white"
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
              >
                {msg.message_text}
              </div>
            </div>
          );
        })
      )}
      
    </div>

    {/* INPUT */}
    <form
      onSubmit={handleSendLiveMessage}
      className="flex items-center gap-3 border-t border-gray-200 p-4"
    >
      <input
        type="text"
        placeholder={
          queueStatus === "chatting"
            ? "Nhập tin nhắn..."
            : "Hãy vào hàng chờ để bắt đầu chat..."
        }
        value={liveInput}
        onChange={(e) => setLiveInput(e.target.value)}
          onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSendLiveMessage(e);
    }
  }}
        disabled={queueStatus !== "chatting" || !isConnected}
        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#facb01] disabled:bg-gray-100"
      />
      <button
        type="submit"
        disabled={
          queueStatus !== "chatting" || !liveInput.trim() || !isConnected
        }
        className={`px-4 py-2 rounded-md text-white ${
          queueStatus !== "chatting" || !liveInput.trim() || !isConnected
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-[#facb01] hover:opacity-90"
        }`}
      >
        Gửi
      </button>
    </form>

{showQueueTimeoutModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
      <h2 className="text-lg font-semibold mb-2">
        Các tư vấn viên đang bận
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Các tư vấn viên đang bận, xin vui lòng thử kết nối lại sau ít phút.
      </p>
      <div className="flex justify-end gap-2">
        {/* <button
          type="button"
          onClick={() => setShowQueueTimeoutModal(false)}
          className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
        >
          Đóng
        </button> */}
        <button
          type="button"
          onClick={handleReconnectAfterTimeout}
          className="px-4 py-2 text-sm rounded-md bg-[#facb01] text-white hover:opacity-90"
        >
          Kết nối lại
        </button>
      </div>
    </div>
  </div>
)}

{showLiveRatingModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
      <h2 className="text-lg font-semibold mb-2">
        Đánh giá cuộc trò chuyện
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Bạn hài lòng thế nào với cuộc trò chuyện vừa rồi?
      </p>

      <div className="flex justify-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleChooseLiveRating(star)}
            className="text-2xl focus:outline-none"
          >
            <span
              className={
                star <= liveRating ? "text-yellow-400" : "text-gray-300"
              }
            >
              ★
            </span>
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={handleSkipLiveRating}
          className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
        >
          Bỏ qua
        </button>
        <button
          type="button"
          onClick={handleSubmitLiveRating}
          className="px-4 py-2 text-sm rounded-md bg-[#facb01] text-white hover:opacity-90"
        >
          Gửi đánh giá
        </button>
      </div>
    </div>
  </div>
)}

  </div>
)}


{/* LIVE CHAT HISTORY TAB */}
{tab === "live_history" && <LiveChatHistory user={user} />}


            {/* TRANSCRIPT TAB */}
            {tab === "transcript" && (
<div className="rounded-2xl border border-gray-200 bg-white p-6">
    <div className="bg-yellow-500 p-6 rounded-lg text-white">
      <p className="mb-6 text-sm">
        Cần nhập tối thiểu 06 môn cho cả bảng điểm, nếu điểm là số
        thập phân, sử dụng dấu chấm
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* LEFT */}
        <div>
          <div className="grid grid-cols-2 gap-4 font-semibold mb-3 text-white">
            <div>Môn học</div>
            <div className="text-center">Học kỳ</div>
          </div>

          <div>
            {subjectsLeft.map((subject) => (
              <div
                key={subject}
                className="grid grid-cols-2 gap-4 items-center mb-3"
              >
                <div className="font-semibold">{subject}</div>
                <div>{renderScoreInput(subject)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <div className="grid grid-cols-2 gap-4 font-semibold mb-3 text-white">
            <div>Môn học</div>
            <div className="text-center">Học kỳ</div>
          </div>

          <div>
            {subjectsRight.map((subject) => (
              <div
                key={subject}
                className="grid grid-cols-2 gap-4 items-center mb-3"
              >
                <div className="font-semibold">{subject}</div>
                <div>{renderScoreInput(subject)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-10">
        <button
          onClick={saveAcademicScores}
          className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-2xl px-16 py-3 rounded-full"
          disabled={uploading}
        >
          {uploading ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
    </div>
  </div>
            )}
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};
export default UserProfile;
