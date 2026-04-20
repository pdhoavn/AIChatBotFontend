import { X } from "lucide-react";
import { useState } from "react";

export default function DeleteConfirmModal({ 
  article, 
  onClose, 
  onConfirm 
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Xóa Bài Viết</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Bạn có chắc chắn muốn xóa bài viết này?
          </p>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="font-semibold text-gray-900">{article.title}</p>
            <p className="text-sm text-gray-600 mt-1">{article.description}</p>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Hành động này sẽ đánh dấu bài viết là đã xóa. Nó sẽ không còn xuất hiện trong danh sách bài viết.
          </p>
        </div>

        {}
        <div className="flex gap-3 p-6 border-t">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang xóa...' : 'Xóa'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >Hủy</button>
        </div>
      </div>
    </div>
  );
}
