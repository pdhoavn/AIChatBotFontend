import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { Intent } from './types';
import { Input } from '../../ui/system_users/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/system_users/select';
import { Button } from '../../ui/system_users/button';

interface UploadDocumentModalProps {
  intents: Intent[];
  onClose: () => void;
  onSubmit: (formData: FormData, intentId: number) => Promise<void>;
}

export function UploadDocumentModal({ intents, onClose, onSubmit }: UploadDocumentModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [intentId, setIntentId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

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

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);

      await onSubmit(formData, intentId);
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
              <SelectContent>
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
