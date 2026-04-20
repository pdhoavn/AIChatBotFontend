import { useState, useEffect } from "react";
import {
  Plus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/system_users/button";
import { fastAPIContentAnalytics } from "@/services/fastapi";
import { useAuth } from "@/contexts/Auth";
import { STAFF_COLORS } from "@/constants/staffColors";
import { Pagination } from "../common/Pagination";
import { isAuthError } from "@/utils/fastapi-client";

const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'published': return 'bg-emerald-500';
    case 'review': return 'bg-amber-500';
    case 'draft': return 'bg-slate-400';
    case 'rejected': return 'bg-red-500';
    default: return 'bg-gray-400';
  }
};

function StatusPill({ status  }) {
  const statusConfig = {
    draft: { label: "Nháp", className: "bg-gray-100 text-gray-700" },
    review: { label: "Đang Xem Xét", className: "bg-amber-100 text-amber-700" },
    published: { label: "Đã Xuất Bản", className: "bg-emerald-100 text-emerald-700" },
    rejected: { label: "Từ Chối", className: "bg-red-100 text-red-800" },
  };
  
  const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-700" };
  
  return (
    <span className={`px-2.5 py-1 text-xs rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
}

export default function ContentManagerDashboard({ onCreate, onNavigateToEditor, onNavigateToArticles  }) {
  const { user } = useAuth();
  const [contentData, setContentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [activitiesPage, setActivitiesPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchContentStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fastAPIContentAnalytics.getStatistics();
      
      if (response.success) {
        setContentData(response.data);
        setLastRefresh(new Date());
      } else {
        throw new Error('API returned success: false');
      }
    } catch (err) {

      if (isAuthError(err)) {
        return;
      }
      
      setError(err.message || 'Failed to fetch content statistics');

      setContentData({
        overview: {
          total_articles: 0,
          published_articles: 0,
          draft_articles: 0,
          review_articles: 0,
          my_articles: 0
        },
        recent_articles: [],
        popular_articles: [],
        articles_by_major: [],
        monthly_trends: [],
        status_distribution: {},
        generated_at: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContentStatistics();
  }, [user?.id]);

  const stats = contentData ? [
    { 
      label: "Tổng Đã Xuất Bản", 
      value: contentData.overview.published_articles, 
      isLoading: loading 
    },
    { 
      label: "Cần Xem Xét", 
      value: contentData.overview.review_articles, 
      isLoading: loading 
    },
    { 
      label: "Bài Viết Của Tôi", 
      value: contentData.overview.my_articles, 
      isLoading: loading 
    },
    { 
      label: "Tổng Bài Viết", 
      value: contentData.overview.total_articles, 
      isLoading: loading 
    },
  ] : [];

  const activities = contentData ? 
    contentData.recent_articles.map(article => ({
      title: article.title,
      author: article.author,
      updatedAt: article.created_at,
      status: article.status,
      badgeColor: getStatusBadgeColor(article.status),
    })) : [];

  const totalActivitiesPages = Math.ceil(activities.length / ITEMS_PER_PAGE);
  const paginatedActivities = activities.slice(
    (activitiesPage - 1) * ITEMS_PER_PAGE,
    activitiesPage * ITEMS_PER_PAGE
  );

    const handleCreate = () => {
    if (onCreate) onCreate();
    else if (onNavigateToEditor) onNavigateToEditor();
    else window.location.assign("/content?tab=editor");
  };
  
  const handleViewArticles = () => {
    if (onNavigateToArticles) onNavigateToArticles();
  };

  const handleRefresh = () => {
    fetchContentStatistics();
  };

  if (loading && !contentData) {
    return (
      <div className="h-full w-full overflow-auto">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Đang tải thống kê nội dung...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="h-full w-full overflow-auto">
      <div className="mx-auto max-w-7xl px-6 py-6">
        {}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2">
              <span className="text-red-800 text-sm">
                Lỗi tải thống kê nội dung: {error}
              </span>
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm" 
                className="ml-auto"
                style={{ backgroundColor: STAFF_COLORS.primary, color: 'white' }}
              >
                Thử Lại
              </Button>
            </div>
          </div>
        )}

        {}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Tổng quan</h1>
          </div>
        
          <div className="flex gap-2">
            <Button 
              onClick={handleCreate} 
              style={{ backgroundColor: STAFF_COLORS.primary, color: 'white' }}
              className="hover:opacity-90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tạo Bài Viết Mới
            </Button>
          </div>
        </div>

        {}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="mb-3">
                <span className="text-sm text-gray-600">{s.label}</span>
              </div>
              <div className="text-2xl font-semibold">
                {s.isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  s.value
                )}
              </div>
            </div>
          ))}
        </div>

        {}
        {contentData?.articles_by_major && contentData.articles_by_major.length > 0 && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 text-sm font-medium text-gray-800">
              Bài Viết Theo Ngành
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contentData.articles_by_major.slice(0, 6).map((major, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{major.major_name}</span>
                  <span className="text-sm font-medium text-gray-900">{major.article_count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-4 text-sm font-medium text-gray-800">
            Hoạt Động Gần Đây
            {contentData?.recent_articles && (
              <span className="ml-2 text-xs text-gray-500">
                ({contentData.recent_articles.length} bài viết)
              </span>
            )}
          </div>

          {activities.length > 0 ? (
            <>
              <ul className="divide-y divide-gray-100">
                {paginatedActivities.map((a, idx) => (
                  <li key={idx} className="flex items-center justify-between p-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className={`mt-1 h-2.5 w-2.5 rounded-full ${a.badgeColor}`}
                      />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-gray-900">
                          {a.title}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {a.author} • {a.updatedAt}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusPill status={a.status} />
                    </div>
                  </li>
                ))}
              </ul>
              <Pagination
                currentPage={activitiesPage}
                totalPages={totalActivitiesPages}
                onPageChange={setActivitiesPage}
              />
            </>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">Không tìm thấy bài viết gần đây</p>
              <Button 
                onClick={handleCreate} 
                variant="outline" 
                className="mt-3"
                style={{ backgroundColor: STAFF_COLORS.primary, color: 'white' }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tạo Bài Viết Đầu Tiên Của Bạn
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
