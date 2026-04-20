import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { templateAPI } from '../../services/fastapi';
import { Pagination } from '../common/Pagination';

const QATemplateManagerNew = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const ITEMS_PER_PAGE = 10;

  const [formData, setFormData] = useState({
    template_name: '',
    description: '',
    qa_pairs: [
      {
        question: '',
        answer: '',
        order_position: 1
      }
    ]
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await templateAPI.getTemplates();
      setTemplates(data);
    } catch (error) {

      if (error.message && error.message.includes('permission')) {
        toast.error('Bạn không có quyền xem mẫu câu hỏi trả lời. Vui lòng liên hệ quản trị viên để được cấp quyền Admin hoặc Consultant.');
      } else {
        toast.error('Không thể tải danh sách mẫu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {

    if (!formData.template_name.trim()) {
      toast.error('Vui lòng nhập tên mẫu');
      return;
    }

    if (!formData.qa_pairs || formData.qa_pairs.length === 0) {
      toast.error('Vui lòng thêm ít nhất một cặp câu hỏi-trả lời');
      return;
    }

    for (let i = 0; i < formData.qa_pairs.length; i++) {
      const qa = formData.qa_pairs[i];
      if (!qa.question.trim()) {
        toast.error(`Vui lòng nhập câu hỏi cho cặp Q&A #${i + 1}`);
        return;
      }
      if (!qa.answer.trim()) {
        toast.error(`Vui lòng nhập câu trả lời cho cặp Q&A #${i + 1}`);
        return;
      }
    }

    setLoading(true);
    try {
      if (editingTemplate) {
        await templateAPI.updateTemplate(editingTemplate.template_id, formData);
        toast.success('Cập nhật mẫu thành công!');
      } else {
        await templateAPI.createTemplate(formData);
        toast.success('Tạo mẫu mới thành công!');
      }

      await fetchTemplates();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(editingTemplate ? 'Không thể cập nhật mẫu' : 'Không thể tạo mẫu mới');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mẫu này không?')) return;

    try {
      await templateAPI.deleteTemplates([templateId]);
      toast.success('Xóa mẫu thành công!');
      await fetchTemplates();
    } catch (error) {
      toast.error('Không thể xóa mẫu');
    }
  };

  const resetForm = () => {
    setFormData({
      template_name: '',
      description: '',
      qa_pairs: [{ question: '', answer: '', order_position: 1 }]
    });
    setEditingTemplate(null);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      template_name: template.template_name,
      description: template.description || '',
      qa_pairs: template.qa_pairs.map((qa, index) => ({
        question: qa.question,
        answer: qa.answer,
        order_position: qa.order_position || index + 1
      }))
    });
    setIsDialogOpen(true);
  };

  const addQAPair = () => {
    const newOrder = formData.qa_pairs.length + 1;
    setFormData({
      ...formData,
      qa_pairs: [
        ...formData.qa_pairs,
        { question: '', answer: '', order_position: newOrder }
      ]
    });
  };

  const updateQAPair = (index, property, value) => {
    const newQAPairs = [...formData.qa_pairs];
    newQAPairs[index][property] = value;
    
    if (property === 'order_position') {
      newQAPairs.sort((a, b) => a.order_position - b.order_position);
    }
    
    setFormData({ ...formData, qa_pairs: newQAPairs });
  };

  const removeQAPair = (index) => {
    if (formData.qa_pairs.length <= 1) {
      toast.error('Mẫu phải có ít nhất một cặp câu hỏi-trả lời');
      return;
    }
    
    const newQAPairs = formData.qa_pairs.filter((_, i) => i !== index);
    newQAPairs.forEach((pair, idx) => {
      pair.order_position = idx + 1;
    });
    
    setFormData({ ...formData, qa_pairs: newQAPairs });
  };

  const filteredTemplates = templates.filter(template =>
    template.template_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTemplates.length / ITEMS_PER_PAGE);
  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="p-6">
      {}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản Lý Mẫu Câu Hỏi Trả Lời</h2>
        <button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="bg-[#EB5A0D] text-white px-4 py-2 rounded-lg hover:bg-[#d14f0a]"
        >
          Tạo Mẫu Mới
        </button>
      </div>

      {}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm mẫu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {}
      {loading ? (
        <div className="text-center py-8">Đang tải mẫu...</div>
      ) : (
        <>
          <div className="grid gap-4">
            {paginatedTemplates.map((template) => (
            <div key={template.template_id} className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{template.template_name}</h3>
                  {template.description && (
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  )}
                  <p className="text-gray-500 text-sm mt-2">
                    {template.qa_pairs?.length || 0} cặp Q&A
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(template)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => handleDelete(template.template_id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Xóa
                  </button>
                </div>
              </div>
              
              {}
              {template.qa_pairs && template.qa_pairs.length > 0 && (
                <div className="mt-3 space-y-2">
                  {template.qa_pairs.slice(0, 2).map((qa, idx) => (
                    <div key={idx} className="bg-gray-50 p-2 rounded text-sm border-l-2 border-blue-400">
                      <p className="font-medium text-gray-700">Q: {qa.question.substring(0, 100)}{qa.question.length > 100 ? '...' : ''}</p>
                      <p className="text-gray-600 mt-1">A: {qa.answer.substring(0, 100)}{qa.answer.length > 100 ? '...' : ''}</p>
                    </div>
                  ))}
                  {template.qa_pairs.length > 2 && (
                    <p className="text-xs text-gray-500 italic">...và {template.qa_pairs.length - 2} mục khác</p>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {paginatedTemplates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Không tìm thấy mẫu nào
            </div>
          )}
          </div>

          {}
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{editingTemplate ? 'Chỉnh sửa Mẫu' : 'Tạo Mẫu'}</h3>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên Mẫu *
              </label>
              <input
                type="text"
                value={formData.template_name}
                onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="vd: Yêu cầu tuyển sinh"
              />
            </div>

            {}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô Tả (Không bắt buộc)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Mô tả ngắn gọn về mẫu này"
                rows="2"
              />
            </div>

            {}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Cặp Q&A
                </label>
                <button
                  onClick={addQAPair}
                  className="bg-[#EB5A0D] text-white px-3 py-1 rounded text-sm hover:bg-[#d14f0a]"
                >
                  + Thêm Q&A
                </button>
              </div>

              {formData.qa_pairs.map((qa, index) => (
                <div key={index} className="border-2 border-gray-200 p-4 rounded-lg mb-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Q&A #{index + 1}</span>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600">Thứ tự:</label>
                      <input
                        type="number"
                        value={qa.order_position}
                        onChange={(e) => updateQAPair(index, 'order_position', parseInt(e.target.value))}
                        className="w-16 p-1 border rounded text-sm"
                        min="1"
                      />
                      <button
                        onClick={() => removeQAPair(index)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                        title="Xóa cặp Q&A"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  {}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Câu Hỏi *
                    </label>
                    <textarea
                      value={qa.question}
                      onChange={(e) => updateQAPair(index, 'question', e.target.value)}
                      className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập câu hỏi..."
                      rows="2"
                    />
                  </div>

                  {}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Câu Trả Lời *
                    </label>
                    <textarea
                      value={qa.answer}
                      onChange={(e) => updateQAPair(index, 'answer', e.target.value)}
                      className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập câu trả lời..."
                      rows="3"
                    />
                  </div>
                </div>
              ))}
            </div>

            {}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateOrUpdate}
                disabled={loading}
                className="bg-[#EB5A0D] text-white px-4 py-2 rounded hover:bg-[#d14f0a] disabled:opacity-50"
              >
                {loading ? 'Đang lưu...' : (editingTemplate ? 'Cập nhật' : 'Tạo')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QATemplateManagerNew;

