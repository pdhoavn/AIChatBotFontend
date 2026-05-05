import { useState, useEffect, useRef } from 'react';
import { X, Upload, ChevronDown, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { Intent } from './types';
import { Input } from '../../ui/system_users/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/system_users/select';
import { Button } from '../../ui/system_users/button';

const AUDIENCE_OPTIONS = [
  'Viên chức/Người lao động',
  'Sinh viên',
  'Phụ huynh',
  'Tuyển sinh',
] as const;

type Audience = typeof AUDIENCE_OPTIONS[number];

const AUDIENCE_COLORS: Record<string, string> = {
  'Viên chức/Người lao động': 'bg-blue-100 text-blue-700 border-blue-200',
  'Sinh viên':                 'bg-green-100 text-green-700 border-green-200',
  'Phụ huynh':                 'bg-purple-100 text-purple-700 border-purple-200',
  'Tuyển sinh':                'bg-yellow-100 text-yellow-700 border-yellow-200',
};

const AUDIENCE_VALUE_MAP: Record<Audience, string> = {
  'Viên chức/Người lao động': 'CANBO',
  'Sinh viên':                 'SINHVIEN',
  'Phụ huynh':                 'PHUHUYNH',
  'Tuyển sinh':                'TUYENSINH',
};

interface UploadDocumentModalProps {
  intents: Intent[];
  onClose: () => void;
  onSubmit: (formData: FormData, intentId: number, target_audiences: string[]) => Promise<void>;
  // Sync — đóng modal ngay, OCR chạy nền ở TrainingDataManagement
  onStartOCR?: (formData: FormData, intentId: number, target_audiences: string[]) => void;
}

export function UploadDocumentModal({ intents, onClose, onSubmit, onStartOCR }: UploadDocumentModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [intentId, setIntentId] = useState<number | undefined>(undefined);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [audienceOpen, setAudienceOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOCRPrompt, setShowOCRPrompt] = useState(false);
  const audienceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (audienceRef.current && !audienceRef.current.contains(e.target as Node)) {
        setAudienceOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleAudience = (option: Audience) => {
    setAudiences(prev =>
      prev.includes(option) ? prev.filter(a => a !== option) : [...prev, option]
    );
  };

  const ALLOWED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.xlsx'];

  const detectScannedPDF = async (f: File): Promise<boolean> => {
    const buffer = await f.arrayBuffer();
    const slice = buffer.slice(0, Math.min(buffer.byteLength, 2_000_000));
    const text = new TextDecoder('latin1').decode(slice);
    const textOps = (text.match(/\)\s*Tj|\]\s*TJ/g) ?? []).length;
    return textOps < 5;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const ext = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
      const validType = ALLOWED_TYPES.includes(selectedFile.type);
      const validExt = ALLOWED_EXTENSIONS.includes(ext);

      if (!validType || !validExt) {
        alert('Định dạng file không hợp lệ. Chỉ chấp nhận: PDF, DOCX, TXT, XLSX');
        e.target.value = '';
        return;
      }

      setFile(selectedFile);
      setShowOCRPrompt(false);
      if (!title) setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));

      if (selectedFile.type === 'application/pdf') {
        detectScannedPDF(selectedFile).then(isScanned => {
          if (isScanned) setShowOCRPrompt(true);
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!file) { alert('Vui lòng chọn file'); return; }
    if (!title.trim()) { alert('Vui lòng nhập tiêu đề'); return; }
    if (audiences.length === 0) { alert('Vui lòng chọn ít nhất một đối tượng'); return; }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    const resolvedIntentId = intentId ?? 0;
    const audienceValues = audiences.map(a => AUDIENCE_VALUE_MAP[a]);

    // OCR: đóng modal ngay, widget chạy nền
    if (showOCRPrompt && onStartOCR) {
      onStartOCR(formData, resolvedIntentId, audienceValues);
      onClose();
      return;
    }

    // Upload thường
    try {
      setLoading(true);
      await onSubmit(formData, resolvedIntentId, audienceValues);
      onClose();
    } catch (error) {
      const err = error as Error & { apiStatus?: string };
      if (err.apiStatus === 'SCANNED_PDF') setShowOCRPrompt(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

        <div className="flex items-center justify-between p-6 border-b shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Tải Lên Tài Liệu Mới</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* File */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn File <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#facb01] rounded-lg cursor-pointer bg-white hover:bg-yellow-50 transition-colors"
              >
                <Upload className="h-5 w-5 text-[#facb01]" />
                <span className="font-medium text-[#facb01]">
                  {file ? file.name : 'Chọn File'}
                </span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.txt,.xlsx"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">Định dạng: PDF, DOCX, TXT, XLSX</p>
            </div>

            {showOCRPrompt && (
              <div className="flex items-start gap-2 p-3 mt-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">File PDF chứa ảnh scan</p>
                  <p className="text-amber-700 mt-0.5">
                    File này chứa ảnh scan, không thể trích xuất trực tiếp. Nhấn <strong>"Tải lên với OCR"</strong> để hệ thống tự động nhận dạng văn bản — quá trình chạy nền, bạn vẫn dùng được ứng dụng.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tiêu đề */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu Đề <span className="text-red-500">*</span>
            </label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tiêu đề tài liệu..." />
          </div>

          {/* Đối tượng */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Đối tượng <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setAudiences(audiences.length === AUDIENCE_OPTIONS.length ? [] : [...AUDIENCE_OPTIONS])}
                className="text-xs text-[#facb01] hover:underline"
              >
                {audiences.length === AUDIENCE_OPTIONS.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </button>
            </div>
            <div ref={audienceRef} className="relative">
              <button
                type="button"
                onClick={() => setAudienceOpen(prev => !prev)}
                className="w-full flex items-center justify-between rounded-md border border-input bg-gray-100 px-3 py-2 text-sm shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-colors"
              >
                {audiences.length === 0 ? (
                  <span className="text-gray-400">Chọn đối tượng...</span>
                ) : (
                  <span className="flex flex-wrap gap-1">
                    {audiences.map(a => (
                      <span key={a} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${AUDIENCE_COLORS[a]}`}>
                        {a}
                      </span>
                    ))}
                  </span>
                )}
                <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
              </button>

              {audienceOpen && (
                <div className="absolute z-50 bottom-full mb-1 w-full rounded-md border bg-white shadow-md">
                  {AUDIENCE_OPTIONS.map((option) => {
                    const selected = audiences.includes(option);
                    return (
                      <div
                        key={option}
                        onClick={() => toggleAudience(option)}
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm select-none"
                      >
                        <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${selected ? 'bg-[#facb01] border-[#facb01]' : 'border-gray-300'}`}>
                          {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${AUDIENCE_COLORS[option]}`}>
                          {option}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Lĩnh vực */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lĩnh vực</label>
            <Select value={intentId?.toString() || ''} onValueChange={(value) => setIntentId(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn lĩnh vực" />
              </SelectTrigger>
              <SelectContent side="top">
                {intents.map((intent) => (
                  <SelectItem key={intent.intent_id} value={intent.intent_id.toString()}>
                    {intent.intent_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-6 border-t bg-gray-50 shrink-0">
          <Button onClick={onClose} variant="outline" className="hover:bg-gray-100 hover:border-gray-400" disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} className="bg-[#facb01] hover:bg-[#e8b800]" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tải lên...
              </span>
            ) : showOCRPrompt ? 'Tải lên với OCR' : 'Tải Lên'}
          </Button>
        </div>
      </div>
    </div>
  );
}
