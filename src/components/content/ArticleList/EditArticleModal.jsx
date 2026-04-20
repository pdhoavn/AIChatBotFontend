import { X, Upload } from "lucide-react";
import { useState, useEffect } from "react";

export default function EditArticleModal({ 
  article, 
  majors, 
  onClose, 
  onSave 
}) {
  const [formData, setFormData] = useState({
    title: article.title,
    description: article.description,
    url: article.url || '',
    note: article.note || '',
    major_id: article.major_id,
    specialization_id: article.specialization_id
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(article.link_image || null);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSpecs = async () => {
      if (formData.major_id) {
        try {
          const { fastAPISpecializations } = await import('../../../services/fastapi');
          const specs = await fastAPISpecializations.getByMajor(formData.major_id);
          setSpecializations(specs);
        } catch (err) {
        }
      } else {
        setSpecializations([]);
      }
    };
    fetchSpecs();
  }, [formData.major_id]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {

      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh hợp lệ');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(article.link_image || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {

      if (imageFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('url', formData.url);
        formDataToSend.append('note', formData.note);
        formDataToSend.append('major_id', String(formData.major_id));
        formDataToSend.append('specialization_id', String(formData.specialization_id));
        formDataToSend.append('image', imageFile);
        
        await onSave(formDataToSend);
      } else {

        await onSave(formData);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Chỉnh Sửa Bài Viết</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-4">
            {}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu Đề *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô Tả *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ảnh Bài Viết
              </label>
              
              {imagePreview ? (
                <div className="space-y-2">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {imageFile && (
                    <div className="text-xs text-gray-600 truncate">
                      Ảnh mới: {imageFile.name}
                    </div>
                  )}
                  {!imageFile && article.link_image && (
                    <div className="text-xs text-gray-500">
                      Ảnh hiện tại
                    </div>
                  )}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="text-xs text-gray-500 mb-1">
                      <span className="font-semibold">Nhấp để tải lên</span> ảnh mới
                    </p>
                    <p className="text-xs text-gray-400">PNG, JPG, GIF (MAX. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi Chú
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngành
              </label>
              <select
                value={formData.major_id || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  major_id: e.target.value ? parseInt(e.target.value) : 0,
                  specialization_id: 0
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn ngành</option>
                {majors.map((major) => (
                  <option key={major.major_id} value={major.major_id}>
                    {major.major_name}
                  </option>
                ))}
              </select>
            </div>

            {}
            {formData.major_id && specializations.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chuyên Ngành
                </label>
                <select
                  value={formData.specialization_id || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    specialization_id: e.target.value ? parseInt(e.target.value) : 0
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn chuyên ngành</option>
                  {specializations.map((spec) => (
                    <option key={spec.specialization_id} value={spec.specialization_id}>
                      {spec.specialization_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {}
          <div className="flex gap-3 pt-6 border-t mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#EB5A0D] text-white rounded-lg hover:bg-[#d14f0a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );
}
