import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Calendar, Brain, TrendingUp, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { riasecAPI, academicScoresAPI } from '../../services/fastapi';
import { API_CONFIG } from '../../config/api.js';

export function StudentDetailModal({ isOpen, onClose, userId }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [riasecResults, setRiasecResults] = useState([]);
  const [riasecLoading, setRiasecLoading] = useState(false);
  const [academicScores, setAcademicScores] = useState(null);
  const [scoresLoading, setScoresLoading] = useState(false);
  const [expandedResults, setExpandedResults] = useState({});

  const fetchStudentDetail = async (id) => {
    if (!id) return;
    
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No authentication token found');

      const idString = String(id);
      let numericId;
      if (idString.startsWith('ST')) {
        numericId = idString.replace('ST', '').replace(/^0+/, '') || '1';
      } else {
        numericId = idString;
      }
      
      const baseUrl = API_CONFIG.FASTAPI_BASE_URL;
      const url = `${baseUrl}/users/${numericId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setStudent(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRiasecResults = async (id) => {
    if (!id) return;
    
    setRiasecLoading(true);

    try {
      const idString = String(id);
      let numericId;
      if (idString.startsWith('ST')) {
        numericId = parseInt(idString.replace('ST', '').replace(/^0+/, '') || '1');
      } else {
        numericId = parseInt(idString);
      }
      
      const response = await riasecAPI.getUserResults(numericId);
      setRiasecResults(response || []);

    } catch (err) {
      if (err.response?.status !== 404) {
      }
    } finally {
      setRiasecLoading(false);
    }
  };

  const fetchAcademicScores = async (id) => {
    if (!id) return;
    
    setScoresLoading(true);

    try {
      const idString = String(id);
      let numericId;
      if (idString.startsWith('ST')) {
        numericId = parseInt(idString.replace('ST', '').replace(/^0+/, '') || '1');
      } else {
        numericId = parseInt(idString);
      }
      
      const response = await academicScoresAPI.getUserAcademicScores(numericId);
      setAcademicScores(response || null);

    } catch (err) {
      if (err.response?.status !== 404) {
      }
      setAcademicScores(null);
    } finally {
      setScoresLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchStudentDetail(userId);
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (student && isOpen) {
      fetchRiasecResults(userId);
      fetchAcademicScores(userId);
    }
  }, [student, isOpen, userId]);

  const toggleExpand = (resultId) => {
    setExpandedResults(prev => ({
      ...prev,
      [resultId]: !prev[resultId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {}
      <div className="relative w-full h-full max-w-6xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        {}
        <div className="flex-shrink-0 bg-[#EB5A0D] text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Hồ Sơ Khách Hàng</h1>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full p-12">
              <div className="relative">
                <div className="w-16 h-16 border-6 border-orange-200 border-t-[#EB5A0D] rounded-full animate-spin"></div>
                <User className="absolute inset-0 m-auto h-8 w-8 text-[#EB5A0D]" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-800">Đang tải thông tin...</h3>
              <p className="mt-1 text-sm text-gray-500">Vui lòng đợi trong giây lát</p>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full p-12">
              <div className="max-w-md w-full bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-red-900 mb-2">Không thể tải thông tin</h3>
                <p className="text-sm text-red-700 mb-3">{error}</p>
                <button
                  onClick={() => fetchStudentDetail(userId)}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}

          {student && !loading && !error && (
            <div className="p-6 space-y-4">
              {}
              <div className="bg-white rounded-xl border-2 border-orange-100 shadow-lg p-5">
                <div className="flex items-start gap-6">
                  {}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1.5">
                          {student.full_name || 'Chưa cập nhật'}
                        </h2>
                        <div className="flex items-center gap-2">
                          {student.status ? (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                              Đang hoạt động
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                              Không hoạt động
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      <div className="flex items-center gap-2.5 p-3 bg-white rounded-lg border border-orange-100">
                        <div className="p-1.5 bg-orange-50 rounded-lg">
                          <Mail className="h-4 w-4 text-[#EB5A0D]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Email</p>
                          <a 
                            href={`mailto:${student.email}`}
                            className="text-xs font-medium text-[#EB5A0D] hover:text-orange-700 truncate block"
                          >
                            {student.email || 'Chưa cập nhật'}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 p-3 bg-white rounded-lg border border-orange-100">
                        <div className="p-1.5 bg-orange-50 rounded-lg">
                          <Phone className="h-4 w-4 text-[#EB5A0D]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Số điện thoại</p>
                          <a 
                            href={`tel:${student.phone_number}`}
                            className="text-xs font-medium text-[#EB5A0D] hover:text-orange-700 truncate block"
                          >
                            {student.phone_number || 'Chưa cập nhật'}
                          </a>
                        </div>
                      </div>

                      {student.created_at && (
                        <div className="flex items-center gap-2.5 p-3 bg-white rounded-lg border border-orange-100">
                          <div className="p-1.5 bg-orange-50 rounded-lg">
                            <Calendar className="h-4 w-4 text-[#EB5A0D]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Ngày đăng ký</p>
                            <p className="text-xs font-medium text-gray-900">
                              {new Date(student.created_at).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {}
              <div className="bg-white rounded-xl border-2 border-orange-100 shadow-lg overflow-hidden">
                <div className="bg-[#EB5A0D] px-5 py-3.5 text-white">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Brain className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Kết Quả Trắc Nghiệm RIASEC</h3>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  {riasecLoading && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="relative">
                        <div className="w-12 h-12 border-6 border-orange-200 border-t-[#EB5A0D] rounded-full animate-spin"></div>
                        <Brain className="absolute inset-0 m-auto h-6 w-6 text-[#EB5A0D]" />
                      </div>
                      <p className="mt-3 text-sm text-gray-600 font-medium">Đang tải kết quả RIASEC...</p>
                    </div>
                  )}

                  {!riasecLoading && riasecResults.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Brain className="h-8 w-8 text-orange-400" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1.5">Chưa có kết quả</h4>
                      <p className="text-sm text-gray-600">Học sinh chưa thực hiện bài trắc nghiệm RIASEC</p>
                    </div>
                  )}

                  {!riasecLoading && riasecResults.length > 0 && (
                    <div className="space-y-5">
                      {[...riasecResults].reverse().map((result, index) => {
                        const uniqueKey = `riasec-${index}`;
                        const isExpanded = expandedResults[uniqueKey] || false;
                        
                        return (
                          <div key={uniqueKey} className="border-2 border-orange-100 rounded-lg overflow-hidden">
                            {}
                            <button
                              onClick={() => toggleExpand(uniqueKey)}
                              className="w-full bg-orange-50 px-4 py-2.5 border-b-2 border-orange-100 hover:bg-orange-100 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex flex-col items-start gap-1">
                                  <h4 className="text-sm font-bold text-gray-900">
                                    Kết quả lần {index + 1}
                                  </h4>
                                  {result.result && (
                                    <span className="text-sm text-gray-700">
                                      {result.result}
                                    </span>
                                  )}
                                </div>
                                {isExpanded ? (
                                  <ChevronUp className="h-5 w-5 text-gray-600" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-gray-600" />
                                )}
                              </div>
                            </button>

                            {}
                            {isExpanded && (
                              <div className="p-4">
                                {}
                                <div className="space-y-4">
                                  <div className="flex items-center gap-1.5 mb-3">
                                    <TrendingUp className="h-4 w-4 text-[#EB5A0D]" />
                                    <h5 className="text-sm font-bold text-gray-900">Biểu Đồ Điểm Số Chi Tiết</h5>
                                  </div>

                                  {[
                                    { 
                                      key: 'score_realistic', 
                                      label: 'Thực Tế (Realistic)', 
                                      color: 'from-green-500 to-emerald-600',
                                      bg: 'bg-green-50',
                                      border: 'border-green-200'
                                    },
                                    { 
                                      key: 'score_investigative', 
                                      label: 'Nghiên Cứu (Investigative)', 
                                      color: 'from-blue-500 to-cyan-600',
                                      bg: 'bg-blue-50',
                                      border: 'border-blue-200'
                                    },
                                    { 
                                      key: 'score_artistic', 
                                      label: 'Nghệ Thuật (Artistic)', 
                                      color: 'from-purple-500 to-violet-600',
                                      bg: 'bg-purple-50',
                                      border: 'border-purple-200'
                                    },
                                    { 
                                      key: 'score_social', 
                                      label: 'Xã Hội (Social)', 
                                      color: 'from-orange-500 to-amber-600',
                                      bg: 'bg-orange-50',
                                      border: 'border-orange-200'
                                    },
                                    { 
                                      key: 'score_enterprising', 
                                      label: 'Kinh Doanh (Enterprising)', 
                                      color: 'from-red-500 to-rose-600',
                                      bg: 'bg-red-50',
                                      border: 'border-red-200'
                                    },
                                    { 
                                      key: 'score_conventional', 
                                      label: 'Quy Ước (Conventional)', 
                                      color: 'from-gray-500 to-slate-600',
                                      bg: 'bg-gray-50',
                                      border: 'border-gray-200'
                                    }
                                  ].map(({ key, label, color, bg, border }) => {
                                    const score = result[key] || 0;
                                    const percentage = (score / 5.0) * 100;
                                    
                                    return (
                                      <div key={key} className={`${bg} border ${border} rounded-lg p-3`}>
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-xs text-gray-900">{label}</span>
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-lg font-extrabold text-gray-900">
                                              {score.toFixed(1)}
                                            </span>
                                            <span className="text-xs text-gray-500 font-medium">/5.0</span>
                                          </div>
                                        </div>
                                        <div className="relative h-6 bg-white rounded-md overflow-hidden border-2 border-gray-200">
                                          <div 
                                            className={`h-full bg-gradient-to-r ${color} transition-all duration-700 ease-out relative`}
                                            style={{ width: `${percentage}%` }}
                                          >
                                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                          </div>
                                          <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xs font-bold text-gray-700 drop-shadow-sm">
                                              {percentage.toFixed(0)}%
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {}
              <div className="bg-white rounded-xl border-2 border-orange-100 shadow-lg overflow-hidden">
                <div className="bg-[#EB5A0D] px-5 py-3.5 text-white">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Kết Quả Học Tập</h3>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  {scoresLoading && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="relative">
                        <div className="w-12 h-12 border-6 border-orange-200 border-t-[#EB5A0D] rounded-full animate-spin"></div>
                        <BookOpen className="absolute inset-0 m-auto h-6 w-6 text-[#EB5A0D]" />
                      </div>
                      <p className="mt-3 text-sm text-gray-600 font-medium">Đang tải kết quả học tập...</p>
                    </div>
                  )}

                  {!scoresLoading && !academicScores && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <BookOpen className="h-8 w-8 text-orange-400" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1.5">Chưa có dữ liệu</h4>
                      <p className="text-sm text-gray-600">Học sinh chưa cập nhật kết quả học tập</p>
                    </div>
                  )}

                  {!scoresLoading && academicScores && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { key: 'math', label: 'Toán', bg: 'bg-blue-50', border: 'border-blue-200' },
                        { key: 'literature', label: 'Ngữ Văn', bg: 'bg-purple-50', border: 'border-purple-200' },
                        { key: 'english', label: 'Tiếng Anh', bg: 'bg-green-50', border: 'border-green-200' },
                        { key: 'physics', label: 'Vật Lý', bg: 'bg-indigo-50', border: 'border-indigo-200' },
                        { key: 'chemistry', label: 'Hóa Học', bg: 'bg-amber-50', border: 'border-amber-200' },
                        { key: 'biology', label: 'Sinh Học', bg: 'bg-lime-50', border: 'border-lime-200' },
                        { key: 'history', label: 'Lịch Sử', bg: 'bg-yellow-50', border: 'border-yellow-200' },
                        { key: 'geography', label: 'Địa Lý', bg: 'bg-teal-50', border: 'border-teal-200' },
                      ].map(({ key, label, bg, border }) => {
                        const score = academicScores[key] || 0;
                        
                        return (
                          <div key={key} className={`${bg} border ${border} rounded-lg p-3`}>
                            <div className="text-center">
                              <p className="text-xs font-semibold text-gray-600 mb-1">{label}</p>
                              <div className="flex items-baseline justify-center gap-1">
                                <span className="text-2xl font-extrabold text-gray-900">
                                  {score.toFixed(1)}
                                </span>
                                <span className="text-xs text-gray-500 font-medium">/10</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
