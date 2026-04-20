import { useState, useEffect } from "react";
import { fastAPIArticles, fastAPIMajors, fastAPISpecializations } from '../../services/fastapi';
import { Upload, X } from 'lucide-react';

export default function ArticleEditor({ initialData }) {
  
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [majorId, setMajorId] = useState(0);
  const [specializationId, setSpecializationId] = useState(0);
  
  const [majors, setMajors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [filteredSpecializations, setFilteredSpecializations] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingSpecializations, setLoadingSpecializations] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [createdArticle, setCreatedArticle] = useState(null);

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        setLoading(true);

        const majorsData = await fastAPIMajors.getAll();
        
        setMajors(majorsData);
        
      } catch (error) {
        setMessage({ type: 'error', text: 'Không thể tải dữ liệu ngành. Vui lòng thử lại sau.' });
        setMajors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMajors();
  }, []);

  useEffect(() => {
    const fetchSpecializations = async () => {
      if (!majorId) {
        setFilteredSpecializations([]);
        return;
      }

      try {
        setLoadingSpecializations(true);

        const specializationsData = await fastAPISpecializations.getByMajor(majorId);
        
        setFilteredSpecializations(specializationsData);

        if (specializationId && !specializationsData.some(spec => spec.specialization_id === specializationId)) {
          setSpecializationId(0);
        }
        
      } catch (error) {
        setMessage({ type: 'error', text: `Không thể tải chuyên ngành cho ngành đã chọn. Vui lòng thử lại sau.` });
        setFilteredSpecializations([]);
      } finally {
        setLoadingSpecializations(false);
      }
    };

    fetchSpecializations();
  }, [majorId, specializationId]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {

      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Vui lòng chọn file ảnh hợp lệ' });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Kích thước ảnh không được vượt quá 5MB' });
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
    setImagePreview(null);
  };

  const handleAddArticle = async () => {
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Tiêu đề là bắt buộc' });
      return;
    }
    if (!description.trim()) {
      setMessage({ type: 'error', text: 'Mô tả là bắt buộc' });
      return;
    }
    if (!url.trim()) {
      setMessage({ type: 'error', text: 'URL là bắt buộc' });
      return;
    }
    if (!imageFile) {
      setMessage({ type: 'error', text: 'Vui lòng chọn ảnh cho bài viết' });
      return;
    }
    if (!majorId) {
      setMessage({ type: 'error', text: 'Vui lòng chọn ngành' });
      return;
    }
    if (!specializationId) {
      setMessage({ type: 'error', text: 'Vui lòng chọn chuyên ngành' });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);
      setCreatedArticle(null);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('url', url.trim());

      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      if (majorId !== 0) {
        formData.append('major_id', String(majorId));
      }
      if (specializationId !== 0) {
        formData.append('specialization_id', String(specializationId));
      }

      const response = await fastAPIArticles.create(formData);
      
      setMessage({ type: 'success', text: `Bài viết "${response.title}" đã được thêm thành công!` });
      setCreatedArticle(response);

      setTitle('');
      setDescription('');
      setUrl('');
      setImageFile(null);
      setImagePreview(null);
      setMajorId(0);
      setSpecializationId(0);
      
    } catch (error) {
      const errorMessage = error.message || 'Không thể thêm bài viết';
      setMessage({ type: 'error', text: errorMessage });
      setCreatedArticle(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      {}
      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-300' 
            : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {}
      {createdArticle && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-lg font-semibold text-green-800">Thành Công!</h3>
          <p className="text-sm text-green-700 mt-1">Bài viết đã được thêm thành công.</p>
        </div>
      )}

      {}
      <div className="bg-white border rounded-xl p-3 mb-4 flex items-center gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tiêu Đề Bài Viết"
          className="flex-1 text-lg font-semibold outline-none"
        />
        <button 
          onClick={handleAddArticle}
          disabled={saving || loading}
          className="px-4 py-2 rounded-md bg-[#EB5A0D] text-white text-sm hover:bg-[#d14f0a] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Đang Thêm...' : 'Thêm Bài Viết'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {}
        <div className="bg-white border rounded-xl p-4 min-h-[60vh]">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Bắt đầu viết mô tả bài viết tại đây..."
            className="w-full min-h-[50vh] outline-none resize-none"
          />
        </div>

        {}
        <div className="bg-white border rounded-xl p-4 space-y-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">URL</div>
            <input 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full border rounded-md px-2 py-2 text-sm" 
              placeholder="https://example.com/article-url" 
            />
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">
              Ảnh Bài Viết <span className="text-red-500">*</span>
            </div>
            
            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-xs text-gray-500 mb-1">
                    <span className="font-semibold">Nhấp để tải lên</span> hoặc kéo thả
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
            ) : (
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
                <div className="mt-2 text-xs text-gray-600 truncate">
                  {imageFile?.name}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Ngành</div>
            <select 
              value={majorId} 
              onChange={(e) => {
                setMajorId(Number(e.target.value));
              }}
              className="w-full border rounded-md px-2 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={loading}
            >
              <option value={0}>Chọn ngành</option>
              {majors.map((major) => (
                <option key={major.major_id} value={major.major_id}>
                  {major.major_name}
                </option>
              ))}
            </select>
            {loading && (
              <div className="text-xs text-blue-500 mt-1">Đang tải ngành từ API...</div>
            )}
            {majors.length === 0 && !loading && (
              <div className="text-xs text-red-500 mt-1">Không có ngành khả dụng</div>
            )}
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Chuyên Ngành</div>
            <select 
              value={specializationId} 
              onChange={(e) => {
                setSpecializationId(Number(e.target.value));
              }}
              className="w-full border rounded-md px-2 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={loading || !majorId || loadingSpecializations}
            >
              <option value={0}>
                {loadingSpecializations ? 'Đang tải chuyên ngành...' : !majorId ? 'Chọn ngành trước' : 'Chọn chuyên ngành'}
              </option>
              {filteredSpecializations.map((spec) => (
                <option key={spec.specialization_id} value={spec.specialization_id}>
                  {spec.specialization_name}
                </option>
              ))}
            </select>
            {loadingSpecializations && (
              <div className="text-xs text-blue-500 mt-1">Đang tải chuyên ngành từ API...</div>
            )}
            {!majorId && (
              <div className="text-xs text-gray-400 mt-1">Vui lòng chọn ngành trước</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
