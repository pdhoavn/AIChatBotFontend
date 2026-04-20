import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Target, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Plus,
  Loader2
} from 'lucide-react';
import { t } from '../../utils/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/system_users/card';
import { Button } from '../ui/system_users/button';
import { ScrollArea } from '../ui/system_users/scroll-area';
import { Badge } from '../ui/system_users/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { consultantAnalyticsAPI, ConsultantStatistics, RecentQuestion, UnansweredQuestion } from '../../services/fastapi';
import { Pagination } from '../common/Pagination';

interface DashboardOverviewProps {
  onNavigateToTemplates?: (question: string, action: 'add') => void;
}

export function DashboardOverview({ onNavigateToTemplates }: DashboardOverviewProps = {}) {
  const [timeRange, setTimeRange] = useState<'today' | 'week'>('week');

  const [stats, setStats] = useState<ConsultantStatistics | null>(null);
  const [recentQuestions, setRecentQuestions] = useState<RecentQuestion[]>([]);
  const [unansweredQuestions, setUnansweredQuestions] = useState<UnansweredQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsResponse, questionsResponse, unansweredResponse] = await Promise.all([
          consultantAnalyticsAPI.getStatistics(),
          consultantAnalyticsAPI.getRecentQuestions(5),
          consultantAnalyticsAPI.getUnansweredQuestions(100)
        ]);
        
        setStats(statsResponse.data);

        const questionsData = Array.isArray(questionsResponse) ? questionsResponse : questionsResponse?.data || [];
        setRecentQuestions(questionsData);
        
        setUnansweredQuestions(unansweredResponse?.data || []);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Chưa đến 1 giờ trước';
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ngày trước`;
    }
  };

  const totalPages = Math.ceil(recentQuestions.length / ITEMS_PER_PAGE);
  const paginatedQuestions = recentQuestions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <ScrollArea className="min-h-screen h-full">
        <div className="p-6 pb-8 space-y-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Đang tải dữ liệu...</span>
          </div>
        </div>
      </ScrollArea>
    );
  }

  if (error) {
    return (
      <ScrollArea className="min-h-screen h-full">
        <div className="p-6 pb-8 space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive font-medium">Không thể tải dữ liệu</p>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
            </div>
          </div>
        </div>
      </ScrollArea>
    );
  }

  if (!stats) {
    return (
      <ScrollArea className="min-h-screen h-full">
        <div className="p-6 pb-8 space-y-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Không có dữ liệu</p>
          </div>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="min-h-screen h-full">
      <div className="p-6 pb-8 space-y-6">
        {}
        <div>
          <h1 className="text-4xl font-bold">Tổng Quan</h1>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-l-4 border-l-[#3B82F6]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground">
                  Tổng Số Câu Hỏi
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-[#3B82F6]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{stats.overview_stats.total_queries.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className={stats.overview_stats.queries_growth >= 0 ? "text-[#10B981]" : "text-[#EF4444]"}>
                  {stats.overview_stats.queries_growth >= 0 ? '↑' : '↓'} {Math.abs(stats.overview_stats.queries_growth)}%
                </span> {timeRange === 'today' ? 'từ giờ trước' : 'từ tuần trước'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#EF4444]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground">
                  Câu Hỏi Chưa Trả Lời
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-[#EF4444]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{unansweredQuestions.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Cần chú ý
              </p>
            </CardContent>
          </Card>
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {}
          <Card className="lg:col-span-full">
            <CardHeader>
              <CardTitle>Câu Hỏi Theo Thời Gian</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.questions_over_time}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    stroke="#6B7280"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#6B7280"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="queries" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Câu Hỏi Gần Đây</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!recentQuestions || recentQuestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Không tìm thấy câu hỏi nào</p>
                <p className="text-sm">Chưa có câu hỏi nào được đặt</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedQuestions.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{item.question}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Hỏi bởi {item.user_name}</span>
                        {item.timestamp && (
                          <>
                            <span>•</span>
                            <span>{new Date(item.timestamp).toLocaleDateString('vi-VN')}</span>
                          </>
                        )}
                        {item.rating && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <span>⭐</span>
                              <span>{item.rating}/5</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {recentQuestions.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
