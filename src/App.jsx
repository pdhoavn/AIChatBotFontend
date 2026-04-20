import React, { useEffect } from 'react';
import { BrowserRouter } from "react-router-dom";
import "./styles/index.css";
import Router from "./router/Router.jsx";
import { AuthProvider } from "./contexts/Auth";
import { NotificationProvider } from "./contexts/NotificationContext";
import { v4 as uuidv4 } from 'uuid';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  useEffect(() => {
    // 1. Kiểm tra xem trong kho (LocalStorage) đã có vé chưa
    let currentSessionId = localStorage.getItem('guest_session_id');

    // 2. Nếu chưa có (nghĩa là khách mới tinh) -> Tạo vé mới
    if (!currentSessionId) {
      currentSessionId = uuidv4();
      localStorage.setItem('guest_session_id', currentSessionId);
    }
    
  }, []);
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Router />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}