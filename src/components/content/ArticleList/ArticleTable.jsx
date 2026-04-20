import { Eye, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from '../../ui/system_users/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/system_users/dropdown-menu';

const getStatusLabel = (status)=> {
  const statusMap = {
    'draft': 'Nháp',
    'approved': 'Đã Duyệt',
    'rejected': 'Từ Chối',
    'published': 'Đã Xuất Bản',
    'review': 'Đang Xem Xét',
    'archived': 'Đã Lưu Trữ'
  };
  return statusMap[status] || status;
};

export default function ArticleTable({
  articles,
  loading,
  error,
  canEdit,
  onArticleClick,
  onView,
  onEdit,
  onDelete
}) {
  if (loading) {
    return (
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="p-8 text-center text-gray-500">
          Đang tải bài viết...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="p-8 text-center text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500">
          <tr>
            <th className="text-left px-4 py-3">Tiêu Đề</th>
            <th className="text-left px-2 py-3">Ngành</th>
            <th className="text-left px-2 py-3">Trạng Thái</th>
            <th className="text-left px-2 py-3">Tác Giả</th>
            <th className="text-left px-2 py-3">Được Tạo Lúc</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {articles.map((article) => (
            <tr
              key={article.article_id}
              onClick={(event) => onArticleClick(article, event)}
              className="hover:bg-blue-50 hover:shadow-sm cursor-pointer transition-all duration-150"
              title="Nhấp để xem chi tiết bài viết"
            >
              <td className="px-4 py-3 font-medium text-gray-900">
                {article.title}
              </td>
              <td className="px-2 py-3">{article.major_name}</td>
              <td className="px-2 py-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    article.status === "published"
                      ? "bg-green-100 text-green-700"
                      : article.status === "approved"
                      ? "bg-blue-100 text-blue-700"
                      : article.status === "review"
                      ? "bg-yellow-100 text-yellow-700"
                      : article.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : article.status === "archived"
                      ? "bg-gray-200 text-gray-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {getStatusLabel(article.status)}
                </span>
              </td>
              <td className="px-2 py-3">{article.author_name}</td>
              <td className="px-2 py-3">{article.create_at}</td>
              <td className="px-4 py-3 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(article);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />Xem
                    </DropdownMenuItem>
                    
                    {canEdit && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(article);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />Chỉnh Sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(article);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />Xóa
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
          {articles.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-10 text-center text-gray-400"
              >
                Không có kết quả
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
