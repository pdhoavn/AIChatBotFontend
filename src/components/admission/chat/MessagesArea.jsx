import React, { useRef, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

export function MessagesArea({ messages, userId, userName }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Chưa có tin nhắn. Bắt đầu cuộc trò chuyện!</p>
        </div>
      ) : (
        messages.map((message, index) => (
          <div
            key={message.interaction_id || index}
            className={`flex ${
              message.sender_id === parseInt(userId) 
                ? 'justify-end' 
                : 'justify-start'
            }`}
          >
            <div className={`rounded-lg px-3 py-2 max-w-xs lg:max-w-md ${
              message.sender_id === parseInt(userId)
                ? 'bg-blue-500 text-white'
                : 'bg-white border'
            }`}>
              <p className="text-sm">{message.message_text}</p>
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}