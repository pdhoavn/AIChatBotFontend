import { useState, useEffect } from 'react';
import { ScrollArea } from '../../ui/system_users/scroll-area';
import { Button } from '../../ui/system_users/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/system_users/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/system_users/dialog';
import { Textarea } from '../../ui/system_users/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/system_users/select';
import { MessageCircle, FileText, Check, X, Loader2, Users, Search, Download } from 'lucide-react';

const AUDIENCE_FILTER_OPTIONS = [
  { value: 'CANBO',     label: 'Viên chức/NLĐ', inactive: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',   active: 'bg-blue-600 text-white border-blue-600 shadow-sm',   dot: 'bg-blue-500' },
  { value: 'SINHVIEN',  label: 'Sinh viên',      inactive: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100', active: 'bg-green-600 text-white border-green-600 shadow-sm', dot: 'bg-green-500' },
  { value: 'PHUHUYNH',  label: 'Phụ huynh',      inactive: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100', active: 'bg-purple-600 text-white border-purple-600 shadow-sm', dot: 'bg-purple-500' },
  { value: 'TUYENSINH', label: 'Tuyển sinh',     inactive: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100', active: 'bg-yellow-600 text-white border-yellow-600 shadow-sm', dot: 'bg-yellow-500' },
];
import { knowledgeAPI, intentAPI } from '../../../services/fastapi';
import { toast } from 'react-toastify';
import { Pagination } from '../../common/Pagination';

const AUDIENCE_DISPLAY = {
  CANBO:     { label: 'Viên chức/NLĐ', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  SINHVIEN:  { label: 'Sinh viên',      color: 'bg-green-100 text-green-700 border-green-200' },
  PHUHUYNH:  { label: 'Phụ huynh',     color: 'bg-purple-100 text-purple-700 border-purple-200' },
  TUYENSINH: { label: 'Tuyển sinh',    color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
};

function AudienceBadges({ audiences }) {
  if (!audiences || audiences.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {audiences.map(val => {
        const info = AUDIENCE_DISPLAY[val];
        return info ? (
          <span key={val} className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${info.color}`}>
            {info.label}
          </span>
        ) : (
          <span key={val} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border bg-gray-100 text-gray-700 border-gray-200">
            {val}
          </span>
        );
      })}
    </div>
  );
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' });
};

function TrainingQuestionCard({ question, approvingId, rejectingId, onApprove, onReject }) {
  const isApproving = approvingId === question.question_id;
  const isRejecting = rejectingId === question.question_id;
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <MessageCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">Training Question {question.question_id}</h3>
            <p className="text-sm text-muted-foreground">Tạo: {formatDate(question.created_at)}</p>
          </div>
        </div>
        <span className="px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-800 flex-shrink-0">Nháp</span>
      </div>
      <div className="flex flex-col gap-1.5 mb-3">
        <AudienceBadges audiences={question.target_audiences} />
        {question.intent_name && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full self-start">
            Lĩnh vực: {question.intent_name}
          </span>
        )}
      </div>
      <div className="mb-4 space-y-3">
        <div>
          <div className="text-sm font-medium text-gray-700 mb-1">Câu hỏi:</div>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{question.question}</p>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-700 mb-1">Câu trả lời:</div>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded whitespace-pre-wrap">{question.answer}</p>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" className="gap-2" onClick={() => onReject(question.question_id, 'qa')} disabled={isApproving || isRejecting}>
          {isRejecting ? <><Loader2 className="h-4 w-4 animate-spin" />Đang xử lý...</> : <><X className="h-4 w-4" />Từ Chối</>}
        </Button>
        <Button size="sm" className="gap-2 bg-[#facb01] hover:bg-[#d14f0a]" onClick={() => onApprove(question.question_id, 'qa')} disabled={isApproving || isRejecting}>
          {isApproving ? <><Loader2 className="h-4 w-4 animate-spin" />Đang duyệt...</> : <><Check className="h-4 w-4" />Phê Duyệt</>}
        </Button>
      </div>
    </div>
  );
}

function DocumentCard({ document, approvingId, rejectingId, downloadingId, onApprove, onReject, onDownload }) {
  const isApproving = approvingId === document.document_id;
  const isRejecting = rejectingId === document.document_id;
  const isDownloading = downloadingId === document.document_id;
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{document.title}</h3>
            <p className="text-sm text-muted-foreground">Tạo: {formatDate(document.created_at)}</p>
          </div>
        </div>
        <span className="px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-800 flex-shrink-0">Nháp</span>
      </div>
      <div className="flex flex-col gap-1.5 mb-3">
        <AudienceBadges audiences={document.target_audiences} />
        {document.intent_name && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full self-start">
            Lĩnh vực: {document.intent_name}
          </span>
        )}
      </div>
      <div className="mb-4 space-y-2">
        <div>
          <div className="text-sm font-medium text-gray-700">File:</div>
          <p className="text-sm text-gray-600">{document.file_path?.split('/').pop() || 'N/A'}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" className="gap-2 text-blue-600 hover:bg-blue-50" onClick={() => onDownload(document)} disabled={isDownloading || isApproving || isRejecting}>
          {isDownloading ? <><Loader2 className="h-4 w-4 animate-spin" />Đang tải...</> : <><Download className="h-4 w-4" />Tải Xuống</>}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => onReject(document.document_id, 'document')} disabled={isApproving || isRejecting || isDownloading}>
            {isRejecting ? <><Loader2 className="h-4 w-4 animate-spin" />Đang xử lý...</> : <><X className="h-4 w-4" />Từ Chối</>}
          </Button>
          <Button size="sm" className="gap-2 bg-[#facb01] hover:bg-[#d14f0a]" onClick={() => onApprove(document.document_id, 'document')} disabled={isApproving || isRejecting || isDownloading}>
            {isApproving ? <><Loader2 className="h-4 w-4 animate-spin" />Đang duyệt...</> : <><Check className="h-4 w-4" />Phê Duyệt</>}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function LeaderKnowledgeBase() {
  const [activeTab, setActiveTab] = useState('qa');
  const [trainingQuestions, setTrainingQuestions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [intents, setIntents] = useState([]);
  const [audienceFilter, setAudienceFilter] = useState([]);
  const [questionsPage, setQuestionsPage] = useState(1);
  const [documentsPage, setDocumentsPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  useEffect(() => {
    fetchPendingItems();
    fetchIntents();
  }, []);

  const fetchIntents = async () => {
    try {
      const data = await intentAPI.getIntents();
      setIntents(data || []);
    } catch (error) {}
  };

  const fetchPendingItems = async () => {
    try {
      setLoading(true);
      const [questionsData, documentsData] = await Promise.all([
        knowledgeAPI.getTrainingQuestions('draft'),
        knowledgeAPI.getDocuments('draft')
      ]);
      setTrainingQuestions(questionsData || []);
      setDocuments(documentsData || []);
    } catch (error) {
      toast.error('Không thể tải danh sách chờ duyệt');
    } finally {
      setLoading(false);
    }
  };
  
  const handleApprove = async (id, type) => {
    try {
      setApprovingId(id);
      if (type === 'qa') {
        await knowledgeAPI.approveTrainingQuestion(id);
        toast.success('Đã duyệt câu hỏi huấn luyện!');
        setTrainingQuestions(prev => prev.filter(q => q.question_id !== id));
      } else {
        await knowledgeAPI.approveDocument(id);
        toast.success('Đã duyệt tài liệu!');
        setDocuments(prev => prev.filter(d => d.document_id !== id));
      }
    } catch (error) {
      toast.error('Không thể duyệt. Vui lòng thử lại.');
    } finally {
      setApprovingId(null);
    }
  };

  const openRejectDialog = (id, type) => {
    setSelectedItem(id);
    setSelectedItemType(type);
    setShowRejectDialog(true);
  };

  const handleDownloadDocument = async (document) => {
    try {
      setDownloadingId(document.document_id);
      const blob = await knowledgeAPI.downloadDocument(document.document_id);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      const rawExt = (document.file_path || '').split('/').pop()?.split('.').pop()?.toLowerCase() || '';
      const base = document.title || `document-${document.document_id}`;
      a.download = (rawExt && !base.toLowerCase().endsWith(`.${rawExt}`)) ? `${base}.${rawExt}` : base;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Tải tài liệu thành công!');
    } catch {
      toast.error('Không thể tải xuống tài liệu.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setRejectingId(selectedItem);
      if (selectedItemType === 'qa') {
        await knowledgeAPI.rejectTrainingQuestion(selectedItem, rejectReason);
        toast.success('Đã từ chối câu hỏi huấn luyện!');
        setTrainingQuestions(prev => prev.filter(q => q.question_id !== selectedItem));
      } else {
        await knowledgeAPI.rejectDocument(selectedItem, rejectReason);
        toast.success('Đã từ chối tài liệu!');
        setDocuments(prev => prev.filter(d => d.document_id !== selectedItem));
      }

      setShowRejectDialog(false);
      setRejectReason('');
      setSelectedItem(null);
      setSelectedItemType(null);
    } catch (error) {
      toast.error('Không thể từ chối. Vui lòng thử lại.');
    } finally {
      setRejectingId(null);
    }
  };

  const toggleAudience = (value) => {
    setAudienceFilter(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const filteredQuestions = trainingQuestions.filter(q => {
    const matchesSearch = !searchQuery ||
      q.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.intent_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || q.intent_id?.toString() === categoryFilter;
    const matchesAudience = audienceFilter.length === 0 || q.target_audiences?.some(a => audienceFilter.includes(a));
    return matchesSearch && matchesCategory && matchesAudience;
  });

  const filteredDocuments = documents.filter(d => {
    const matchesSearch = !searchQuery ||
      d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.intent_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || d.intent_id?.toString() === categoryFilter;
    const matchesAudience = audienceFilter.length === 0 || d.target_audiences?.some(a => audienceFilter.includes(a));
    return matchesSearch && matchesCategory && matchesAudience;
  });

  const totalQuestionsPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
  const paginatedQuestions = filteredQuestions.slice(
    (questionsPage - 1) * ITEMS_PER_PAGE,
    questionsPage * ITEMS_PER_PAGE
  );

  const totalDocumentsPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);
  const paginatedDocuments = filteredDocuments.slice(
    (documentsPage - 1) * ITEMS_PER_PAGE,
    documentsPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setQuestionsPage(1);
    setDocumentsPage(1);
  }, [activeTab, audienceFilter, searchQuery, categoryFilter]);

  return (
    <div className="min-h-screen h-full p-6 bg-[#F8FAFC]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Duyệt Cơ Sở Tri Thức</h1>
        <p className="text-muted-foreground">Xét duyệt câu hỏi huấn luyện và tài liệu đang chờ phê duyệt</p>
      </div>

      <div className="flex gap-3 mb-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#facb01] focus:border-transparent text-sm"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tất cả lĩnh vực" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả lĩnh vực</SelectItem>
            {intents.map((intent) => (
              <SelectItem key={intent.intent_id} value={intent.intent_id.toString()}>
                {intent.intent_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium pr-1">
          <Users className="h-4 w-4 text-gray-500" />
          <span>Đối tượng:</span>
        </div>
        {AUDIENCE_FILTER_OPTIONS.map((opt) => {
          const selected = audienceFilter.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleAudience(opt.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${selected ? opt.active : opt.inactive}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${selected ? 'bg-white' : opt.dot}`} />
              {opt.label}
            </button>
          );
        })}
        {audienceFilter.length > 0 && (
          <button
            type="button"
            onClick={() => setAudienceFilter([])}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors ml-1"
          >
            <X className="h-3 w-3" />
            Xóa lọc
          </button>
        )}
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="qa" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Câu Hỏi Huấn Luyện
            <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">
              {filteredQuestions.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Tài Liệu
            <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">
              {filteredDocuments.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="qa" className="mt-0">
          <div className="h-[calc(100vh-300px)] overflow-y-auto pr-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2">Đang tải...</span>
              </div>
            ) : trainingQuestions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Không có câu hỏi nào đang chờ duyệt</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedQuestions.map(question => (
                  <TrainingQuestionCard
                    key={question.question_id}
                    question={question}
                    approvingId={approvingId}
                    rejectingId={rejectingId}
                    onApprove={handleApprove}
                    onReject={openRejectDialog}
                  />
                ))}
                {trainingQuestions.length > 0 && (
                  <Pagination
                    currentPage={questionsPage}
                    totalPages={totalQuestionsPages}
                    onPageChange={setQuestionsPage}
                  />
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-0">
          <div className="h-[calc(100vh-300px)] overflow-y-auto pr-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2">Đang tải...</span>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Không có tài liệu nào đang chờ duyệt</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedDocuments.map(document => (
                  <DocumentCard
                    key={document.document_id}
                    document={document}
                    approvingId={approvingId}
                    rejectingId={rejectingId}
                    downloadingId={downloadingId}
                    onApprove={handleApprove}
                    onReject={openRejectDialog}
                    onDownload={handleDownloadDocument}
                  />
                ))}
                {documents.length > 0 && (
                  <Pagination
                    currentPage={documentsPage}
                    totalPages={totalDocumentsPages}
                    onPageChange={setDocumentsPage}
                  />
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối {selectedItemType === 'qa' ? 'câu hỏi huấn luyện' : 'tài liệu'}</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Nhập lý do từ chối..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason('');
                setSelectedItem(null);
                setSelectedItemType(null);
              }}
              disabled={rejectingId !== null}
            >
              Hủy
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={rejectingId !== null}
            >
              {rejectingId !== null ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang xử lý...
                </>
              ) : (
                'Từ Chối'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
