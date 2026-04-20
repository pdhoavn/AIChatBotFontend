import React from 'react';
import { Button } from '../../ui/system_users/button';
import { Info } from 'lucide-react';

export function ChatHeader({ 
  selectedSessionId, 
  activeSessions, 
  customerInfo, 
  isConnected, 
  user, 
  onEndSession,
  onShowStudentDetail
}) {
  const currentSession = activeSessions.find(s => s.session_id === selectedSessionId);
  
  return (
    <div className="bg-white border-b p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button 
          onClick={onShowStudentDetail}
          className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors cursor-pointer group"
          title="Xem thông tin học sinh"
        >
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold group-hover:text-[#EB5A0D] transition-colors">
                {customerInfo?.name || currentSession?.customer_name || 'Student'}
              </h2>
              <Info className="h-4 w-4 text-gray-400 group-hover:text-[#EB5A0D] transition-colors" />
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-500">
                {isConnected ? 'Đã kết nối' : 'Mất kết nối'}
              </span>
            </div>
          </div>
        </button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="destructive" 
          size="sm"
          onClick={onEndSession}
        >
          Kết thúc phiên
        </Button>
      </div>
    </div>
  );
}