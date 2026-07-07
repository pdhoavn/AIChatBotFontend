import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Minus, X, Loader2, CheckCircle2, XCircle, ScanText, LogIn } from 'lucide-react';
import { knowledgeAPI } from '../services/fastapi';
import { AuthenticationError } from '../utils/fastapi-client';

interface OCRWidgetState {
  visible: boolean;
  minimized: boolean;
  phase: 'processing' | 'done' | 'error';
  isAuthError: boolean;
  fileName: string;
  totalPages: number;
  currentPage: number;
  progress: number;
  errorMsg: string;
}

interface OCRContextType {
  startOCR: (
    formData: FormData,
    intentId: number,
    target_audiences: string[],
    target_units: string[],
    onDone?: () => void
  ) => void;
}

const OCRContext = createContext<OCRContextType | null>(null);

export function useOCR() {
  const ctx = useContext(OCRContext);
  if (!ctx) throw new Error('useOCR must be used within OCRProvider');
  return ctx;
}

const INITIAL: OCRWidgetState = {
  visible: false,
  minimized: false,
  phase: 'processing',
  isAuthError: false,
  fileName: '',
  totalPages: 0,
  currentPage: 0,
  progress: 0,
  errorMsg: '',
};

const POLL_INTERVAL_MS = 2000;

