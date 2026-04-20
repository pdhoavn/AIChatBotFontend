import { useState } from 'react';
import { X, Trash2, Download } from 'lucide-react';
import { TrainingDocument, Intent } from './types';
import { Button } from '../../ui/system_users/button';
import { knowledgeAPI } from '../../../services/fastapi';
import { toast } from 'react-toastify';

interface DocumentDetailModalProps {
  document: TrainingDocument;
  intents: Intent[];
  isLeader: boolean;
  onClose: () => void;
  onDelete: (documentId: number) => Promise<void>;
  onApprove?: (documentId: number) => Promise<void>;
  onReject?: (documentId: number) => Promise<void>;
  isApproving?: boolean;
  isRejecting?: boolean;
}

export function DocumentDetailModal({
  document,
  intents,
  isLeader,
  onClose,
  onDelete,
  onApprove,
  onReject,
  isApproving,
  isRejecting
}: DocumentDetailModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;
    try {
      setLoading(true);
      await onDelete(document.document_id);
      onClose();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);

      const blob = await knowledgeAPI.downloadDocument(document.document_id);

      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.title || `document-${document.document_id}`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Tải tài liệu thành công!');
    } catch (error) {
      
      let errorMessage = 'Không thể tải xuống tài liệu. Vui lòng thử lại.';
      if (error instanceof Error && error.message.includes('File not found')) {
        errorMessage = 'Tệp không tìm thấy trên máy chủ.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (sizeInBytes: number) => {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;

    const statusConfig = {
      draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Nháp' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Đã duyệt' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Từ chối' },
      deleted: { color: 'bg-gray-100 text-gray-800', label: 'Đã xóa' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">Chi Tiết Tài Liệu</h2>
            {getStatusBadge(document.status)}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu Đề
            </label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg font-medium">
              {document.title}
            </p>
          </div>

          {}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục
            </label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
              {document.intent_name || 'Chưa chọn danh mục'}
            </p>
          </div>

          {}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thể loại
            </label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
              {document.category || 'Chưa có thể loại'}
            </p>
          </div>

          {}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại File
            </label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
              {document.file_type?.toUpperCase() || 'UNKNOWN'}
            </p>
          </div>

          {}
          {document.content && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội Dung
              </label>
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {document.content.substring(0, 2000)}
                  {document.content.length > 2000 && '...'}
                </p>
              </div>
            </div>
          )}

          {}
          {document.status === 'rejected' && document.reject_reason && (
            <div>
              <label className="block text-sm font-medium text-red-700 mb-2">
                Lý Do Từ Chối
              </label>
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-sm text-red-900 whitespace-pre-wrap">
                  {document.reject_reason}
                </p>
              </div>
            </div>
          )}

          {}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            {document.created_at && (
              <div>
                <span className="text-sm text-gray-500">Ngày tạo:</span>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(document.created_at).toLocaleDateString('vi-VN')}
                </p>
              </div>
            )}
            {document.reviewed_at && (
              <div>
                <span className="text-sm text-gray-500">Ngày duyệt:</span>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(document.reviewed_at).toLocaleDateString('vi-VN')}
                </p>
              </div>
            )}
          </div>
        </div>

        {}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="text-blue-600 hover:bg-blue-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Tải Xuống
            </Button>
            {isLeader && (
              <Button
                onClick={handleDelete}
                variant="outline"
                className="text-red-600 hover:bg-red-50"
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
