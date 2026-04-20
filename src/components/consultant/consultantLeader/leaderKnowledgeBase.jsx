import { useState, useEffect } from 'react';
import { ScrollArea } from '../../ui/system_users/scroll-area';
import { Button } from '../../ui/system_users/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/system_users/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/system_users/dialog';
import { Textarea } from '../../ui/system_users/textarea';
import { MessageCircle, FileText, Check, X, Loader2 } from 'lucide-react';
import { knowledgeAPI } from '../../../services/fastapi';
import { toast } from 'react-toastify';
import { Pagination } from '../../common/Pagination';

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
  const [questionsPage, setQuestionsPage] = useState(1);
  const [documentsPage, setDocumentsPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  useEffect(() => {
    fetchPendingItems();
  }, []);

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
      } else {
        await knowledgeAPI.approveDocument(id);
        toast.success('Đã duyệt tài liệu!');
      }

      await fetchPendingItems();
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
      } else {
        await knowledgeAPI.rejectDocument(selectedItem, rejectReason);
        toast.success('Đã từ chối tài liệu!');
      }

      await fetchPendingItems();

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

  const TrainingQuestionCard = ({ question }) => {
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    const isApproving = approvingId === question.question_id;
    const isRejecting = rejectingId === question.question_id;

    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <MessageCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">Training Question {question.question_id}</h3>
              <p className="text-sm text-muted-foreground">
                Tạo: {formatDate(question.created_at)}
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-800 flex-shrink-0">
            Nháp
          </span>
        </div>

        <div className="mb-4 space-y-3">
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Câu hỏi:</div>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{question.question}</p>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Câu trả lời:</div>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded whitespace-pre-wrap">
              {question.answer}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2"
            onClick={() => openRejectDialog(question.question_id, 'qa')}
            disabled={isApproving || isRejecting}
          >
            {isRejecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <X className="h-4 w-4" />
                Từ Chối
              </>
            )}
          </Button>
          <Button 
            size="sm"
            className="gap-2 bg-[#EB5A0D] hover:bg-[#d14f0a]"
            onClick={() => handleApprove(question.question_id, 'qa')}
            disabled={isApproving || isRejecting}
          >
            {isApproving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang duyệt...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Phê Duyệt
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  const DocumentCard = ({ document }) => {
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    const isApproving = approvingId === document.document_id;
    const isRejecting = rejectingId === document.document_id;

    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{document.title}</h3>
              <p className="text-sm text-muted-foreground">
                Tạo: {formatDate(document.created_at)}
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-800 flex-shrink-0">
            Nháp
          </span>
        </div>

        <div className="mb-4 space-y-2">
          <div>
            <div className="text-sm font-medium text-gray-700">File:</div>
            <p className="text-sm text-gray-600">{document.file_path?.split('/').pop() || 'N/A'}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2"
            onClick={() => openRejectDialog(document.document_id, 'document')}
            disabled={isApproving || isRejecting}
          >
            {isRejecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <X className="h-4 w-4" />
                Từ Chối
              </>
            )}
          </Button>
          <Button 
            size="sm"
            className="gap-2 bg-[#EB5A0D] hover:bg-[#d14f0a]"
            onClick={() => handleApprove(document.document_id, 'document')}
            disabled={isApproving || isRejecting}
          >
            {isApproving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang duyệt...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Phê Duyệt
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  const totalQuestionsPages = Math.ceil(trainingQuestions.length / ITEMS_PER_PAGE);
  const paginatedQuestions = trainingQuestions.slice(
    (questionsPage - 1) * ITEMS_PER_PAGE,
    questionsPage * ITEMS_PER_PAGE
  );

  const totalDocumentsPages = Math.ceil(documents.length / ITEMS_PER_PAGE);
  const paginatedDocuments = documents.slice(
    (documentsPage - 1) * ITEMS_PER_PAGE,
    documentsPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setQuestionsPage(1);
    setDocumentsPage(1);
  }, [activeTab]);

  return (
    <div className="min-h-screen h-full p-6 bg-[#F8FAFC]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Duyệt Cơ Sở Tri Thức</h1>
        <p className="text-muted-foreground">Xét duyệt câu hỏi huấn luyện và tài liệu đang chờ phê duyệt</p>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="qa" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Câu Hỏi Huấn Luyện
            <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">
              {trainingQuestions.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Tài Liệu
            <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">
              {documents.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="qa" className="mt-0">
          <ScrollArea className="h-[calc(100vh-200px)]">
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
                  <TrainingQuestionCard key={question.question_id} question={question} />
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
          </ScrollArea>
        </TabsContent>

        <TabsContent value="documents" className="mt-0">
          <ScrollArea className="h-[calc(100vh-200px)]">
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
                  <DocumentCard key={document.document_id} document={document} />
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
          </ScrollArea>
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