export function OCRProvider({ children }: { children: ReactNode }) {
  const [widget, setWidget] = useState<OCRWidgetState>(INITIAL);
  const versionRef = useRef(0);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPoll = () => {
    if (pollIntervalRef.current !== null) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  // Tự dismiss sau khi done (4s) hoặc error (6s) — chỉ khi đang expanded
  useEffect(() => {
    if (!widget.visible || widget.minimized) return;
    if (widget.phase === 'done') {
      const t = setTimeout(() => setWidget(INITIAL), 4000);
      return () => clearTimeout(t);
    }
    if (widget.phase === 'error') {
      const t = setTimeout(() => setWidget(INITIAL), 6000);
      return () => clearTimeout(t);
    }
  }, [widget.phase, widget.visible, widget.minimized]);

  // Cleanup poll on unmount
  useEffect(() => () => clearPoll(), []);

  const startOCR = (
    formData: FormData,
    intentId: number,
    target_audiences: string[],
    onDone?: () => void
  ) => {
    const fileName =
      (formData.get('title') as string) ||
      (formData.get('file') as File)?.name ||
      '';

    const myVersion = ++versionRef.current;
    clearPoll();
    setWidget({ ...INITIAL, visible: true, fileName });

    knowledgeAPI
      .uploadDocumentOCR(formData, intentId, target_audiences)
      .then(({ document_id }) => {
        if (versionRef.current !== myVersion) return;

        // Start polling task-status
        const pollId = setInterval(async () => {
          if (versionRef.current !== myVersion) {
            clearInterval(pollId);
            return;
          }
          try {
            const task = await knowledgeAPI.getDocumentTaskStatus(document_id, 'ocr');
            if (!task || versionRef.current !== myVersion) return;

            setWidget(p => ({
              ...p,
              totalPages: task.total_items,
              currentPage: task.completed_items,
              progress: task.progress,
            }));

            if (task.status === 'completed') {
              clearInterval(pollId);
              pollIntervalRef.current = null;
              setWidget(p => ({ ...p, phase: 'done', progress: 100, minimized: false }));
              onDone?.();
            } else if (task.status === 'failed') {
              clearInterval(pollId);
              pollIntervalRef.current = null;
              setWidget(p => ({
                ...p,
                phase: 'error',
                minimized: false,
                errorMsg: task.error_message || 'OCR thất bại',
              }));
            }
          } catch (err) {
            // Nếu token hết hạn → dừng polling, hiện lỗi auth
            if (err instanceof AuthenticationError) {
              clearInterval(pollId);
              pollIntervalRef.current = null;
              setWidget(p => ({
                ...p,
                phase: 'error',
                minimized: false,
                isAuthError: true,
                errorMsg: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
              }));
            }
            // Lỗi mạng tạm thời → bỏ qua tick này, tiếp tục poll
          }
        }, POLL_INTERVAL_MS);

        pollIntervalRef.current = pollId;
      })
      .catch((error: Error) => {
        if (versionRef.current !== myVersion) return;
        const isAuth = error instanceof AuthenticationError;
        setWidget(p => ({
          ...p,
          phase: 'error',
          minimized: false,
          isAuthError: isAuth,
          errorMsg: isAuth
            ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
            : error.message,
        }));
      });
  };

  // ✕ khi đang xử lý → thu nhỏ thành icon
  // ✕ khi xong/lỗi → ẩn hẳn
  const handleDismiss = () => {
    if (widget.phase === 'processing') {
      setWidget((p) => ({ ...p, minimized: true }));
    } else {
      setWidget(INITIAL);
    }
  };

  const handleExpand = () => setWidget((p) => ({ ...p, minimized: false }));

  return (
    <OCRContext.Provider value={{ startOCR }}>
      <style>{`
        @keyframes ocr-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
      {children}

      {/* ── OCR Widget — chỉ render khi có tiến trình ── */}
      {widget.visible && (widget.minimized ? (
        <button
          onClick={handleExpand}
          title="Xem tiến trình OCR"
          className="fixed bottom-5 left-5 z-[9999] w-11 h-11 rounded-full shadow-lg flex items-center justify-center bg-amber-400 hover:bg-amber-500 transition-colors"
        >
          <ScanText className="h-5 w-5 text-white" />
          <Loader2 className="h-5 w-5 text-white animate-spin absolute opacity-40" />
        </button>

      ) : (
        /* ── Expanded: full widget ── */
        <div className={`fixed bottom-5 left-5 z-[9999] w-72 rounded-2xl shadow-xl overflow-hidden border ${
          widget.phase === 'done'  ? 'bg-green-50 border-green-200' :
          widget.phase === 'error' ? 'bg-red-50 border-red-200'     :
                                     'bg-amber-50 border-amber-200'
        }`}>

          {/* Accent bar */}
          <div className={`h-1 w-full ${
            widget.phase === 'done'  ? 'bg-green-400' :
            widget.phase === 'error' ? 'bg-red-400'   : 'bg-[#facb01]'
          }`} />

          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div className="flex items-center gap-2">
              {widget.phase === 'processing' && (
                <div className="relative shrink-0">
                  <ScanText className="h-4 w-4 text-amber-600" />
                  <Loader2 className="h-2.5 w-2.5 text-amber-600 animate-spin absolute -bottom-0.5 -right-0.5" />
                </div>
              )}
              {widget.phase === 'done'  && <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />}
              {widget.phase === 'error' && <XCircle      className="h-4 w-4 text-red-500 shrink-0" />}
              <span className={`text-sm font-semibold ${
                widget.phase === 'done'  ? 'text-green-800' :
                widget.phase === 'error' ? 'text-red-700'   : 'text-amber-900'
              }`}>
                {widget.phase === 'processing' ? 'Đang xử lý OCR...' :
                 widget.phase === 'done'       ? 'OCR hoàn tất'       : 'OCR thất bại'}
              </span>
            </div>
            <button
              onClick={handleDismiss}
              title={widget.phase === 'processing' ? 'Thu nhỏ' : 'Đóng'}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-2 shrink-0"
            >
              {widget.phase === 'processing' ? <Minus className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </button>
          </div>

          {/* Body */}
          <div className="px-4 pb-4 space-y-2.5">
            <p className="text-xs text-gray-500 truncate" title={widget.fileName}>
              {widget.fileName}
            </p>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-gray-500">
                  {widget.phase === 'processing'
                    ? widget.totalPages > 0
                      ? `Trang ${widget.currentPage} / ${widget.totalPages}`
                      : 'Đang khởi động...'
                    : widget.phase === 'done'
                    ? 'Hoàn tất'
                    : widget.errorMsg || 'Tải lên thất bại'}
                </span>
                <span className={`text-xs font-bold ${
                  widget.phase === 'done'  ? 'text-green-700' :
                  widget.phase === 'error' ? 'text-red-600'   : 'text-amber-700'
                }`}>{widget.progress}%</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${
                widget.phase === 'done'  ? 'bg-green-100' :
                widget.phase === 'error' ? 'bg-red-100'   : 'bg-amber-100'
              }`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden ${
                    widget.phase === 'done'  ? 'bg-green-400' :
                    widget.phase === 'error' ? 'bg-red-400'   : 'bg-[#facb01]'
                  }`}
                  style={{ width: `${widget.progress}%` }}
                >
                  {widget.phase === 'processing' && (
                    <div
                      className="absolute inset-0 w-1/2"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)',
                        animation: 'ocr-shimmer 1.4s ease-in-out infinite',
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {widget.phase === 'done' && (
              <p className="text-xs text-green-600">✓ Đã lưu — đang chờ phê duyệt.</p>
            )}
            {widget.phase === 'error' && (
              <div className="flex items-center justify-between gap-2">
                {widget.isAuthError ? (
                  <a
                    href="/login"
                    className="flex items-center gap-1 text-xs text-red-600 font-medium underline hover:text-red-800 transition-colors"
                  >
                    <LogIn className="h-3 w-3" />
                    Đăng nhập lại
                  </a>
                ) : (
                  <span />
                )}
                <button
                  onClick={() => setWidget(INITIAL)}
                  className="text-xs text-red-500 underline hover:text-red-700 transition-colors"
                >
                  Đóng
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </OCRContext.Provider>
  );
}
