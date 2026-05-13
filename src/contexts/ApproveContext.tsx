import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Minus, X, Loader2, CheckCircle2, XCircle, ShieldCheck, LogIn } from 'lucide-react';
import { knowledgeAPI } from '../services/fastapi';
import { AuthenticationError } from '../utils/fastapi-client';

interface ApproveWidgetState {
  visible: boolean;
  minimized: boolean;
  phase: 'processing' | 'done' | 'error';
  isAuthError: boolean;
  docTitle: string;
  totalChunks: number;
  currentChunk: number;
  progress: number;
  errorMsg: string;
}

interface ApproveContextType {
  startApprove: (id: number, docTitle: string, onDone?: () => void, onError?: () => void) => void;
}

const ApproveContext = createContext<ApproveContextType | null>(null);

export function useApprove() {
  const ctx = useContext(ApproveContext);
  if (!ctx) throw new Error('useApprove must be used within ApproveProvider');
  return ctx;
}

const INITIAL: ApproveWidgetState = {
  visible: false,
  minimized: false,
  phase: 'processing',
  isAuthError: false,
  docTitle: '',
  totalChunks: 0,
  currentChunk: 0,
  progress: 0,
  errorMsg: '',
};

const POLL_INTERVAL_MS = 2000;

export function ApproveProvider({ children }: { children: ReactNode }) {
  const [widget, setWidget] = useState<ApproveWidgetState>(INITIAL);
  const versionRef = useRef(0);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPoll = () => {
    if (pollIntervalRef.current !== null) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

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

  const startApprove = (id: number, docTitle: string, onDone?: () => void, onError?: () => void) => {
    const myVersion = ++versionRef.current;
    clearPoll();
    setWidget({ ...INITIAL, visible: true, docTitle });

    knowledgeAPI
      .approveDocument(id)
      .then(() => {
        if (versionRef.current !== myVersion) return;

        // Start polling task-status
        const pollId = setInterval(async () => {
          if (versionRef.current !== myVersion) {
            clearInterval(pollId);
            return;
          }
          try {
            const task = await knowledgeAPI.getDocumentTaskStatus(id, 'approve');
            if (!task || versionRef.current !== myVersion) return;

            setWidget(p => ({
              ...p,
              totalChunks: task.total_items,
              currentChunk: task.completed_items,
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
                errorMsg: task.error_message || 'Phê duyệt thất bại',
              }));
              onError?.();
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
              onError?.();
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
        onError?.();
      });
  };

  const handleDismiss = () => {
    if (widget.phase === 'processing') {
      setWidget((p) => ({ ...p, minimized: true }));
    } else {
      setWidget(INITIAL);
    }
  };

  const handleExpand = () => setWidget((p) => ({ ...p, minimized: false }));

  return (
    <ApproveContext.Provider value={{ startApprove }}>
      <style>{`
        @keyframes approve-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
      {children}

      {widget.visible && (widget.minimized ? (
        <button
          onClick={handleExpand}
          title="Xem tiến trình phê duyệt"
          className="fixed bottom-5 right-5 z-[9999] w-11 h-11 rounded-full shadow-lg flex items-center justify-center bg-[#facb01] hover:bg-[#e8b800] transition-colors"
        >
          <ShieldCheck className="h-5 w-5 text-white" />
          <Loader2 className="h-5 w-5 text-white animate-spin absolute opacity-40" />
        </button>
      ) : (
        <div className={`fixed bottom-5 right-5 z-[9999] w-72 rounded-2xl shadow-xl overflow-hidden border ${
          widget.phase === 'done'  ? 'bg-green-50 border-green-200' :
          widget.phase === 'error' ? 'bg-red-50 border-red-200'     :
                                     'bg-yellow-50 border-yellow-200'
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
                  <ShieldCheck className="h-4 w-4 text-yellow-600" />
                  <Loader2 className="h-2.5 w-2.5 text-yellow-600 animate-spin absolute -bottom-0.5 -right-0.5" />
                </div>
              )}
              {widget.phase === 'done'  && <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />}
              {widget.phase === 'error' && <XCircle      className="h-4 w-4 text-red-500 shrink-0" />}
              <span className={`text-sm font-semibold ${
                widget.phase === 'done'  ? 'text-green-800' :
                widget.phase === 'error' ? 'text-red-700'   : 'text-yellow-900'
              }`}>
                {widget.phase === 'processing' ? 'Đang phê duyệt...' :
                 widget.phase === 'done'       ? 'Phê duyệt thành công' : 'Phê duyệt thất bại'}
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
            <p className="text-xs text-gray-500 truncate" title={widget.docTitle}>
              {widget.docTitle}
            </p>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-gray-500">
                  {widget.phase === 'processing'
                    ? widget.totalChunks > 0
                      ? `Đoạn ${widget.currentChunk} / ${widget.totalChunks}`
                      : 'Đang khởi động...'
                    : widget.phase === 'done'
                    ? `${widget.totalChunks} đoạn đã lập chỉ mục`
                    : widget.errorMsg || 'Phê duyệt thất bại'}
                </span>
                <span className={`text-xs font-bold ${
                  widget.phase === 'done'  ? 'text-green-700' :
                  widget.phase === 'error' ? 'text-red-600'   : 'text-yellow-700'
                }`}>{widget.progress}%</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${
                widget.phase === 'done'  ? 'bg-green-100' :
                widget.phase === 'error' ? 'bg-red-100'   : 'bg-yellow-100'
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
                        animation: 'approve-shimmer 1.4s ease-in-out infinite',
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {widget.phase === 'done' && (
              <p className="text-xs text-green-600">✓ Tài liệu đã được phê duyệt và lập chỉ mục.</p>
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
    </ApproveContext.Provider>
  );
}
