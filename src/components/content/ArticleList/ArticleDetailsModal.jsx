import { X, ExternalLink, Calendar, User, BookOpen, Tag, Eye } from "lucide-react";
import { useState } from 'react';

const getStatusLabel = (status) => {
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

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("vi-VN");
};

export default function ArticleDetailsModal({ 
  article, 
  loading, 
  error, 
  onClose, 
  onRetry 
}) {
  const [previewMode, setPreviewMode] = useState(false);

  const safeImageUrl = article?.link_image
    ? (article.link_image.startsWith('http://') || article.link_image.startsWith('https://')
        ? article.link_image
        : `https://${article.link_image}`)
    : null;
  
  if (!article && !loading && !error) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-[60vw] max-h-[90vh] overflow-hidden">
        {}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {previewMode ? 'Xem Thử Bài Viết' : 'Chi Tiết Bài Viết'}
          </h2>
          <div className="flex items-center gap-2">
            {article && !loading && !error && (
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-[#EB5A0D] text-white rounded-lg hover:bg-[#d14f0a] transition-colors"
              >
                <Eye className="h-4 w-4" />
                {previewMode ? 'Chi Tiết' : 'Xem Thử'}
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
              <span className="ml-3 text-gray-600">Đang tải chi tiết bài viết...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">❌ {error}</div>
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-[#EB5A0D] text-white rounded-lg hover:bg-[#d14f0a]"
              >
                Thử Lại
              </button>
            </div>
          )}

          {article && !loading && !error && (
            <>
              {previewMode ? (

                <div className="space-y-4">
                  {safeImageUrl && (
                    <img
                      src={safeImageUrl}
                      alt={article.title}
                      className="w-full h-64 object-cover rounded-lg"
                      onError={(e) => {

                        (e.target).style.display = 'none';
                      }}
                    />
                  )}

                  <h1 className="text-2xl font-semibold mb-1">
                    {article.title}
                  </h1>

                  <div className="text-sm text-gray-500 mb-4">
                    <div>Ngày: {formatDate(article.create_at)}</div>
                    {article.author_name && (
                      <div>Tác giả: {article.author_name}</div>
                    )}
                  </div>

                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {article.description}
                  </p>

                  {article.url && (
                    <div className="mt-6 text-sm">
                      <span className="font-medium">Link: </span>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#EB5A0D] underline break-all"
                      >
                        {article.url}
                      </a>
                    </div>
                  )}
                </div>
              ) : (

                <div className="space-y-4">
              {}
              <div className="border-b pb-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {article.title}
                </h3>
              </div>

              {}
              <div className="space-y-3">
                {}
                {article.description && (
                  <div className="flex py-2 border-b border-gray-100">
                    <span className="w-48 text-gray-600 font-medium flex-shrink-0">Mô Tả:</span>
                    <span className="flex-1 text-gray-900">{article.description}</span>
                  </div>
                )}

                {}
                <div className="flex items-center py-2 border-b border-gray-100">
                  <span className="w-48 text-gray-600 font-medium flex-shrink-0">Trạng Thái:</span>
                  <span className="flex-1">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        article.status === "published"
                          ? "bg-green-100 text-green-800"
                          : article.status === "approved"
                          ? "bg-blue-100 text-blue-800"
                          : article.status === "review"
                          ? "bg-yellow-100 text-yellow-800"
                          : article.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : article.status === "archived"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {getStatusLabel(article.status)}
                    </span>
                  </span>
                </div>

                {}
                <div className="flex py-2 border-b border-gray-100">
                  <span className="w-48 text-gray-600 font-medium flex-shrink-0">Tác Giả:</span>
                  <span className="flex-1 text-gray-900">{article.author_name}</span>
                </div>

                {}
                <div className="flex py-2 border-b border-gray-100">
                  <span className="w-48 text-gray-600 font-medium flex-shrink-0">Ngày Tạo:</span>
                  <span className="flex-1 text-gray-900">{article.create_at}</span>
                </div>

                {}
                <div className="flex py-2 border-b border-gray-100">
                  <span className="w-48 text-gray-600 font-medium flex-shrink-0">Ngành:</span>
                  <span className="flex-1 text-gray-900">{article.major_name}</span>
                </div>

                {}
                <div className="flex py-2 border-b border-gray-100">
                  <span className="w-48 text-gray-600 font-medium flex-shrink-0">Chuyên Ngành:</span>
                  <span className="flex-1 text-gray-900">{article.specialization_name}</span>
                </div>

                {}
                {article.url && (
                  <div className="flex py-2 border-b border-gray-100">
                    <span className="w-48 text-gray-600 font-medium flex-shrink-0">URL Bài Viết:</span>
                    <span className="flex-1">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline text-sm break-all"
                      >
                        {article.url}
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </span>
                  </div>
                )}

                {}
                {safeImageUrl && (
                  <div className="flex py-2 border-b border-gray-100">
                    <span className="w-48 text-gray-600 font-medium flex-shrink-0">Link Hình Ảnh:</span>
                    <span className="flex-1">
                      <a
                        href={safeImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline text-sm break-all"
                      >
                        {safeImageUrl}
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </span>
                  </div>
                )}

                {}
                {safeImageUrl && (
                  <div className="flex py-2 border-b border-gray-100">
                    <span className="w-48 text-gray-600 font-medium flex-shrink-0">Hình Ảnh:</span>
                    <div className="flex-1">
                      <img
                        src={safeImageUrl}
                        alt={article.title}
                        className="max-w-full h-auto rounded-lg border border-gray-200"
                        onError={(e) => {
                          (e.target).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                {}
                {article.note && (
                  <div className="flex py-2 border-b border-gray-100">
                    <span className="w-48 text-gray-600 font-medium flex-shrink-0">Ghi Chú:</span>
                    <span className="flex-1 text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      {article.note}
                    </span>
                  </div>
                )}
              </div>
            </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
