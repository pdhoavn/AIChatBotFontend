// src/components/admission/chat/useWebSocket.js
import { useRef, useEffect, useState } from "react";
import { API_CONFIG } from "../../../config/api.js";

export function useWebSocket(selectedSessionId, onMessageReceived, reloadToken = 0) {
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef(null);
  const callbackRef = useRef(onMessageReceived);

  // luôn giữ callback mới nhất
  useEffect(() => {
    callbackRef.current = onMessageReceived;
  }, [onMessageReceived]);

  const sendMessage = (userId, message) => {
    if (!message || !message.trim()) return false;
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;

    const payload = {
      sender_id: parseInt(userId, 10),
      message: message.trim(),
    };

    try {
      ws.send(JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  };

  const disconnect = () => {
    const ws = wsRef.current;
    if (ws) {
      try {
        ws.close();
      } catch {}
      wsRef.current = null;
    }
    setIsConnected(false);
  };

  useEffect(() => {
    let isUnmounted = false;

    // nếu không có session -> đóng WS và thôi
    if (!selectedSessionId) {
      disconnect();
      return;
    }

    try {
      const wsBaseUrl = API_CONFIG.FASTAPI_BASE_URL.replace(/^http/, "ws");
      const wsUrl = `${wsBaseUrl}/live_chat/livechat/chat/${selectedSessionId}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isUnmounted) return;
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        if (isUnmounted) return;

        let data;
        try {
          data = JSON.parse(event.data);
        } catch {
          return;
        }

        if (data.event === "message") {
          const newMessage = {
            interaction_id: Date.now(),
            session_id: selectedSessionId,
            sender_id: data.sender_id,
            message_text: data.message,
            timestamp: data.timestamp,
            is_from_bot: false,
          };

          if (typeof callbackRef.current === "function") {
            callbackRef.current(newMessage);
          }
        }
      };

      ws.onerror = () => {
        if (isUnmounted) return;
        setIsConnected(false);
      };

      ws.onclose = () => {
        if (isUnmounted) return;
        wsRef.current = null;
        setIsConnected(false);
      };
    } catch {
      if (!isUnmounted) {
        setIsConnected(false);
      }
    }

    // cleanup khi đổi session hoặc unmount
    return () => {
      isUnmounted = true;
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {}
        wsRef.current = null;
      }
      setIsConnected(false);
    };
    // 🔑 mỗi lần sessionId HOẶC reloadToken đổi -> tạo WS mới
  }, [selectedSessionId, reloadToken]);

  return {
    isConnected,
    sendMessage,
    disconnect,
  };
}
