import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/Auth';
import { knowledgeAPI, intentAPI } from '../../../services/fastapi';
import { TabSwitcher } from './TabSwitcher';
import { SearchAndFilter } from './SearchAndFilter';
import { QuestionList } from './QuestionList';
import { DocumentList } from './DocumentList';
import { QuestionDetailModal } from './QuestionDetailModal';
import { DocumentDetailModal } from './DocumentDetailModal';
import { AddQuestionModal } from './AddQuestionModal';
import { UploadDocumentModal } from './UploadDocumentModal';
import { TabType, TrainingQuestion, TrainingDocument, Intent } from './types';
import { Button } from '../../ui/system_users/button';
import { Pagination } from '../../common/Pagination';

export function TrainingDataManagement() {
  const { user, isConsultantLeader } = useAuth();
  const isLeader = isConsultantLeader();

  const [activeTab, setActiveTab] = useState<TabType>('questions');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [intents, setIntents] = useState<Intent[]>([]);
  const [loading, setLoading] = useState(true);

  const [questions, setQuestions] = useState<TrainingQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<TrainingQuestion | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);

  const [documents, setDocuments] = useState<TrainingDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<TrainingDocument | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showUploadDocumentModal, setShowUploadDocumentModal] = useState(false);

  const [approvingDocumentId, setApprovingDocumentId] = useState<number | null>(null);
  const [rejectingDocumentId, setRejectingDocumentId] = useState<number | null>(null);

  const [questionsPage, setQuestionsPage] = useState(1);
  const [documentsPage, setDocumentsPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchIntents();
    if (activeTab === 'questions') {
      fetchQuestions();
    } else {
      fetchDocuments();
    }
  }, [activeTab, statusFilter]);

  const fetchIntents = async () => {
    try {
      const data = await intentAPI.getIntents();
      setIntents(data.map(intent => ({ ...intent, description: intent.description || '' })));
    } catch (error) {
      toast.error('Không thể tải danh sách danh mục');
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await knowledgeAPI.getTrainingQuestions(
        statusFilter !== 'all' ? statusFilter : undefined
      );
      setQuestions(data);
    } catch (error) {
      toast.error('Không thể tải câu hỏi huấn luyện');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await knowledgeAPI.getDocuments(
        statusFilter !== 'all' ? statusFilter : undefined
      );

      setDocuments(data.map(doc => ({ 
        ...doc, 
        file_size: 0, 
        file_type: doc.file_path.split('.').pop() || 'unknown',
        reject_reason: doc.reject_reason || undefined
      })));
    } catch (error) {
      toast.error('Không thể tải tài liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuestion = (question: TrainingQuestion) => {
    setSelectedQuestion(question);
    setShowQuestionModal(true);
  };

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      await knowledgeAPI.deleteTrainingQuestion(questionId);
      toast.success('Xóa câu hỏi thành công');
      await fetchQuestions();
      setShowQuestionModal(false);
      setSelectedQuestion(null);
    } catch (error) {
      toast.error('Không thể xóa câu hỏi');
      throw error;
    }
  };

  const handleSelectDocument = async (document: TrainingDocument) => {
    try {

      const fullDoc = await knowledgeAPI.getDocumentById(document.document_id);
      setSelectedDocument({ 
        ...fullDoc, 
        file_size: 0, 
        file_type: fullDoc.file_path.split('.').pop() || 'unknown',
        reject_reason: fullDoc.reject_reason || undefined
      });
      setShowDocumentModal(true);
    } catch (error) {
      toast.error('Không thể tải chi tiết tài liệu');
    }
  };

  const handleUpdateDocument = async (
    documentId: number,
    data: { title: string; intent_id?: number; category?: string }
  ) => {
    try {

      toast.info('Chức năng cập nhật đang được phát triển');
      throw new Error('Update not implemented');
    } catch (error) {
      toast.error('Không thể cập nhật tài liệu');
      throw error;
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    try {
      await knowledgeAPI.deleteDocument(documentId);
      toast.success('Xóa tài liệu thành công');
      await fetchDocuments();
      setShowDocumentModal(false);
      setSelectedDocument(null);
    } catch (error) {
      toast.error('Không thể xóa tài liệu');
      throw error;
    }
  };

  const handleApproveDocument = async (documentId: number) => {
    try {
      setApprovingDocumentId(documentId);
      await knowledgeAPI.approveDocument(documentId);
      toast.success('Duyệt tài liệu thành công');
      await fetchDocuments();

      const fullDoc = await knowledgeAPI.getDocumentById(documentId);
      setSelectedDocument({ 
        ...fullDoc, 
        file_size: 0, 
        file_type: fullDoc.file_path.split('.').pop() || 'unknown',
        reject_reason: fullDoc.reject_reason || undefined
      });
    } catch (error) {
      toast.error('Không thể duyệt tài liệu');
      throw error;
    } finally {
      setApprovingDocumentId(null);
    }
  };

  const handleRejectDocument = async (documentId: number) => {
    try {
      setRejectingDocumentId(documentId);
      await knowledgeAPI.rejectDocument(documentId, 'Từ chối bởi người quản lý');
      toast.success('Từ chối tài liệu thành công');
      await fetchDocuments();

      const fullDoc = await knowledgeAPI.getDocumentById(documentId);
      setSelectedDocument({ 
        ...fullDoc, 
        file_size: 0, 
        file_type: fullDoc.file_path.split('.').pop() || 'unknown',
        reject_reason: fullDoc.reject_reason || undefined
      });
    } catch (error) {
      toast.error('Không thể từ chối tài liệu');
      throw error;
    } finally {
      setRejectingDocumentId(null);
    }
  };

  const handleAddQuestion = async (data: { question: string; answer: string; intent_id: number }) => {
    try {
      await knowledgeAPI.uploadTrainingQuestion(data);
      toast.success('Tạo câu hỏi thành công! Đang chờ duyệt.');
      await fetchQuestions();
    } catch (error) {
      toast.error('Không thể tạo câu hỏi');
      throw error;
    }
  };

  const handleUploadDocument = async (formData: FormData, intentId: number) => {
    try {
      await knowledgeAPI.uploadDocument(formData, intentId);
      toast.success('Tải lên tài liệu thành công! Đang chờ duyệt.');
      await fetchDocuments();
    } catch (error) {
      toast.error('Không thể tải lên tài liệu');
      throw error;
    }
  };

  const sortByDateAndStatus = <T extends { created_at?: string | Date; status?: string }>(items: T[]): T[] => {
    return [...items].sort((a, b) => {

      if (a.created_at && b.created_at) {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        if (dateA !== dateB) {
          return dateB - dateA;
        }
      }

      const statusOrder: { [key: string]: number } = {
        'nhap': 1,
        'da duyet': 2,
        'tu choi': 3
      };
      
      const statusA = statusOrder[a.status || ''] || 999;
      const statusB = statusOrder[b.status || ''] || 999;
      
      return statusA - statusB;
    });
  };

  const filteredQuestions = sortByDateAndStatus(
    questions.filter((q) => {
      const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.intent_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || q.intent_id?.toString() === categoryFilter;
      
      return matchesSearch && matchesCategory;
    })
  );

  const filteredDocuments = sortByDateAndStatus(
    documents.filter((d) => {
      const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.intent_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || d.intent_id?.toString() === categoryFilter;
      
      return matchesSearch && matchesCategory;
    })
  );

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
  }, [searchQuery, statusFilter, categoryFilter, activeTab]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dữ Liệu Huấn Luyện</h1>
          <p className="text-gray-600 mt-1">
            Quản lý câu hỏi huấn luyện và tài liệu cho hệ thống chatbot
          </p>
        </div>
        <Button 
          className="bg-[#EB5A0D] hover:bg-[#d14f0a]"
          onClick={() => activeTab === 'questions' ? setShowAddQuestionModal(true) : setShowUploadDocumentModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          {activeTab === 'questions' ? 'Thêm Câu Hỏi' : 'Tải Tài Liệu'}
        </Button>
      </div>

      {}
      <TabSwitcher
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {}
      <SearchAndFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        intents={intents}
        isLeader={isLeader}
      />

      {}
      <div className="bg-white rounded-lg border shadow-sm">
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : activeTab === 'questions' ? (
          <>
            {}
            <div className="px-4 py-3 border-b bg-gray-50">
              <p className="text-sm text-gray-600">
                Tổng số: <span className="font-semibold text-gray-900">{questions.length}</span> câu hỏi
                {filteredQuestions.length !== questions.length && (
                  <span className="ml-2 text-gray-500">
                    (Hiển thị: {filteredQuestions.length})
                  </span>
                )}
              </p>
            </div>
            <div className="p-4">
              <QuestionList
                questions={paginatedQuestions}
                selectedQuestion={selectedQuestion}
                onSelectQuestion={handleSelectQuestion}
              />
            </div>
            {filteredQuestions.length > 0 && (
              <Pagination
                currentPage={questionsPage}
                totalPages={totalQuestionsPages}
                onPageChange={setQuestionsPage}
              />
            )}
          </>
        ) : (
          <>
            {}
            <div className="px-4 py-3 border-b bg-gray-50">
              <p className="text-sm text-gray-600">
                Tổng số: <span className="font-semibold text-gray-900">{documents.length}</span> tài liệu
                {filteredDocuments.length !== documents.length && (
                  <span className="ml-2 text-gray-500">
                    (Hiển thị: {filteredDocuments.length})
                  </span>
                )}
              </p>
            </div>
            <div className="p-4">
              <DocumentList
                documents={paginatedDocuments}
                selectedDocument={selectedDocument}
                onSelectDocument={handleSelectDocument}
              />
            </div>
            {filteredDocuments.length > 0 && (
              <Pagination
                currentPage={documentsPage}
                totalPages={totalDocumentsPages}
                onPageChange={setDocumentsPage}
              />
            )}
          </>
        )}
      </div>

      {}
      {showQuestionModal && selectedQuestion && (
        <QuestionDetailModal
          question={selectedQuestion}
          intents={intents}
          isLeader={isLeader}
          onClose={() => {
            setShowQuestionModal(false);
            setSelectedQuestion(null);
          }}
          onDelete={handleDeleteQuestion}
        />
      )}

      {showDocumentModal && selectedDocument && (
        <DocumentDetailModal
          document={selectedDocument}
          intents={intents}
          isLeader={isLeader}
          onClose={() => {
            setShowDocumentModal(false);
            setSelectedDocument(null);
          }}
          onDelete={handleDeleteDocument}
          onApprove={isLeader ? handleApproveDocument : undefined}
          onReject={isLeader ? handleRejectDocument : undefined}
          isApproving={approvingDocumentId === selectedDocument.document_id}
          isRejecting={rejectingDocumentId === selectedDocument.document_id}
        />
      )}

      {}
      {showAddQuestionModal && (
        <AddQuestionModal
          key="add-question-modal"
          intents={intents}
          onClose={() => setShowAddQuestionModal(false)}
          onSubmit={handleAddQuestion}
        />
      )}

      {showUploadDocumentModal && (
        <UploadDocumentModal
          intents={intents}
          onClose={() => setShowUploadDocumentModal(false)}
          onSubmit={handleUploadDocument}
        />
      )}
    </div>
  );
}
