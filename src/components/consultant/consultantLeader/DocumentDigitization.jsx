import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Search,
  Upload,
  FolderPlus,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  File,
  Download,
  Eye,
  Trash2,
  X,
  FileText,
  CheckSquare,
  ScanText,
  Loader2,
} from 'lucide-react';
import { digitizationAPI } from '../../../services/fastapi';
import { toast } from 'react-toastify';

const PAGE_SIZE = 9;

// Flatten cây thư mục thành mảng phẳng để dùng cho <select>, giữ lại depth để indent
function flattenTree(nodes, depth = 0) {
  const result = [];
  for (const node of nodes) {
    result.push({ id: node.folder_id, name: node.folder_name, depth });
    if (node.children?.length) {
      result.push(...flattenTree(node.children, depth + 1));
    }
  }
  return result;
}

const STATUS_CONFIG = {
  completed:  { label: 'Hoàn tất',   cls: 'bg-green-100 text-green-700 border-green-200' },
  processing: { label: 'Đang xử lý', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  pending:    { label: 'Chờ xử lý',  cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  failed:     { label: 'Thất bại',   cls: 'bg-red-100 text-red-700 border-red-200' },
};

const MIN_PANEL_WIDTH = 180;
const MAX_PANEL_WIDTH = 520;

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function Tooltip({ text, children }) {
  return (
    <div className="relative group/tip inline-flex">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5
                      opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-50">
        <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
          {text}
        </div>
        <div className="w-2 h-2 bg-gray-800 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
      </div>
    </div>
  );
}

// ─── Folder Tree Node ─────────────────────────────────────────────────────────

function TreeNode({ node, depth = 0, selectedId, onSelect, onDeleteFolder, deletingFolderId }) {
  const [open, setOpen] = useState(depth === 0);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.folder_id;
  const isDeleting = deletingFolderId === node.folder_id;

  return (
    <div>
      <div className={`group/node flex items-center rounded transition-colors
          ${isSelected ? 'bg-yellow-100 text-yellow-800 font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
        style={{ paddingLeft: `${8 + depth * 16}px`, paddingRight: '4px' }}
      >
        <button
          onClick={() => { setOpen(o => !o); onSelect(node.folder_id); }}
          className="flex-1 flex items-center gap-1.5 py-1 text-sm text-left min-w-0"
        >
          {hasChildren ? (
            open
              ? <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
              : <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
          ) : (
            <span className="w-3.5 flex-shrink-0" />
          )}
          {open && hasChildren
            ? <FolderOpen className="h-4 w-4 flex-shrink-0 text-yellow-500" />
            : <Folder      className="h-4 w-4 flex-shrink-0 text-yellow-400" />
          }
          <span className="truncate">{node.folder_name}</span>
        </button>
        <button
          onClick={(e) => onDeleteFolder?.(node.folder_id, node.folder_name, e)}
          disabled={isDeleting}
          title="Xóa thư mục"
          className="flex-shrink-0 p-1 rounded opacity-0 group-hover/node:opacity-100 hover:bg-red-100 hover:text-red-500 text-gray-400 transition-all disabled:opacity-40"
        >
          {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
        </button>
      </div>

      {open && hasChildren && (
        <div>
          {node.children.map(child => (
            <TreeNode
              key={child.folder_id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onDeleteFolder={onDeleteFolder}
              deletingFolderId={deletingFolderId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────

function UploadModal({ onClose, onUploaded, folderId, folderTree = [] }) {
  const [dragOver, setDragOver]           = useState(false);
  const [files, setFiles]                 = useState([]);
  const [rejectedCount, setRejected]      = useState(0);
  const [uploading, setUploading]         = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState(folderId ?? '');
  const inputRef                          = useRef(null);

  const flatFolders = flattenTree(folderTree);

  const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
  const addFiles = (incoming) => {
    const all      = Array.from(incoming);
    const valid    = all.filter(f => ALLOWED_TYPES.includes(f.type));
    const rejected = all.length - valid.length;
    if (rejected > 0) setRejected(rejected);
    setFiles(prev => {
      const existingNames = new Set(prev.map(f => f.name));
      return [...prev, ...valid.filter(f => !existingNames.has(f.name))];
    });
  };

  const removeFile = (name) => setFiles(prev => prev.filter(f => f.name !== name));

  const handleUpload = async () => {
    if (files.length === 0 || uploading) return;
    setUploading(true);
    const results = { ok: 0, fail: 0 };
    for (const file of files) {
      try {
        await digitizationAPI.uploadDocument(file, selectedFolderId || null);
        results.ok++;
      } catch (err) {
        results.fail++;
        console.error(`Upload "${file.name}" thất bại:`, err?.message);
      }
    }
    setUploading(false);
    if (results.ok > 0) toast.success(`Đã tải lên ${results.ok} tệp thành công`);
    if (results.fail > 0) toast.error(`${results.fail} tệp tải lên thất bại`);
    onUploaded?.();
    onClose();
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    setRejected(0);
    addFiles(e.dataTransfer.files);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-[560px] max-h-[80vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Tải lên tệp PDF</h2>
            <p className="text-xs text-gray-400 mt-0.5">Chỉ chấp nhận file PDF scan. Có thể chọn nhiều tệp.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Chọn thư mục đích */}
        <div className="px-6 pt-4">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Thư mục lưu trữ
          </label>
          <div className="relative">
            <Folder className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-400 pointer-events-none" />
            <select
              value={selectedFolderId}
              onChange={e => setSelectedFolderId(e.target.value ? Number(e.target.value) : '')}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent appearance-none"
            >
              <option value="">— Không chọn thư mục —</option>
              {flatFolders.length === 0 ? (
                <option disabled>Chưa có thư mục nào</option>
              ) : (
                flatFolders.map(f => (
                  <option key={f.id} value={f.id}>
                    {'  '.repeat(f.depth * 2)}{f.depth > 0 ? '└ ' : ''}{f.name}
                  </option>
                ))
              )}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Drop zone */}
        <div className="px-6 pt-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl py-10 cursor-pointer transition-colors
              ${dragOver
                ? 'border-yellow-400 bg-yellow-50'
                : 'border-gray-200 hover:border-yellow-300 hover:bg-gray-50'
              }`}
          >
            <div className={`p-3 rounded-full transition-colors ${dragOver ? 'bg-yellow-100' : 'bg-gray-100'}`}>
              <Upload className={`h-6 w-6 ${dragOver ? 'text-yellow-500' : 'text-gray-400'}`} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Kéo thả file vào đây, hoặc{' '}
                <span className="text-yellow-600 underline underline-offset-2">chọn từ máy tính</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">Hỗ trợ PDF, PNG, JPG · Tối đa 50MB/tệp</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,image/png,image/jpeg"
              multiple
              className="hidden"
              onChange={e => { setRejected(0); addFiles(e.target.files); }}
            />
          </div>

          {rejectedCount > 0 && (
            <div className="flex items-center justify-between mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
              <span>
                <span className="font-semibold">{rejectedCount} tệp bị từ chối</span> — chỉ chấp nhận PDF, PNG, JPG.
              </span>
              <button onClick={() => setRejected(0)} className="ml-2 hover:text-red-800 transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="px-6 pt-4 pb-2 flex-1 overflow-y-auto">
            <p className="text-xs font-medium text-gray-500 mb-2">{files.length} tệp đã chọn</p>
            <div className="space-y-2">
              {files.map(f => (
                <div key={f.name} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                  <FileText className="h-4 w-4 text-red-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate font-medium">{f.name}</p>
                    <p className="text-xs text-gray-400">{formatSize(f.size)}</p>
                  </div>
                  <button
                    onClick={() => removeFile(f.name)}
                    className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 mt-auto">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="px-4 py-2 text-sm bg-[#facb01] hover:bg-[#e8b800] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? 'Đang tải lên...' : `Tải lên${files.length > 0 ? ` (${files.length})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create Folder Modal ──────────────────────────────────────────────────────

function CreateFolderModal({ parentId, onClose, onCreated }) {
  const [name, setName]       = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setLoading(true);
      const folder = await digitizationAPI.createFolder(name.trim(), parentId ?? null);
      toast.success(`Đã tạo thư mục "${folder.folder_name}"`);
      onCreated(folder);
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Không thể tạo thư mục. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-[400px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Tạo thư mục mới</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên thư mục</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nhập tên thư mục..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>
          {parentId && (
            <p className="text-xs text-gray-400">Tạo bên trong thư mục đang chọn (ID: {parentId})</p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Hủy
            </button>
            <button type="submit" disabled={!name.trim() || loading}
              className="px-4 py-2 text-sm bg-[#facb01] hover:bg-[#e8b800] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Tạo thư mục
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DocumentDigitization() {
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folderSearch, setFolderSearch]     = useState('');
  const [fileSearch, setFileSearch]         = useState('');
  const [page, setPage]                     = useState(1);
  const [panelWidth, setPanelWidth]         = useState(240);
  const [showUpload, setShowUpload]         = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [selectedFiles, setSelectedFiles]   = useState([]);
  const [deletingDocId, setDeletingDocId]       = useState(null);
  const [deletingFolderId, setDeletingFolderId] = useState(null);
  const [runningOCR, setRunningOCR]             = useState(false);
  const [downloadingDocId, setDownloadingDocId] = useState(null);
  const [folderTree, setFolderTree]             = useState([]);
  const [treeError, setTreeError]               = useState(null);
  const [files, setFiles]                       = useState([]);
  const [filesError, setFilesError]             = useState(null);
  const [filesLoading, setFilesLoading]         = useState(false);
  const [treeLoading, setTreeLoading]           = useState(false);
  const [totalPages, setTotalPages]             = useState(1);
  const [totalDocs, setTotalDocs]               = useState(0);

  // ── Fetch folder tree ──
  const fetchFolderTree = useCallback(async () => {
    try {
      setTreeLoading(true);
      setTreeError(null);
      const tree = await digitizationAPI.getFolderTree();
      setFolderTree(tree);
    } catch (err) {
      setTreeError(err?.message || 'Không thể tải danh sách thư mục');
    } finally {
      setTreeLoading(false);
    }
  }, []);

  // ── Fetch documents ──
  // silent=true → cập nhật ngầm (polling), không bật loading spinner
  const fetchDocuments = useCallback(async (folderId, currentPage, keyword, silent = false) => {
    try {
      if (!silent) {
        setFilesLoading(true);
        setFilesError(null);
      }
      const result = await digitizationAPI.getDocuments({
        folder_id: folderId ?? undefined,
        keyword: keyword || undefined,
        page: currentPage,
        page_size: PAGE_SIZE,
      });
      setFiles(result.items);
      setTotalPages(result.total_pages || 1);
      setTotalDocs(result.total);
      if (!silent) setFilesError(null);
    } catch (err) {
      if (!silent) {
        setFilesError(err?.message || 'Không thể tải danh sách tài liệu');
        setFiles([]);
      }
    } finally {
      if (!silent) setFilesLoading(false);
    }
  }, []);

  useEffect(() => { fetchFolderTree(); }, [fetchFolderTree]);
  useEffect(() => { fetchDocuments(selectedFolder, page, fileSearch); }, [fetchDocuments, selectedFolder, page, fileSearch]);

  // ── Auto-poll khi có tài liệu đang processing (silent — không bật loading) ──
  useEffect(() => {
    const hasProcessing = files.some(f => f.status === 'processing');
    if (!hasProcessing) return;
    const timer = setInterval(() => {
      fetchDocuments(selectedFolder, page, fileSearch, true);
    }, 4000);
    return () => clearInterval(timer);
  }, [files, selectedFolder, page, fileSearch, fetchDocuments]);

  // ── Resize drag ──
  const dragging    = useRef(false);
  const startX      = useRef(0);
  const startWidth  = useRef(0);

  const onMouseDown = useCallback((e) => {
    dragging.current   = true;
    startX.current     = e.clientX;
    startWidth.current = panelWidth;
    document.body.style.cursor     = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (e) => {
      if (!dragging.current) return;
      const delta = e.clientX - startX.current;
      const next  = Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, startWidth.current + delta));
      setPanelWidth(next);
    };

    const onMouseUp = () => {
      dragging.current = false;
      document.body.style.cursor     = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [panelWidth]);

  // ── Selection (dùng document_id từ server) ──
  const pageIds     = files.map(f => f.document_id);
  const allSelected = pageIds.length > 0 && pageIds.every(id => selectedFiles.includes(id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedFiles(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedFiles(prev => [...new Set([...prev, ...pageIds])]);
    }
  };

  const toggleFile = (id) => {
    setSelectedFiles(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSearch = (val) => { setFileSearch(val); setPage(1); };

  const handleDeleteDocument = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc muốn xóa tài liệu này?')) return;
    try {
      setDeletingDocId(id);
      await digitizationAPI.deleteDocument(id);
      toast.success('Đã xóa tài liệu');
      setSelectedFiles(prev => prev.filter(i => i !== id));
      fetchDocuments(selectedFolder, page, fileSearch);
    } catch (err) {
      toast.error(err?.message || 'Không thể xóa tài liệu');
    } finally {
      setDeletingDocId(null);
    }
  };

  const handleDeleteFolder = async (id, name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Xóa thư mục "${name}" và toàn bộ tài liệu bên trong?`)) return;
    try {
      setDeletingFolderId(id);
      await digitizationAPI.deleteFolder(id);
      toast.success(`Đã xóa thư mục "${name}"`);
      if (selectedFolder === id) setSelectedFolder(null);
      fetchFolderTree();
      fetchDocuments(selectedFolder === id ? null : selectedFolder, page, fileSearch);
    } catch (err) {
      toast.error(err?.message || 'Không thể xóa thư mục');
    } finally {
      setDeletingFolderId(null);
    }
  };

  const handleRunOCR = async () => {
    if (selectedFiles.length === 0 || runningOCR) return;
    setRunningOCR(true);
    let ok = 0;
    let fail = 0;
    for (const id of selectedFiles) {
      try {
        await digitizationAPI.runOCR(id);
        ok++;
      } catch (err) {
        fail++;
        console.error(`OCR thất bại cho document ${id}:`, err?.message);
      }
    }
    setRunningOCR(false);
    setSelectedFiles([]);
    if (ok > 0) toast.success(`Đã bắt đầu số hóa ${ok} tài liệu`);
    if (fail > 0) toast.error(`${fail} tài liệu không thể bắt đầu số hóa`);
    // Refresh to show updated "processing" status
    fetchDocuments(selectedFolder, page, fileSearch);
  };

  const handleDownload = async (id, fileName, e) => {
    e.stopPropagation();
    try {
      setDownloadingDocId(id);
      const blob = await digitizationAPI.downloadDocument(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}_searchable.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err?.message || 'Không thể tải xuống tài liệu');
    } finally {
      setDownloadingDocId(null);
    }
  };

  return (
    <div className="min-h-screen h-screen flex flex-col bg-[#F8FAFC]">
      <style>{`
        @keyframes ocr-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
      {/* ── Upload Modal ── */}
      {showUpload && (
        <UploadModal
          folderId={selectedFolder}
          folderTree={folderTree}
          onClose={() => setShowUpload(false)}
          onUploaded={() => fetchDocuments(selectedFolder, page, fileSearch)}
        />
      )}
      {/* ── Create Folder Modal ── */}
      {showCreateFolder && (
        <CreateFolderModal
          parentId={selectedFolder}
          onClose={() => setShowCreateFolder(false)}
          onCreated={() => fetchFolderTree()}
        />
      )}

      {/* ── Page Header ── */}
      <div className="px-6 pt-6 pb-4 flex-shrink-0">
        <h1 className="text-2xl font-semibold">Số Hóa Tài Liệu</h1>
        <p className="text-muted-foreground text-sm">Chuyển đổi tài liệu scan thành PDF có thể tìm kiếm và sao chép văn bản</p>
      </div>

      {/* ── Body: two-panel ── */}
      <div className="flex flex-1 gap-0 px-6 pb-6 overflow-hidden">

        {/* ── LEFT: Folder Tree ── */}
        <div
          className="flex-shrink-0 bg-white rounded-l-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden"
          style={{ width: panelWidth }}
        >
          <div className="p-3 border-b border-gray-100 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm thư mục"
                value={folderSearch}
                onChange={e => setFolderSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {treeError ? (
              <div className="flex flex-col items-center gap-2 py-6 px-2 text-center">
                <p className="text-xs text-red-500">{treeError}</p>
                <button
                  onClick={fetchFolderTree}
                  className="text-xs text-yellow-700 underline hover:text-yellow-900"
                >Thử lại</button>
              </div>
            ) : treeLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : folderTree.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Chưa có thư mục nào</p>
            ) : null}
            {folderTree.map(node => (
              <TreeNode
                key={node.folder_id}
                node={node}
                selectedId={selectedFolder}
                onSelect={setSelectedFolder}
                onDeleteFolder={handleDeleteFolder}
                deletingFolderId={deletingFolderId}
              />
            ))}
          </div>

          <div className="p-3 border-t border-gray-100 text-xs text-gray-500 flex-shrink-0">
            {treeLoading
              ? <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
              : <>Thư mục: <span className="font-medium text-gray-700">{folderTree.length}</span>. </>
            }
            Tài liệu: <span className="font-medium text-gray-700">{totalDocs}</span>.
          </div>
        </div>

        {/* ── DRAG HANDLE ── */}
        <div
          onMouseDown={onMouseDown}
          className="w-1.5 flex-shrink-0 cursor-col-resize bg-transparent hover:bg-yellow-300 active:bg-yellow-400 transition-colors group relative"
          title="Kéo để thay đổi kích thước"
        >
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gray-200 group-hover:bg-yellow-400 transition-colors" />
        </div>

        {/* ── RIGHT: File List ── */}
        <div className="flex-1 bg-white rounded-r-xl border border-l-0 border-gray-200 shadow-sm flex flex-col overflow-hidden">

          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 flex-shrink-0 flex-wrap">
            <div className="relative flex-1 min-w-40">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={fileSearch}
                onChange={e => handleSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleRunOCR}
              disabled={selectedFiles.length === 0 || runningOCR}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#facb01] hover:bg-[#e8b800] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex-shrink-0"
            >
              {runningOCR
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <ScanText className="h-4 w-4" />
              }
              {runningOCR ? 'Đang xử lý...' : `Số hóa${selectedFiles.length > 0 ? ` (${selectedFiles.length})` : ''}`}
            </button>

            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
            >
              <Upload className="h-4 w-4 text-gray-600" />
              Tải lên tệp
            </button>

            <button
              onClick={() => setShowCreateFolder(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0">
              <FolderPlus className="h-4 w-4 text-gray-600" />
              Tạo thư mục
            </button>

            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
            >
              <CheckSquare className="h-4 w-4 text-gray-600" />
              {allSelected ? 'Bỏ chọn' : 'Chọn tất cả'}
            </button>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="w-8 px-3 py-2.5 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 accent-yellow-400"
                    />
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-600">Tên Tệp</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-600">Trạng Thái</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-600">Ngày Tạo</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-600">Xử Lý</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-600">Người Tạo</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filesLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-400">
                      <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin opacity-40" />
                      Đang tải...
                    </td>
                  </tr>
                ) : filesError ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <p className="text-sm text-red-500 mb-2">{filesError}</p>
                      <button
                        onClick={() => fetchDocuments(selectedFolder, page, fileSearch)}
                        className="text-xs text-yellow-700 underline hover:text-yellow-900"
                      >Thử lại</button>
                    </td>
                  </tr>
                ) : files.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-400">
                      <File className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      Không có tệp nào
                    </td>
                  </tr>
                ) : (
                  files.map(file => {
                    const st = STATUS_CONFIG[file.status] || STATUS_CONFIG.pending;
                    const createdDate = file.created_at
                      ? new Date(file.created_at).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' })
                      : '—';
                    return (
                      <tr
                        key={file.document_id}
                        onClick={() => toggleFile(file.document_id)}
                        className={`transition-colors cursor-pointer hover:bg-gray-50 ${selectedFiles.includes(file.document_id) ? 'bg-yellow-50' : ''}`}
                      >
                        <td className="px-3 py-2.5">
                          <input
                            type="checkbox"
                            checked={selectedFiles.includes(file.document_id)}
                            onChange={() => toggleFile(file.document_id)}
                            className="rounded border-gray-300 accent-yellow-400"
                          />
                        </td>
                        <td className="px-3 py-2.5 font-medium text-gray-800">{file.file_name}</td>
                        <td className="px-3 py-2.5 min-w-[160px]">
                          {file.status === 'processing' ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500 flex-shrink-0" />
                                <span className="text-xs text-blue-600 font-medium">Đang xử lý</span>
                                {file.total_pages > 0 && (
                                  <span className="text-xs text-blue-400 ml-auto">
                                    {file.completed_pages}/{file.total_pages} trang
                                  </span>
                                )}
                              </div>
                              {file.total_pages > 0 && (
                                <div className="w-full bg-blue-100 rounded-full h-1.5">
                                  <div
                                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.round((file.completed_pages / file.total_pages) * 100)}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${st.cls}`}>
                              {st.label}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-gray-600 tabular-nums whitespace-nowrap">{createdDate}</td>
                        <td className="px-3 py-2.5 text-gray-600 tabular-nums whitespace-nowrap">{file.created_time || '—'}</td>
                        <td className="px-3 py-2.5 text-gray-600">{file.creator_name || '—'}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <Tooltip text={file.status === 'completed' ? 'Tải xuống PDF' : 'Chưa hoàn tất OCR'}>
                              <button
                                onClick={(e) => file.status === 'completed' && handleDownload(file.document_id, file.file_name, e)}
                                disabled={file.status !== 'completed' || downloadingDocId === file.document_id}
                                className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                {downloadingDocId === file.document_id
                                  ? <Loader2 className="h-4 w-4 animate-spin" />
                                  : <Download className="h-4 w-4" />
                                }
                              </button>
                            </Tooltip>
                            <Tooltip text="Xem chi tiết">
                              <button className="p-1.5 rounded hover:bg-yellow-50 text-gray-400 hover:text-yellow-600 transition-colors">
                                <Eye className="h-4 w-4" />
                              </button>
                            </Tooltip>
                            <Tooltip text="Xóa">
                              <button
                                onClick={(e) => handleDeleteDocument(file.document_id, e)}
                                disabled={deletingDocId === file.document_id}
                                className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                              >
                                {deletingDocId === file.document_id
                                  ? <Loader2 className="h-4 w-4 animate-spin" />
                                  : <Trash2 className="h-4 w-4" />}
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-end gap-1.5 px-4 py-3 border-t border-gray-100 flex-shrink-0">
            <button onClick={() => setPage(1)} disabled={page === 1} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronsLeft className="h-4 w-4 text-gray-600" />
            </button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            <span className="text-sm text-gray-600 px-2 select-none">
              Trang <span className="font-medium text-gray-800">{page}</span> / {totalPages}
            </span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronsRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
