import React from 'react';
import { Send } from 'lucide-react';
import { Button } from '../../ui/system_users/button';
import { Input } from '../../ui/system_users/input';

export function MessageInput({ 
  newMessage, 
  setNewMessage, 
  onSendMessage, 
  onKeyPress, 
  isConnected 
}) {
  return (
    <div className="bg-white border-t p-4 flex-shrink-0">
      <div className="flex items-center space-x-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder={isConnected ? "Type your message..." : "Connecting..."}
          disabled={!isConnected}
          className="flex-1"
        />
        <Button 
          onClick={onSendMessage}
          disabled={!isConnected || !newMessage.trim()}
          size="sm"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {!isConnected && (
        <p className="text-xs text-red-500 mt-1">
          Connection lost. Please refresh the page.
        </p>
      )}
    </div>
  );
}