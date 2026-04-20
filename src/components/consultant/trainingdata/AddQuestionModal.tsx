import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Intent } from './types';
import { Textarea } from '../../ui/system_users/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/system_users/select';
import { Button } from '../../ui/system_users/button';
import { templateAPI } from '../../../services/fastapi';
import { Template, TemplateQA } from '../../../types/template.types';
import { toast } from 'react-toastify';

interface AddQuestionModalProps {
  intents: Intent[];
  onClose: () => void;
  onSubmit: (data: { question: string; answer: string; intent_id: number }) => Promise<void>;
}

export function AddQuestionModal({ intents, onClose, onSubmit }: AddQuestionModalProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [intentId, setIntentId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedQAPairIndex, setSelectedQAPairIndex] = useState<string>('');
  const [templatesLoading, setTemplatesLoading] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setTemplatesLoading(true);
        const data = await templateAPI.getTemplates();
        setTemplates(data);
      } catch (error) {
        toast.error('Không thể tải danh sách mẫu');
      } finally {
        setTemplatesLoading(false);
      }
    };
    
    fetchTemplates();
  }, []);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setSelectedQAPairIndex('');

    if (templateId === 'none') {
      setQuestion('');
      setAnswer('');
    }
  };

  const handleQAPairChange = (index: string) => {
    setSelectedQAPairIndex(index);
    
    if (selectedTemplateId && index) {
      const template = templates.find(t => t.template_id?.toString() === selectedTemplateId);
      if (template && template.qa_pairs[parseInt(index)]) {
        const qaPair = template.qa_pairs[parseInt(index)];
        setQuestion(qaPair.question);
        setAnswer(qaPair.answer);
      }
    }
  };

  const getCurrentTemplateQAPairs = (): TemplateQA[] => {
    if (!selectedTemplateId || selectedTemplateId === 'none') return [];
    const template = templates.find(t => t.template_id?.toString() === selectedTemplateId);
    return template?.qa_pairs || [];
  };

  const handleSubmit = async () => {
    if (!question.trim()) {
      alert('Vui lòng nhập câu hỏi');
      return;
    }
    if (!answer.trim()) {
      alert('Vui lòng nhập câu trả lời');
      return;
    }
    if (!intentId) {
      alert('Vui lòng chọn danh mục');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({ question, answer, intent_id: intentId });
      onClose();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Thêm Câu Hỏi Huấn Luyện Mới</h2>
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">
              Sử dụng Mẫu (Không bắt buộc)
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Chọn Mẫu
                </label>
                <Select
                  value={selectedTemplateId}
                  onValueChange={handleTemplateChange}
                  disabled={templatesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={templatesLoading ? "Đang tải..." : "Chọn mẫu câu hỏi..."} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Không sử dụng mẫu --</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.template_id} value={template.template_id?.toString() || ''}>
                        {template.template_name} ({template.qa_pairs?.length || 0} Q&A)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplateId && selectedTemplateId !== 'none' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Chọn Cặp Q&A
                  </label>
                  <Select
                    value={selectedQAPairIndex}
                    onValueChange={handleQAPairChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn cặp câu hỏi-trả lời..." />
                    </SelectTrigger>
                    <SelectContent>
                      {getCurrentTemplateQAPairs().map((qaPair, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          Q{index + 1}: {qaPair.question.substring(0, 50)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <SelectContent>
                {intents.map((intent) => (
                  <SelectItem key={intent.intent_id} value={intent.intent_id.toString()}>
                    {intent.intent_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Câu Hỏi <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[120px]"
              placeholder="Nhập câu hỏi huấn luyện..."
            />
          </div>

          {}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Câu Trả Lời <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="min-h-[200px]"
              placeholder="Nhập câu trả lời..."
            />
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
            {loading ? 'Đang tạo...' : 'Tạo Câu Hỏi'}
          </Button>
        </div>
      </div>
    </div>
  );
}

AddQuestionModal.displayName = 'AddQuestionModal';
