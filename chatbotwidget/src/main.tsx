import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { FloatingAiAssistant } from './components/ui/glowing-ai-chat-assistant'

// --- 1. LOGIC XÁC ĐỊNH URL VẠN NĂNG ---
// Sử dụng URL này để lấy origin chính xác dù file bị đổi tên hay nằm trong sub-folder
const currentJsUrl = import.meta.url;
const serverBaseUrl = new URL(currentJsUrl).origin;

// Đảm bảo không có dấu // thừa nếu serverBaseUrl có dấu / ở cuối
const API_URL = `${serverBaseUrl.replace(/\/$/, '')}/api`;

const WS_PROTOCOL = serverBaseUrl.startsWith('https') ? 'wss' : 'ws';
// Tạo WS_URL chuẩn chỉ
const WS_URL = `${serverBaseUrl.replace(/^https?/, WS_PROTOCOL).replace(/\/$/, '')}/api/chat/ws/chat`;

// Xuất ra để các component bên trong có thể dùng (nếu cần)
export { API_URL, WS_URL };

// --- 2. CẤU CẤU TRÚC SHADOW DOM ---
const WIDGET_ID = 'ai-chatbot-widget-root';
let host = document.getElementById(WIDGET_ID);
if (!host) {
  host = document.createElement('div');
  host.id = WIDGET_ID;
  document.body.appendChild(host);
}

let shadow = host.shadowRoot;
if (!shadow) {
  shadow = host.attachShadow({ mode: 'open' });
}

let rootDiv = shadow.getElementById('react-root');
if (!rootDiv) {
  rootDiv = document.createElement('div');
  rootDiv.id = 'react-root';
  shadow.appendChild(rootDiv);
}

const root = createRoot(rootDiv);

// --- 3. RENDER LOGIC ---
if (import.meta.env.DEV) {
  // --- CHẠY Ở LOCALHOST (NPM RUN DEV) ---
  const syncStyles = () => {
    shadow.querySelectorAll('style[data-vite-dev]').forEach(s => s.remove());
    const styles = document.querySelectorAll('style');
    styles.forEach(style => {
      const clone = style.cloneNode(true);
      (clone as HTMLElement).setAttribute('data-vite-dev', 'true');
      shadow.appendChild(clone);
    });
  };

  syncStyles();
  const observer = new MutationObserver(() => syncStyles());
  observer.observe(document.head, { childList: true, subtree: true });

  root.render(
    <StrictMode>
      {/* Truyền URL vào props để component bên trong sử dụng */}
      <FloatingAiAssistant apiUrl={API_URL} wsUrl={WS_URL} />
    </StrictMode>,
  );
} else {
  // --- CHẠY KHI DEPLOY (TRÊN WEB TRƯỜNG) ---
  const cssUrl = currentJsUrl.replace(/\.js$/, '.css');
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = cssUrl;

  link.onload = () => {
    root.render(
      <StrictMode>
        <FloatingAiAssistant apiUrl={API_URL} wsUrl={WS_URL} />
      </StrictMode>
    );
  };

  link.onerror = () => {
    console.error("Không tìm thấy file CSS tại:", cssUrl);
    root.render(<FloatingAiAssistant apiUrl={API_URL} wsUrl={WS_URL} />);
  };

  shadow.appendChild(link);
}