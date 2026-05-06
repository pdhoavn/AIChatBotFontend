import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Minus, X, Loader2, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { knowledgeAPI } from '../services/fastapi';

interface ApproveWidgetState {
  visible: boolean;
  minimized: boolean;
  phase: 'processing' | 'done' | 'error';
  docTitle: string;
  totalChunks: number;
  currentChunk: number;
  progress: number;
  errorMsg: string;
}

interface ApproveContextType {
  startApprove: (id: number, docTitle: string, onDone?: () => void) => void;
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
  docTitle: '',
  totalChunks: 0,
  currentChunk: 0,
  progress: 0,
  errorMsg: '',
};

export function ApproveProvider({ children }: { children: ReactNode }) {
  const [widget, setWidget] = useState<ApproveWidgetState>(INITIAL);
  const versionRef = useRef(0);

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

  const startApprove = (id: number, docTitle: string, onDone?: () => void) => {
    const myVersion = ++versionRef.current;
    setWidget({ ...INITIAL, visible: true, docTitle });

    knowledgeAPI
      .approveDocumentStream(id, (data) => {
        if (versionRef.current !== myVersion) return;
        if (data.event === 'start') {
          setWidget((p) => ({ ...p, totalChunks: data.total_chunks as number }));
        } else if (data.event === 'progress') {
          setWidget((p) => ({
            ...p,
            currentChunk: data.chunk as number,
            progress: data.progress as number,
          }));
        } else if (data.event === 'done') {
          setWidget((p) => ({ ...p, phase: 'done', progress: 100, minimized: false }));
          onDone?.();
        } else if (data.event === 'error') {
          setWidget((p) => ({
            ...p,
            phase: 'error',
            minimized: false,
            errorMsg: data.message as string,
          }));
        }
      })
      .catch((error: Error) => {
        if (versionRef.current !== myVersion) return;
        setWidget((p) => ({ ...p, phase: 'error', minimized: false, errorMsg: error.message }));
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
              <button
                onClick={() => setWidget(INITIAL)}
                className="text-xs text-red-500 underline hover:text-red-700 transition-colors"
              >
                Đóng thông báo
              </button>
            )}
          </div>
        </div>
      ))}
    </ApproveContext.Provider>
  );
}
