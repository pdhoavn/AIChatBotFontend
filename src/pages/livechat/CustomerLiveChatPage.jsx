import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/Auth';
import { liveChatAPI } from '../../services/fastapi';
import { toast } from 'react-toastify';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { API_CONFIG } from '../../config/api.js';

// Import the same WebSocket hook as admission officer
import { useWebSocket } from '../../components/admission/chat/useWebSocket';

export default function CustomerLiveChatPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [queueStatus, setQueueStatus] = useState('idle'); // idle, in_queue, chatting, ended
  const [queueInfo, setQueueInfo] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle WebSocket messages - SAME AS ADMISSION OFFICER
  const handleMessageReceived = (newMsg) => {
    setMessages(prev => [...prev, newMsg]);
  };

  // WebSocket connection - SAME AS ADMISSION OFFICER
  const { isConnected, sendMessage: wsSendMessage, disconnect } = useWebSocket(sessionId, handleMessageReceived);

  // Join queue
  const handleJoinQueue = async () => {
    if (!user) {
      toast.error('Please login first');
      return;
    }

    setLoading(true);
    try {
      const response = await liveChatAPI.joinQueue(parseInt(user.id));

      if (response.error) {
        let errorMsg = 'Cannot join queue';
        if (response.error === 'no_officers_available') {
          errorMsg = '⚠️ No admission officers are currently online. Please try again later.';
        } else if (response.error === 'customer_banned') {
          errorMsg = '⚠️ Your account has been deactivated. Please contact administrator.';
        }
        toast.error(errorMsg);
        return;
      }

      setQueueInfo(response);
      setQueueStatus('in_queue');
      toast.success('Joined queue successfully! Waiting for admission officer...');
    } catch (err) {
      toast.error('Failed to join queue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Cancel queue request
  const handleCancelQueue = async () => {
    if (!user) return;

    try {
      const response = await liveChatAPI.cancelQueueRequest(parseInt(user.id));
      
      if (response.error) {
        toast.error('Failed to cancel request');
        return;
      }

      setQueueStatus('idle');
      setQueueInfo(null);
      toast.info('Queue request canceled');
    } catch (err) {
      toast.error('Failed to cancel request');
    }
  };

  // End chat session
  const handleEndSession = async () => {
    if (!sessionId || !user) return;

    try {
      await liveChatAPI.endSession(sessionId, parseInt(user.id));
      
      disconnect();
      setQueueStatus('ended');
      setSessionId(null);
      setMessages([]);
      toast.success('Chat session ended');
    } catch (err) {
      toast.error('Failed to end session');
    }
  };

  // Send message - SAME AS ADMISSION OFFICER
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !sessionId || !user) return;

    const success = wsSendMessage(user.id, newMessage);
    if (success) {
      setNewMessage('');
    }
  };

  // Load messages when session starts - SAME AS ADMISSION OFFICER
  const loadMessages = async () => {
    if (!sessionId) return;

    try {
      const response = await liveChatAPI.getSessionMessages(sessionId);

      if (response && Array.isArray(response)) {
        setMessages(response);
      }
    } catch (err) {
    }
  };

  // SSE - Listen for "accepted" event
  useEffect(() => {
    if (!user || queueStatus !== 'in_queue') return;

    const token = localStorage.getItem('access_token') || '';
    const sseUrl = `${API_CONFIG.FASTAPI_BASE_URL}/live_chat/livechat/sse/customer/${user.id}?token=${encodeURIComponent(token)}`;

    const eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        const eventType = data.event || data.data?.event;

        if (eventType === 'accepted') {
          const newSessionId = data.session_id || data.data?.session_id;
          
          if (newSessionId && typeof newSessionId === 'number') {
            setSessionId(newSessionId);
            setQueueStatus('chatting');
            toast.success('Your request has been accepted! Starting chat...');
          } else {
            toast.error('Failed to start chat session - invalid session ID');
          }
        } else if (eventType === 'queue_canceled') {
          setQueueStatus('idle');
          setQueueInfo(null);
        } else if (eventType === 'chat_ended') {
          disconnect();
          setQueueStatus('ended');
          setSessionId(null);
          setMessages([]);
          toast.info('Chat session has ended');
        }
      } catch (err) {
      }
    };

    eventSource.onerror = (err) => {
    };

    return () => {
      eventSource.close();
    };
  }, [user, queueStatus]);

  // Load messages when session becomes active
  useEffect(() => {
    if (sessionId && queueStatus === 'chatting') {
      // Add small delay to ensure WebSocket connects first
      const timer = setTimeout(() => {
        loadMessages();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [sessionId, queueStatus]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#EB5A0D] text-white px-6 py-4">
            <h1 className="text-2xl font-bold">Live Chat with Admission Consultant</h1>
            <p className="text-sm opacity-90 mt-1">
              Status: {queueStatus === 'idle' && 'Not started'}
              {queueStatus === 'in_queue' && '⏳ Waiting in queue...'}
              {queueStatus === 'chatting' && '💬 Chatting'}
              {queueStatus === 'ended' && 'Ended'}
            </p>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {/* Idle State */}
            {queueStatus === 'idle' && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💬</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Connect with an Admission Consultant
                </h2>
                <p className="text-gray-600 mb-6">
                  Click the button below to join the queue and chat with our admission team
                </p>
                <button
                  onClick={handleJoinQueue}
                  disabled={loading}
                  className="bg-[#EB5A0D] text-white px-8 py-3 rounded-lg hover:bg-[#d94f0a] disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {loading ? 'Joining...' : 'Start Chat'}
                </button>
              </div>
            )}

            {/* In Queue State */}
            {queueStatus === 'in_queue' && (
              <div className="text-center py-12">
                <div className="animate-pulse text-6xl mb-4">⏳</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Waiting for Admission Officer...
                </h2>
                <p className="text-gray-600 mb-6">
                  You are in the queue. An admission officer will accept your request shortly.
                </p>
                {queueInfo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto mb-4">
                    <p className="text-sm text-blue-800">
                      Queue ID: <span className="font-semibold">{queueInfo.queue_id}</span>
                    </p>
                  </div>
                )}
                <button
                  onClick={handleCancelQueue}
                  className="text-red-600 hover:text-red-700 font-semibold underline"
                >
                  Cancel Request
                </button>
              </div>
            )}

            {/* Chatting State */}
            {queueStatus === 'chatting' && sessionId && (
              <div className="flex flex-col h-[600px]">
                {/* Chat Header */}
                <div className="border-b pb-3 mb-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-800">Chat Session #{sessionId}</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                      </span>
                      {!isConnected && (
                        <span className="text-gray-500 text-xs">(Attempting to reconnect...)</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleEndSession}
                    className="text-red-600 hover:text-red-700 font-semibold text-sm"
                  >
                    End Session
                  </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 bg-gray-50 rounded-lg p-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isMyMessage = msg.sender_id === parseInt(user.id);
                      return (
                        <div
                          key={msg.interaction_id || index}
                          className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              isMyMessage
                                ? 'bg-[#EB5A0D] text-white'
                                : 'bg-white border border-gray-200 text-gray-800'
                            }`}
                          >
                            <p className="text-sm">{msg.message_text}</p>
                            <p className={`text-xs mt-1 ${isMyMessage ? 'text-white/70' : 'text-gray-500'}`}>
                              {new Date(msg.timestamp).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={!isConnected}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#EB5A0D] disabled:bg-gray-100"
                  />
                  <button
                    type="submit"
                    disabled={!isConnected || !newMessage.trim()}
                    className="bg-[#EB5A0D] text-white px-6 py-2 rounded-lg hover:bg-[#d94f0a] disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}

            {/* Ended State */}
            {queueStatus === 'ended' && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Chat Session Ended
                </h2>
                <p className="text-gray-600 mb-6">
                  Thank you for chatting with us!
                </p>
                <button
                  onClick={() => {
                    setQueueStatus('idle');
                    setMessages([]);
                  }}
                  className="bg-[#EB5A0D] text-white px-8 py-3 rounded-lg hover:bg-[#d94f0a] font-semibold"
                >
                  Start New Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
