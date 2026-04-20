import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { TrainingQuestion, Intent } from './types';
import { Button } from '../../ui/system_users/button';

interface QuestionDetailModalProps {
  question: TrainingQuestion;
  intents: Intent[];
  isLeader: boolean;
  onClose: () => void;
  onDelete: (questionId: number) => Promise<void>;
}

export function QuestionDetailModal({
  question,
  intents,
  isLeader,
  onClose,
  onDelete
}: QuestionDetailModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;
    try {
      setLoading(true);
      await onDelete(question.question_id);
      onClose();
    } catch (error) {
    } finally {
      setLoading(false);
    }
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
            <h2 className="text-2xl font-bold text-gray-900">Chi Tiết Câu Hỏi</h2>
            {getStatusBadge(question.status)}
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
              Danh mục
            </label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
              {question.intent_name || 'Chưa chọn danh mục'}
            </p>
          </div>

          {}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Câu Hỏi
            </label>
            <p className="text-gray-900 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
              {question.question}
            </p>
          </div>

          {}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Câu Trả Lời
            </label>
            <p className="text-gray-900 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
              {question.answer}
            </p>
          </div>

          {}
          {question.status === 'rejected' && question.reject_reason && (
            <div>
              <label className="block text-sm font-medium text-red-700 mb-2">
                Lý Do Từ Chối
              </label>
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-sm text-red-900 whitespace-pre-wrap">
                  {question.reject_reason}
                </p>
              </div>
            </div>
          )}

          {}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            {question.created_at && (
              <div>
                <span className="text-sm text-gray-500">Ngày tạo:</span>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(question.created_at).toLocaleDateString('vi-VN')}
                </p>
              </div>
            )}
            {question.approved_at && (
              <div>
                <span className="text-sm text-gray-500">Ngày duyệt:</span>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(question.approved_at).toLocaleDateString('vi-VN')}
                </p>
              </div>
            )}
          </div>
        </div>

        {}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex gap-2">
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
