import { useState, useEffect, useRef } from 'react';
import { X, Upload, ChevronDown, Check } from 'lucide-react';
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
  'Tuyển sinh':                'bg-orange-100 text-orange-700 border-orange-200',
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
}

export function UploadDocumentModal({ intents, onClose, onSubmit }: UploadDocumentModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [intentId, setIntentId] = useState<number | undefined>(undefined);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [audienceOpen, setAudienceOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      alert('Vui lòng chọn file');
      return;
    }
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề');
      return;
    }
    if (!intentId) {
      alert('Vui lòng chọn danh mục');
      return;
    }
    if (audiences.length === 0) {
      alert('Vui lòng chọn ít nhất một đối tượng');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);

      await onSubmit(formData, intentId, audiences.map(a => AUDIENCE_VALUE_MAP[a]));
      onClose();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Tải Lên Tài Liệu Mới</h2>
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
              Chọn File <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#EB5A0D] rounded-lg cursor-pointer bg-white hover:bg-orange-50 transition-colors"
              >
                <Upload className="h-5 w-5 text-[#EB5A0D]" />
                <span className="font-medium text-[#EB5A0D]">
                  {file ? file.name : 'Chọn File'}
                </span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Định dạng: PDF, DOC, DOCX, TXT
              </p>
            </div>
          </div>

          {}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu Đề <span className="text-red-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề tài liệu..."
            />
          </div>

          {}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Đối tượng <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  setAudiences(
                    audiences.length === AUDIENCE_OPTIONS.length
                      ? []
                      : [...AUDIENCE_OPTIONS]
                  )
                }
                className="text-xs text-[#EB5A0D] hover:underline"
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
                      <span
                        key={a}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${AUDIENCE_COLORS[a]}`}
                      >
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
                        <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${selected ? 'bg-[#EB5A0D] border-[#EB5A0D]' : 'border-gray-300'}`}>
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

          {}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <Select
              value={intentId?.toString() || ''}
              onValueChange={(value) => setIntentId(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục" />
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

        {}
        <div className="flex items-center justify-end gap-2 p-6 border-t bg-gray-50">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[#EB5A0D] hover:bg-[#d14f0a]"
            disabled={loading}
          >
            {loading ? 'Đang tải lên...' : 'Tải Lên'}
          </Button>
        </div>
      </div>
    </div>
  );
}
