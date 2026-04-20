import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/Auth';
import { liveChatAPI } from '../../../services/fastapi';
import { toast } from 'react-toastify';

import { ActiveSessionsList } from './ActiveSessionsList';
import { ChatHeader } from './ChatHeader';
import { MessagesArea } from './MessagesArea';
import { MessageInput } from './MessageInput';
import { EmptyChat } from './EmptyChat';
import { LoadingView } from './LoadingView';
import { useWebSocket } from './useWebSocket';
import { StudentDetailModal } from '../StudentDetailModal';

export function LiveChatView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { sessionId: initialSessionId, officialId, queueId } = location.state || {};
  
  const [activeSessions, setActiveSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(initialSessionId);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [error, setError] = useState('');
  const [customerInfo, setCustomerInfo] = useState(null);

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [wsReloadToken, setWsReloadToken] = useState(0);
  const forceWsReconnect = () => setWsReloadToken((t) => t + 1);

  const handleShowStudentDetail = () => {
    console.log('handleShowStudentDetail called');
    console.log('customerInfo:', customerInfo);
    console.log('selectedSessionId:', selectedSessionId);
    console.log('activeSessions:', activeSessions);
    
    // Try to get customer ID from multiple sources
    let customerId = customerInfo?.id;
    
    // If not in customerInfo, try to get from current session
    if (!customerId && selectedSessionId) {
      const currentSession = activeSessions.find(s => s.session_id === selectedSessionId);
      console.log('currentSession:', currentSession);
      customerId = currentSession?.customer_id;
    }
    
    console.log('Final customerId:', customerId);
    
    if (customerId) {
      setSelectedStudentId(customerId);
      setShowStudentModal(true);
    } else {
      console.error('No customer ID found');
      toast.error('Không thể tải thông tin khách hàng');
    }
  };

  const handleMessageReceived = (newMessage) => {
    setMessages(prev => [...prev, newMessage]);
  };

  // const { isConnected, sendMessage: wsSendMessage, disconnect } = useWebSocket(selectedSessionId, handleMessageReceived);
const { isConnected, sendMessage: wsSendMessage, disconnect } =
  useWebSocket(selectedSessionId, handleMessageReceived, wsReloadToken);
  
  const loadActiveSessions = async () => {
    if (!user?.id) return;
    
    setSessionsLoading(true);
    try {
      
      const response = await liveChatAPI.getActiveSessions(parseInt(user.id));
      
      if (response && Array.isArray(response)) {
        setActiveSessions(response);

        if (!initialSessionId && response.length > 0) {
          setSelectedSessionId(response[0].session_id);
        }
      } else {
        setActiveSessions([]);
      }
    } catch (err) {
      setActiveSessions([]);

      if (err.response && err.response.status !== 404) {
        toast.error('Failed to load active sessions');
      }
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadSessionData = async () => {
    if (!selectedSessionId) return;
    
    try {
      const response = await liveChatAPI.getSessionMessages(selectedSessionId);
      
      if (response && Array.isArray(response)) {
        setMessages(response);

        const currentSession = activeSessions.find(s => s.session_id === selectedSessionId);
        if (currentSession && currentSession.customer_id) {
          setCustomerInfo({
            id: currentSession.customer_id,
            name: currentSession.customer_name || `Customer ${currentSession.customer_id}`,
            avatar: 'ST'
          });
        }
      } else {
        setMessages([]);
      }
    } catch (err) {
      setError('Failed to load message history');
      setMessages([]);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const success = wsSendMessage(user.id, newMessage);
    if (success) {
      setNewMessage('');
    } else {
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEndSession = async () => {
    if (!selectedSessionId) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to end this chat session? This action cannot be undone.'
    );
    
    if (!confirmed) return;
    
    try {
      await liveChatAPI.endSession(selectedSessionId, parseInt(user.id));
      
      disconnect();
      
      toast.success('Session ended successfully');

      setActiveSessions(prev => prev.filter(session => session.session_id !== selectedSessionId));

      const remainingSessions = activeSessions.filter(session => session.session_id !== selectedSessionId);
      if (remainingSessions.length > 0) {
        setSelectedSessionId(remainingSessions[0].session_id);
      } else {
        setSelectedSessionId(null);
        setMessages([]);
        setCustomerInfo(null);
      }
    } catch (err) {
      toast.error('Failed to end session');
    }
  };

  const handleSessionSelect = (sessionId) => {
    setSelectedSessionId(sessionId);
  };

  const handleGoToQueue = () => {
    navigate('/admission/request-queue');
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      
      if (!user?.id) {
        setError('User not authenticated. Please login again.');
        setLoading(false);
        return;
      }

      await loadActiveSessions();
      setLoading(false);
    };

    initialize();
  }, [user]);

  useEffect(() => {
    if (initialSessionId && user?.id) {
      loadActiveSessions();
    }
  }, [initialSessionId, user?.id]);

  useEffect(() => {
    const setupSession = async () => {
      if (!selectedSessionId) {
        setMessages([]);
        setCustomerInfo(null);
        return;
      }

      await loadSessionData();
    };

    setupSession();
  }, [selectedSessionId]);

useEffect(() => {
  const handleQueueUpdate = (event) => {
    loadActiveSessions();
  };

  const handleChatEnded = (event) => {
    const endedSessionId = event.detail?.session_id;
    if (!endedSessionId) return;

    setActiveSessions(prev =>
      prev.filter(session => session.session_id !== endedSessionId)
    );

    // Nếu phiên hiện tại bị end
    if (selectedSessionId === endedSessionId) {
      const remainingSessions = activeSessions.filter(
        session => session.session_id !== endedSessionId
      );
      if (remainingSessions.length > 0) {
        setSelectedSessionId(remainingSessions[0].session_id);
      } else {
        setSelectedSessionId(null);
        setMessages([]);
        setCustomerInfo(null);
      }
    } else if (selectedSessionId) {

      forceWsReconnect();
    }

    loadActiveSessions();
  };

  window.addEventListener('queueUpdate', handleQueueUpdate);
  window.addEventListener('chatEnded', handleChatEnded);

  return () => {
    window.removeEventListener('queueUpdate', handleQueueUpdate);
    window.removeEventListener('chatEnded', handleChatEnded);
  };
}, [selectedSessionId, activeSessions]);



// 🔁 Auto retry: nếu đang có session mà WS chưa connect -> 3s thử mở lại 1 lần
useEffect(() => {
  if (!selectedSessionId) return;
  if (isConnected) return;

  const intervalId = setInterval(() => {
    setWsReloadToken((t) => t + 1);
  }, 3000); // 3s thử lại 1 lần

  return () => clearInterval(intervalId);
}, [selectedSessionId, isConnected]);



  if (loading || error) {
    return (
      <LoadingView 
        isLoading={loading}
        error={error}
        onRetry={() => window.location.reload()}
        onGoToQueue={handleGoToQueue}
      />
    );
  }

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {}
      <ActiveSessionsList
        activeSessions={activeSessions}
        selectedSessionId={selectedSessionId}
        onSessionSelect={handleSessionSelect}
        onRefresh={loadActiveSessions}
        onGoToQueue={handleGoToQueue}
        isLoading={sessionsLoading}
      />

      {}
      {selectedSessionId ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <ChatHeader
            selectedSessionId={selectedSessionId}
            activeSessions={activeSessions}
            customerInfo={customerInfo}
            isConnected={isConnected}
            user={user}
            onEndSession={handleEndSession}
            onShowStudentDetail={handleShowStudentDetail}
          />

          <div className="flex-1 flex flex-col min-h-0">
            <MessagesArea
              messages={messages}
              userId={user.id}
              userName={user.name}
            />

            <MessageInput
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              onSendMessage={handleSendMessage}
              onKeyPress={handleKeyPress}
              isConnected={isConnected}
            />
          </div>
        </div>
      ) : (
        <EmptyChat onGoToQueue={handleGoToQueue} />
      )}
      
      {}
      <StudentDetailModal
        isOpen={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        userId={selectedStudentId}
      />
    </div>
  );
}