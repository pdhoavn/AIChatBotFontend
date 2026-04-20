import React, { useState, useEffect } from 'react';
import { Activity, Users, MessageSquare, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/system_users/card';
import { ScrollArea } from '../ui/system_users/scroll-area';
import { dashboardAnalyticsAPI } from '../../services/fastapi';
import { toast } from 'react-toastify';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export function AdminDashboard() {

  const [metrics, setMetrics] = useState({
    active_chatbot_sessions: 0,
    total_customers: 0,
    active_live_sessions: 0
  });
  const [conversationData, setConversationData] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    total_users: 0,
    total_articles: 0,
    total_qa_pairs: 0,
    total_kb_docs: 0,
    recent_errors: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [
        metricsResponse,
        chatbotRequestsResponse,
        healthResponse
      ] = await Promise.all([
        dashboardAnalyticsAPI.getMetrics(7).catch(() => null),
        dashboardAnalyticsAPI.getChatbotRequests(30).catch(() => []),
        dashboardAnalyticsAPI.getSystemHealth().catch(() => null)
      ]);

      if (metricsResponse) {
        setMetrics(metricsResponse);
      } else {
        setMetrics({
          active_chatbot_sessions: 0,
          total_customers: 0,
          active_live_sessions: 0
        });
      }
      
      if (chatbotRequestsResponse && Array.isArray(chatbotRequestsResponse)) {
        setConversationData(chatbotRequestsResponse);
      }
      
      if (healthResponse) {
        setSystemHealth(healthResponse);
      } else {
        setSystemHealth({
          total_users: 0,
          total_articles: 0,
          total_qa_pairs: 0,
          total_kb_docs: 0,
          recent_errors: 0
        });
      }
      
    } catch (error) {
      toast.error('Không thể tải dữ liệu bảng điều khiển');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    const interval = setInterval(fetchDashboardData, 300000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bảng điều khiển...</p>
        </div>
      </div>
    );
  }
  return (
    <ScrollArea className="h-full">
      <div className="p-6 pb-8 space-y-6">
        {}
        <div>
          <h1 className="text-4xl font-bold">Tổng quan</h1>
        </div>

        {}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Phiên Chatbot Đang Hoạt Động</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{metrics?.active_chatbot_sessions || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Tổng Số Khách Hàng</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{metrics?.total_customers || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Phiên Trực Tiếp Đang Hoạt Động</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{metrics?.active_live_sessions || 0}</div>
            </CardContent>
          </Card>
        </div>

        {}
        <Card>
          <CardHeader>
            <CardTitle>Yêu Cầu Chatbot (7 Ngày Qua)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={conversationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="customer" fill="#3B82F6" name="Tin Nhắn Khách Hàng" />
                <Bar dataKey="chatbot" fill="#10B981" name="Phản Hồi Chatbot" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {}
        <Card>
          <CardHeader>
            <CardTitle>Thống Kê Hệ Thống</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Bài Viết Đã Xuất Bản</span>
              </div>
              <span className="text-2xl font-bold">{systemHealth?.total_articles || 0}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-green-500" />
                <span className="text-sm">Tài Liệu Cơ Sở Tri Thức</span>
              </div>
              <span className="text-2xl font-bold">{systemHealth?.total_kb_docs || 0}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Cặp Câu Hỏi & Trả Lời Huấn Luyện</span>
              </div>
              <span className="text-2xl font-bold">{systemHealth?.total_qa_pairs || 0}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Tổng Số Người Dùng</span>
              </div>
              <span className="text-2xl font-bold">{systemHealth?.total_users || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}