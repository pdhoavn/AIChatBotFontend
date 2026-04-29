import { useState, useEffect } from 'react';
import { X, Trash2, Download, FileText, FileType, FileSpreadsheet, Copy, Check } from 'lucide-react';
import { TrainingDocument, Intent } from './types';
import { Button } from '../../ui/system_users/button';
import { knowledgeAPI } from '../../../services/fastapi';
import { toast } from 'react-toastify';

const AUDIENCE_DISPLAY: Record<string, { label: string; color: string }> = {
  CANBO:     { label: 'Viên chức/NLĐ', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  SINHVIEN:  { label: 'Sinh viên',      color: 'bg-green-100 text-green-700 border-green-200' },
  PHUHUYNH:  { label: 'Phụ huynh',     color: 'bg-purple-100 text-purple-700 border-purple-200' },
  TUYENSINH: { label: 'Tuyển sinh',    color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
};

type Tab = 'info' | 'content';

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
  const [activeTab, setActiveTab] = useState<Tab>('info');

  type Chunk = { chunk_id: number | null; point_id: string | null; chunk_index: number; chunk_text: string; char_count: number };
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [chunksLoading, setChunksLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeTab !== 'content' || chunks.length > 0) return;
    const fetchChunks = async () => {
      try {
        setChunksLoading(true);
        const data = await knowledgeAPI.getDocumentChunks(document.document_id, 'qdrant');
        setChunks(data);
      } catch {
        setChunks([]);
      } finally {
        setChunksLoading(false);
      }
    };
    fetchChunks();
  }, [activeTab]);

  const handleCopyChunk = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

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

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const statusConfig = {
      draft:    { color: 'bg-yellow-100 text-yellow-800', label: 'Nháp' },
      approved: { color: 'bg-green-100 text-green-800',  label: 'Đã duyệt' },
      rejected: { color: 'bg-red-100 text-red-800',      label: 'Từ chối' },
      deleted:  { color: 'bg-gray-100 text-gray-800',    label: 'Đã xóa' },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const rawFilename = document.file_path?.split('/').pop() || document.file_path || '';
  const underscoreIdx = rawFilename.indexOf('_');
  const filename = underscoreIdx !== -1 ? rawFilename.slice(underscoreIdx + 1) : rawFilename;

  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const FileIcon = ['xls', 'xlsx'].includes(ext)
    ? FileSpreadsheet
    : ['doc', 'docx'].includes(ext)
    ? FileType
    : FileText;
  const fileIconColor = ['pdf'].includes(ext)
    ? 'text-red-500'
    : ['doc', 'docx'].includes(ext)
    ? 'text-blue-500'
    : ['xls', 'xlsx'].includes(ext)
    ? 'text-green-600'
    : 'text-gray-500';

  const formatDateTime = (val?: string) =>
    val
      ? new Date(val).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      : null;

  const tabs = [
    { key: 'info' as Tab,    label: 'Thông tin' },
    { key: 'content' as Tab, label: 'Nội dung' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">Chi Tiết Tài Liệu</h2>
            {getStatusBadge(document.status)}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6 bg-gray-50">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-[#facb01] text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' ? (
            <div className="space-y-5">
              {/* Dòng 1: Tiêu đề */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Tiêu đề</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg font-medium">
                  {document.title}
                </p>
              </div>

              {/* Dòng 2: Tên file */}
              {filename && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Tên tệp đính kèm</label>
                  <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                    <FileIcon className={`h-5 w-5 shrink-0 ${fileIconColor}`} />
                    <span className="text-sm text-gray-700 break-all">{filename}</span>
                  </div>
                </div>
              )}

              {/* Dòng 3: Đối tượng | Lĩnh vực */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Đối tượng</label>
                  <div className="flex flex-wrap gap-1.5 bg-gray-50 p-3 rounded-lg min-h-[44px]">
                    {document.target_audiences && document.target_audiences.length > 0 ? (
                      document.target_audiences.map((val: string) => {
                        const info = AUDIENCE_DISPLAY[val];
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
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Lĩnh vực</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {(document.intent_name && document.intent_name !== 'None') ? document.intent_name : 'Chung'}
                  </p>
                </div>
              </div>

              {/* Dòng 4: Ngày tạo | Ngày duyệt */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Ngày tạo</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg text-sm">
                    {formatDateTime(document.created_at) ?? '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Ngày duyệt</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg text-sm">
                    {formatDateTime((document as any).reviewed_at) ?? <span className="text-gray-400">Chưa duyệt</span>}
                  </p>
                </div>
              </div>

              {document.status === 'rejected' && document.reject_reason && (
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-1">Lý do từ chối</label>
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                    <p className="text-sm text-red-900 whitespace-pre-wrap">{document.reject_reason}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tóm tắt */}
              <div className="flex items-center gap-6 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">Tổng số đoạn:</span>
                  <span className="font-semibold text-gray-900">{(document as any).qdrant_points_count ?? '—'}</span>
                </div>
                {(document as any).content_char_count > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500">Tổng ký tự:</span>
                    <span className="font-semibold text-gray-900">{((document as any).content_char_count as number).toLocaleString()}</span>
                  </div>
                )}
                {!chunksLoading && chunks.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500">Đã tải:</span>
                    <span className="font-semibold text-gray-900">{chunks.length} đoạn</span>
                  </div>
                )}
              </div>

              {chunksLoading ? (
                <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
                  Đang tải nội dung...
                </div>
              ) : chunks.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
                  Không có nội dung
                </div>
              ) : (
                <div className="space-y-3">
                  {chunks.map((chunk, i) => {
                    const start = chunks.slice(0, i).reduce((acc, c) => acc + c.char_count, 0);
                    const end = start + chunk.char_count - 1;
                    return (
                      <div key={chunk.point_id ?? chunk.chunk_id ?? i} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-semibold text-gray-700">Đoạn #{chunk.chunk_index + 1}</span>
                            <span className="text-xs text-gray-400">{chunk.char_count.toLocaleString()} ký tự</span>
                            <span className="text-xs text-gray-400">Bắt đầu: {start.toLocaleString()}  Kết thúc: {end.toLocaleString()}</span>
                          </div>
                          <button
                            onClick={() => handleCopyChunk(chunk.chunk_text, i)}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          >
                            {copiedIndex === i ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                            {copiedIndex === i ? 'Đã sao chép' : 'Sao chép đoạn'}
                          </button>
                        </div>
                        <div className="px-4 py-3">
                          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{chunk.chunk_text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex gap-2">
            <Button onClick={handleDownload} variant="outline" className="text-blue-600 hover:bg-blue-50" disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              Tải Xuống
            </Button>
            {isLeader && (
              <Button onClick={handleDelete} variant="outline" className="text-red-600 hover:bg-red-50" disabled={loading}>
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
