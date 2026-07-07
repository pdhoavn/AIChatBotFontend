import { useEffect, useState } from 'react';
import { Check, Edit3, Save, Trash2, X } from 'lucide-react';
import { TrainingQuestion, Intent } from './types';
import { Button } from '../../ui/system_users/button';

const AUDIENCE_DISPLAY: Record<string, { label: string; color: string }> = {
  CANBO:     { label: 'Viên chức/Người lao động', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  SINHVIEN:  { label: 'Sinh viên',                color: 'bg-green-100 text-green-700 border-green-200' },
  PHUHUYNH:  { label: 'Phụ huynh',               color: 'bg-purple-100 text-purple-700 border-purple-200' },
  TUYENSINH: { label: 'Tuyển sinh',              color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
};
const AUDIENCE_OPTIONS = ['CANBO', 'SINHVIEN', 'PHUHUYNH', 'TUYENSINH'];
const UNIT_DISPLAY: Record<string, { label: string; color: string }> = {
  UTC:  { label: 'UTC',  color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  UTC2: { label: 'UTC2', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
};
const UNIT_OPTIONS = ['UTC', 'UTC2'];

function FieldState({ editable }: { editable: boolean }) {
  return (
    <span className={`text-[11px] font-medium ${editable ? 'text-amber-700' : 'text-gray-400'}`}>
      {editable ? 'Có thể sửa' : 'Không chỉnh sửa'}
    </span>
  );
}

interface QuestionDetailModalProps {
  question: TrainingQuestion;
  intents: Intent[];
  isLeader: boolean;
  onClose: () => void;
  onDelete: (questionId: number) => Promise<void>;
  onUpdateMetadata: (
    questionId: number,
    data: { intent_id?: number | null; target_audiences?: string[]; target_units?: string[]; is_private?: boolean }
  ) => Promise<void>;
}

export function QuestionDetailModal({
  question,
  intents,
  isLeader,
  onClose,
  onDelete,
  onUpdateMetadata
}: QuestionDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editIntentId, setEditIntentId] = useState<string>((question.intent_id ?? 0).toString());
  const [editAudiences, setEditAudiences] = useState<string[]>(question.target_audiences || []);
  const [editUnits, setEditUnits] = useState<string[]>(question.target_units || []);
  const [editIsPrivate, setEditIsPrivate] = useState(Boolean(question.is_private));

  useEffect(() => {
    setEditIntentId((question.intent_id ?? 0).toString());
    setEditAudiences(question.target_audiences || []);
    setEditUnits(question.target_units || []);
    setEditIsPrivate(Boolean(question.is_private));
    setIsEditingMetadata(false);
  }, [question]);

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

  const toggleAudience = (value: string) => {
    setEditAudiences(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };
  const toggleUnit = (value: string) => {
    setEditUnits(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };
  const handleSaveMetadata = async () => {
    if (editAudiences.length === 0) {
      alert('Vui lòng chọn ít nhất một đối tượng');
      return;
    }

    try {
      setLoading(true);
      await onUpdateMetadata(question.question_id, {
        intent_id: Number(editIntentId) || 0,
        target_audiences: editAudiences,
        target_units: editUnits,
        is_private: editIsPrivate,
      });
      setIsEditingMetadata(false);
    } finally {
      setLoading(false);
    }
  };

  const resetMetadataForm = () => {
    setIsEditingMetadata(false);
    setEditIntentId((question.intent_id ?? 0).toString());
    setEditAudiences(question.target_audiences || []);
    setEditUnits(question.target_units || []);
    setEditIsPrivate(Boolean(question.is_private));
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
            {question.is_private && (
              <span className="px-3 py-1 text-sm font-medium rounded bg-purple-100 text-purple-800 border border-purple-200">
                Riêng tư
              </span>
            )}
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Đối tượng
              </label>
              {isEditingMetadata && <FieldState editable />}
            </div>
            <div className={`flex flex-wrap gap-2 p-3 rounded-lg min-h-[48px] ${
              isEditingMetadata ? 'bg-white border border-amber-300 ring-1 ring-amber-100' : 'bg-gray-50'
            }`}>
              {(isEditingMetadata ? AUDIENCE_OPTIONS : question.target_audiences || []).length > 0 ? (
                (isEditingMetadata ? AUDIENCE_OPTIONS : question.target_audiences || []).map(val => {
                  const info = AUDIENCE_DISPLAY[val];
                  const selected = editAudiences.includes(val);
                  if (isEditingMetadata) {
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => toggleAudience(val)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                          selected ? info.color : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {selected && <Check className="h-3 w-3" />}
                        {info.label}
                      </button>
                    );
                  }
                  return info ? (
                    <span key={val} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${info.color}`}>
                      {info.label}
                    </span>
                  ) : (
                    <span key={val} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-700 border-gray-200">
                      {val}
                    </span>
                  );
                })
              ) : (
                <span className="text-sm text-gray-400">Chưa có đối tượng</span>
              )}
            </div>
          </div>
          {/* Đơn vị */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Đơn vị <span className="text-gray-400 font-normal">(Không bắt buộc)</span>
              </label>
              {isEditingMetadata && <FieldState editable />}
            </div>
            <div className={`flex flex-wrap gap-2 p-3 rounded-lg min-h-[48px] ${
              isEditingMetadata ? 'bg-white border border-amber-300 ring-1 ring-amber-100' : 'bg-gray-50'
            }`}>
              {(isEditingMetadata ? UNIT_OPTIONS : question.target_units || []).length > 0 ? (
                (isEditingMetadata ? UNIT_OPTIONS : question.target_units || []).map(val => {
                  const info = UNIT_DISPLAY[val];
                  const selected = editUnits.includes(val);
                  if (isEditingMetadata) {
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => toggleUnit(val)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                          selected ? info.color : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {selected && <Check className="h-3 w-3" />}
                        {info.label}
                      </button>
                    );
                  }
                  return info ? (
                    <span key={val} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${info.color}`}>
                      {info.label}
                    </span>
                  ) : (
                    <span key={val} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-700 border-gray-200">
                      {val}
                    </span>
                  );
                })
              ) : (
                <span className="text-sm text-gray-400">Chưa chọn đơn vị</span>
              )}
            </div>
          </div>
          {}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Lĩnh vực
              </label>
              {isEditingMetadata && <FieldState editable />}
            </div>
            {isEditingMetadata ? (
              <select
                value={editIntentId}
                onChange={(event) => setEditIntentId(event.target.value)}
                className="w-full rounded-lg border border-amber-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#facb01]/60"
              >
                <option value="0">Chung</option>
                {intents.map(intent => (
                  <option key={intent.intent_id} value={intent.intent_id}>
                    {intent.intent_name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {question.intent_name || 'Chưa chọn lĩnh vực'}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Chế độ truy cập
              </label>
              {isEditingMetadata && <FieldState editable />}
            </div>
            {isEditingMetadata ? (
              <label className="flex items-center gap-2 bg-white border border-amber-300 p-3 rounded-lg text-sm text-gray-700 w-fit cursor-pointer">
                <input
                  type="checkbox"
                  checked={editIsPrivate}
                  onChange={(event) => setEditIsPrivate(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Riêng tư (Yêu cầu đăng nhập)
              </label>
            ) : (
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {question.is_private ? 'Riêng tư (Yêu cầu đăng nhập)' : 'Công khai'}
              </p>
            )}
          </div>

          {}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Câu Hỏi
              </label>
              {isEditingMetadata && <FieldState editable={false} />}
            </div>
            <p className="text-gray-900 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
              {question.question}
            </p>
          </div>

          {}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Câu Trả Lời
              </label>
              {isEditingMetadata && <FieldState editable={false} />}
            </div>
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
            <div>
              <span className="text-sm text-gray-500">Người tạo:</span>
              <p className="text-sm font-medium text-gray-900">
                {question.created_by_name || 'Hệ thống'}
              </p>
              {question.created_at && (
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(question.created_at).toLocaleString('vi-VN')}
                </p>
              )}
            </div>
            <div>
              <span className="text-sm text-gray-500">Người duyệt:</span>
              <p className="text-sm font-medium text-gray-900">
                {question.approved_by_name || 'Chưa duyệt'}
              </p>
              {question.approved_at && (
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(question.approved_at).toLocaleString('vi-VN')}
                </p>
              )}
            </div>
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
          {isLeader && (
            <div className="flex gap-2">
              {isEditingMetadata ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading}
                    onClick={resetMetadataForm}
                    className="border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="button"
                    disabled={loading}
                    onClick={handleSaveMetadata}
                    className="bg-[#facb01] text-gray-900 hover:bg-[#e8b800]"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Lưu thông tin cơ bản
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() => setIsEditingMetadata(true)}
                  className="border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Sửa thông tin cơ bản
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
