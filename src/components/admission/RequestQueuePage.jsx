import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/Auth';
import { fastAPILiveChat } from '../../services/fastapi';
import { RequestQueue } from './RequestQueue';
import { Card, CardContent } from '../ui/system_users/card';
import { toast } from 'react-toastify';

export function RequestQueuePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [queueItems, setQueueItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acceptingRequestId, setAcceptingRequestId] = useState(null);

  const transformQueueData = (apiData) => {
    return apiData.map(item => ({
      id: item.id.toString(),
      name: item.customer?.full_name || `Customer ${item.customer_id}`,
      email: item.customer?.email || 'N/A',
      phone: item.customer?.phone_number || 'N/A',
      waitTime: Math.floor((new Date() - new Date(item.created_at)) / (1000 * 60)),
      requestedAt: item.created_at,
    }));
  };

  const fetchQueueData = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fastAPILiveChat.getQueueList(parseInt(user.id));

      const apiData = Array.isArray(response) ? response : (response.data || []);
      
      const transformedData = transformQueueData(apiData);
      setQueueItems(transformedData);
    } catch (err) {
      setError('Failed to load queue data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueData();

    const interval = setInterval(fetchQueueData, 30000);
    
    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    const handleQueueUpdate = (event) => {

      fetchQueueData();
    };

    const handleQueueAccepted = (event) => {

      fetchQueueData();
    };

    window.addEventListener('queueUpdate', handleQueueUpdate);
    window.addEventListener('queueAccepted', handleQueueAccepted);

    return () => {
      window.removeEventListener('queueUpdate', handleQueueUpdate);
      window.removeEventListener('queueAccepted', handleQueueAccepted);
    };
  }, []);

  const handleTakeRequest = async (requestId) => {

    setAcceptingRequestId(requestId);
    setError(null);
    
    try {
      
      if (!user?.id) {
        toast.error('User not authenticated. Please login again.');
        return;
      }

      const queueId = parseInt(requestId);
      const officialId = parseInt(user.id);

      const response = await fastAPILiveChat.acceptRequest(officialId, queueId);

      if (response && response.error) {

        switch (response.error) {
          case 'max_sessions_reached':
            toast.error('🚫 Maximum sessions reached! You cannot accept more requests at this time. Please end some active sessions first.');
            break;
          case 'queue_not_found':
            toast.error('❌ Request not found. It may have been already taken by another official.');

            await fetchQueueData();
            break;
          case 'official_not_found':
            toast.error('❌ Official profile not found. Please contact system administrator.');
            break;
          default:
            toast.error(`❌ Failed to accept request: ${response.error}`);
        }
        return;
      }

      if (response && response.chat_session_id) {

        toast.success('✅ Đã chấp nhận yêu cầu! Đang chuyển đến tư vấn...');

        navigate('/admission/consultation', { 
          state: { 
            sessionId: response.chat_session_id,
            officialId: officialId,
            queueId: queueId
          } 
        });
      } else if (response && response.session_id) {

        toast.success('✅ Đã chấp nhận yêu cầu! Đang chuyển đến tư vấn...');

        navigate('/admission/consultation', { 
          state: { 
            sessionId: response.session_id,
            officialId: officialId,
            queueId: queueId
          } 
        });
      } else if (response && response.success) {

        toast.success('✅ Đã chấp nhận yêu cầu! Đang chuyển đến tư vấn...');
        await fetchQueueData();
        navigate('/admission/consultation');
      } else {
        toast.warning('⚠️ Yêu cầu có thể đã được chấp nhận, nhưng nhận được phản hồi không mong đợi. Vui lòng kiểm tra các phiên hoạt động của bạn.');

        await fetchQueueData();
        navigate('/admission/consultation');
      }
    } catch (err) {

      if (err.response && err.response.status === 500) {
        toast.error('🔧 Server error occurred. Please try again in a moment.');
      } else if (err.response && err.response.status === 401) {
        toast.error('🔐 Authentication failed. Please login again.');
      } else if (err.response && err.response.status === 403) {
        toast.error('🚫 Access denied. You don\'t have permission to accept requests.');
      } else if (err.message && err.message.includes('Network Error')) {
        toast.error('🌐 Network error. Please check your connection and try again.');
      } else {
        toast.error('❌ Failed to accept request. Please try again.');
      }
      
      setError('Failed to accept request. Please try again.');
    } finally {

      setAcceptingRequestId(null);
    }
  };

  const handleRetry = () => {
    fetchQueueData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading queue data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Error: {error}</p>
              <button 
                onClick={handleRetry}
                className="px-4 py-2 bg-[#EB5A0D] text-white rounded hover:bg-[#d14f0a]"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <RequestQueue 
      requests={queueItems} 
      onTakeRequest={handleTakeRequest} 
      acceptingRequestId={acceptingRequestId}
    />
  );
}