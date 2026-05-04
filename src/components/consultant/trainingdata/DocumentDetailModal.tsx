import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Trash2, Download, FileText, FileType, FileSpreadsheet, Copy, Check, Search, AlertTriangle, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
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
  const [chunksError, setChunksError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const chunkRefs = useRef<(HTMLDivElement | null)[]>([]);

  const parseChunksError = (err: unknown): string => {
    if (err instanceof Error) {
      const msg = err.message;
      if (msg.includes('10054') || msg.toLowerCase().includes('forcibly closed') || msg.toLowerCase().includes('connection') ) {
        return 'Kết nối tới máy chủ Qdrant bị ngắt đột ngột. Vui lòng thử lại.';
      }
      if (msg.toLowerCase().includes('qdrant')) return `Lỗi Qdrant: ${msg}`;
      if (msg.includes('500') || msg.toLowerCase().includes('server error')) return 'Máy chủ gặp sự cố. Vui lòng thử lại sau.';
      if (msg.includes('timeout') || msg.includes('408')) return 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.';
      return msg;
    }
    return 'Không thể tải nội dung. Vui lòng thử lại.';
  };

  const fetchChunks = useCallback(async () => {
    try {
      setChunksLoading(true);
      setChunksError(null);
      setChunks([]);
      const data = await knowledgeAPI.getDocumentChunks(document.document_id, 'qdrant');
      setChunks(data);
    } catch (err) {
      setChunks([]);
      setChunksError(parseChunksError(err));
    } finally {
      setChunksLoading(false);
    }
  }, [document.document_id]);

  useEffect(() => {
    if (activeTab !== 'content') return;
    fetchChunks();
  }, [activeTab, fetchChunks]);

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

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return <>{text}</>;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5">{part}</mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const filteredChunks = searchQuery.trim()
    ? chunks.filter(c => c.chunk_text.toLowerCase().includes(searchQuery.toLowerCase()))
    : chunks;

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentMatchIndex(0);
  };

  const navigateMatch = (dir: 'prev' | 'next') => {
    if (filteredChunks.length === 0) return;
    const next = dir === 'next'
      ? (currentMatchIndex + 1) % filteredChunks.length
      : (currentMatchIndex - 1 + filteredChunks.length) % filteredChunks.length;
    setCurrentMatchIndex(next);
    chunkRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

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
              onClick={() => { setActiveTab(tab.key); setSearchQuery(''); setChunksError(null); }}
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

              {/* Search input — hiển thị khi đã tải xong và có dữ liệu */}
              {!chunksLoading && chunks.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => handleSearchChange(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') navigateMatch(e.shiftKey ? 'prev' : 'next');
                      if (e.key === 'Escape') { handleSearchChange(''); searchInputRef.current?.blur(); }
                    }}
                    placeholder="Tìm kiếm trong nội dung..."
                    className="w-full pl-9 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#facb01]/60 focus:border-[#facb01] transition"
                    style={{ paddingRight: searchQuery ? '10rem' : '1rem' }}
                  />
                  {searchQuery && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {filteredChunks.length === 0 ? (
                        <span className="text-xs font-medium text-red-500 px-1">Không khớp</span>
                      ) : (
                        <>
                          <span className="text-xs font-medium text-[#b59a00] px-1 tabular-nums">
                            {currentMatchIndex + 1}/{filteredChunks.length}
                          </span>
                          <button
                            onClick={() => navigateMatch('prev')}
                            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                            title="Kết quả trước (Shift+Enter)"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => navigateMatch('next')}
                            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                            title="Kết quả tiếp (Enter)"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => { handleSearchChange(''); searchInputRef.current?.focus(); }}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        aria-label="Xóa tìm kiếm"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {chunksLoading ? (
                <div className="flex items-center justify-center py-16 text-gray-400 text-sm gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Đang tải nội dung...
                </div>
              ) : chunksError ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-red-600 mb-1">Không thể tải nội dung</p>
                    <p className="text-xs text-gray-500 max-w-sm">{chunksError}</p>
                  </div>
                  <button
                    onClick={fetchChunks}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Thử lại
                  </button>
                </div>
              ) : chunks.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
                  Không có nội dung
                </div>
              ) : filteredChunks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400 text-sm">
                  <Search className="h-8 w-8 text-gray-300" />
                  <span>Không tìm thấy đoạn nào khớp với "<span className="font-medium text-gray-600">{searchQuery}</span>"</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredChunks.map((chunk, i) => {
                    const originalIndex = chunks.indexOf(chunk);
                    const start = chunks.slice(0, originalIndex).reduce((acc, c) => acc + c.char_count, 0);
                    const end = start + chunk.char_count - 1;
                    const isActive = searchQuery.trim() && i === currentMatchIndex;
                    return (
                      <div
                        key={chunk.point_id ?? chunk.chunk_id ?? i}
                        ref={el => { chunkRefs.current[i] = el; }}
                        className={`border rounded-lg overflow-hidden transition-colors ${isActive ? 'border-[#facb01] ring-2 ring-[#facb01]/30' : 'border-gray-200'}`}
                      >
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-semibold text-gray-700">Đoạn #{chunk.chunk_index + 1}</span>
                            <span className="text-xs text-gray-400">{chunk.char_count.toLocaleString()} ký tự</span>
                            <span className="text-xs text-gray-400">Bắt đầu: {start.toLocaleString()}  Kết thúc: {end.toLocaleString()}</span>
                          </div>
                          <button
                            onClick={() => handleCopyChunk(chunk.chunk_text, originalIndex)}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          >
                            {copiedIndex === originalIndex ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                            {copiedIndex === originalIndex ? 'Đã sao chép' : 'Sao chép đoạn'}
                          </button>
                        </div>
                        <div className="px-4 py-3">
                          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {highlightText(chunk.chunk_text, searchQuery)}
                          </p>
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
