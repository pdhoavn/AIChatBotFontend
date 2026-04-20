import { useState, useEffect } from 'react';
import { Search, Plus, MessageCircle, Trash2, Edit, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { ScrollArea } from '../ui/system_users/scroll-area';
import { Input } from '../ui/system_users/input';
import { Button } from '../ui/system_users/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/system_users/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/system_users/dialog';
import { Textarea } from '../ui/system_users/textarea';
import { useAuth } from '../../contexts/Auth';
import { fastAPIClient } from '../../utils/fastapi-client';
import { templateAPI, knowledgeAPI } from '../../services/fastapi';
import { Template } from '../../types/template.types';
import { toast } from 'react-toastify';
import { t } from '../../utils/i18n';

interface TrainingQuestionPair {
  question_id: number;
  question: string;
  answer: string;
  intent_id?: number;
  intent_name?: string;
  status?: string;
  created_at?: string;
  approved_at?: string;
  created_by?: number;
  approved_by?: number;
}

interface CreateTrainingQuestionRequest {
  question: string;
  answer: string;
  intent_id: number;
}

interface CreateTrainingQuestionResponse {
  message: string;
  qa_id: number;
  status: string;
}

interface Intent {
  intent_id: number;
  intent_name: string;
  description: string;
}

interface TrainingQuestionManagementProps {
  prefilledQuestion?: string | null;
  onQuestionUsed?: () => void;
  templateAction?: 'edit' | 'add' | 'view' | null;
}

export function TrainingQuestionManagement({ prefilledQuestion, onQuestionUsed, templateAction }: TrainingQuestionManagementProps) {
  const { hasPermission, user, isConsultantLeader } = useAuth();
  const [trainingQuestions, setTrainingQuestions] = useState<TrainingQuestionPair[]>([]);
  const [intents, setIntents] = useState<Intent[]>([]);
  const [loading, setLoading] = useState(true);
  const [intentLoading, setIntentLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIntent, setSelectedIntent] = useState('Tất cả danh mục');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<TrainingQuestionPair | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState('');
  const [editedAnswer, setEditedAnswer] = useState('');
  const [editedIntentId, setEditedIntentId] = useState<number | null>(null);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedQAPairIndex, setSelectedQAPairIndex] = useState<string>('');

  const isLeader = isConsultantLeader();

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusConfig = {
      draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Nháp' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Đã duyệt' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Từ chối' },
      deleted: { color: 'bg-gray-100 text-gray-800', label: 'Đã xóa' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;
    
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setIntentLoading(true);

      const intentsData = await fastAPIClient.get<Intent[]>('/intent');
      setIntents(intentsData);

      let questionsData: TrainingQuestionPair[];
      if (isLeader && statusFilter !== 'all') {

        questionsData = await knowledgeAPI.getTrainingQuestions(statusFilter);
      } else {

        questionsData = await knowledgeAPI.getTrainingQuestions();
      }

      const sortedData = questionsData.sort((a, b) => a.question_id - b.question_id);

      const questionsWithIntentNames = sortedData.map(question => {
        const intent = intentsData.find(i => i.intent_id === question.intent_id);
        return {
          ...question,
          intent_name: intent?.intent_name || 'Không có danh mục'
        };
      });
      
      setTrainingQuestions(questionsWithIntentNames);

      if (questionsWithIntentNames.length > 0) {
        setSelectedQuestion(questionsWithIntentNames[0]);
      } else {
        setSelectedQuestion(null);
      }
    } catch (error) {
      toast.error('Không thể tải câu hỏi huấn luyện hoặc danh mục');
    } finally {
      setLoading(false);
      setIntentLoading(false);
    }
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!showAddDialog) return;
      
      try {
        setTemplatesLoading(true);
        const data = await templateAPI.getTemplates();
        setTemplates(data);
      } catch (error) {
        toast.error('Không thể tải mẫu');
      } finally {
        setTemplatesLoading(false);
      }
    };

    fetchTemplates();
  }, [showAddDialog]);

  const intentCategories = ['Tất cả danh mục', ...intents.map(intent => intent.intent_name)];

  useEffect(() => {
    if (prefilledQuestion && templateAction) {
      if (templateAction === 'add') {

        setEditedQuestion(prefilledQuestion);
        setEditedAnswer('');
        setEditedIntentId(null);
        setShowAddDialog(true);
      } else if (templateAction === 'edit') {

        const existingQuestion = trainingQuestions.find(tq => tq.question === prefilledQuestion);
        if (existingQuestion) {
          setSelectedQuestion(existingQuestion);
          setEditedQuestion(existingQuestion.question);
          setEditedAnswer(existingQuestion.answer);
          setEditedIntentId(existingQuestion.intent_id);
          setIsEditing(true);
        }
      } else if (templateAction === 'view') {

        const existingQuestion = trainingQuestions.find(tq => tq.question === prefilledQuestion);
        if (existingQuestion) {
          setSelectedQuestion(existingQuestion);
          setIsEditing(false);
        }
      }
      onQuestionUsed?.();
    }
  }, [prefilledQuestion, onQuestionUsed, templateAction, trainingQuestions]);

  const filteredTrainingQuestions = trainingQuestions.filter(tq => {
    const matchesSearch = tq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIntent = selectedIntent === 'Tất cả danh mục' || tq.intent_name === selectedIntent;
    return matchesSearch && matchesIntent;
  });

  const handleEdit = () => {
    if (selectedQuestion) {
      setEditedQuestion(selectedQuestion.question);
      setEditedAnswer(selectedQuestion.answer);
      setEditedIntentId(selectedQuestion.intent_id);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!selectedQuestion || !editedQuestion.trim() || !editedAnswer.trim() || !editedIntentId) {
      toast.error('Vui lòng điền tất cả các trường');
      return;
    }

    try {

      setTrainingQuestions(prev => 
        prev.map(tq => 
          tq.question_id === selectedQuestion.question_id
            ? {
                ...tq,
                question: editedQuestion.trim(),
                answer: editedAnswer.trim(),
                intent_id: editedIntentId,
                intent_name: intents.find(intent => intent.intent_id === editedIntentId)?.intent_name
              }
            : tq
        )
      );

      const updatedQuestion = {
        ...selectedQuestion,
        question: editedQuestion.trim(),
        answer: editedAnswer.trim(),
        intent_id: editedIntentId,
        intent_name: intents.find(intent => intent.intent_id === editedIntentId)?.intent_name
      };
      setSelectedQuestion(updatedQuestion);

      setIsEditing(false);
      toast.success('Cập nhật câu hỏi huấn luyện thành công!');
    } catch (error) {
      toast.error('Không thể cập nhật câu hỏi huấn luyện. Vui lòng thử lại.');
    }
  };

  const handleDelete = async () => {
    if (!selectedQuestion) return;

    try {
      await knowledgeAPI.deleteTrainingQuestion(selectedQuestion.question_id);

      setTrainingQuestions(prev => 
        prev.filter(tq => tq.question_id !== selectedQuestion.question_id)
      );

      const remaining = trainingQuestions.filter(tq => tq.question_id !== selectedQuestion.question_id);
      setSelectedQuestion(remaining.length > 0 ? remaining[0] : null);

      setShowDeleteDialog(false);
      toast.success('Xóa câu hỏi huấn luyện thành công!');
    } catch (error) {
      toast.error('Không thể xóa câu hỏi huấn luyện. Vui lòng thử lại.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleUseTemplate = () => {
    if (!selectedTemplateId || !selectedQAPairIndex) return;
    
    const template = templates.find(t => t.template_id?.toString() === selectedTemplateId);
    if (!template) return;
    
    const qaPairIndex = parseInt(selectedQAPairIndex);
    const qaPair = template.qa_pairs[qaPairIndex];
    
    if (qaPair) {
      setEditedQuestion(qaPair.question);
      setEditedAnswer(qaPair.answer);
      toast.success('Đã tải mẫu! Bây giờ bạn có thể chỉnh sửa và gửi.');
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setSelectedQAPairIndex('');
  };

  const handleCreateTrainingQuestion = async () => {
    if (!editedQuestion.trim() || !editedAnswer.trim() || !editedIntentId || !user?.id) {
      return;
    }

    try {
      setCreating(true);
      
      const requestBody: CreateTrainingQuestionRequest = {
        question: editedQuestion.trim(),
        answer: editedAnswer.trim(),
        intent_id: editedIntentId
      };

      await fastAPIClient.post<CreateTrainingQuestionResponse>(
        `/knowledge/upload/training_question?current_user_id=${user.id}`,
        requestBody
      );

      setEditedQuestion('');
      setEditedAnswer('');
      setEditedIntentId(null);
      setSelectedTemplateId('');
      setSelectedQAPairIndex('');
      setShowAddDialog(false);

      await fetchData();

      toast.success('Câu hỏi huấn luyện được tạo thành công!');

      if (isLeader) {
        toast.info('Câu hỏi được lưu dưới dạng bản nháp và cần được duyệt.');
      } else {
        toast.info('Câu hỏi của bạn đã được gửi để xét duyệt.');
      }
    } catch (error) {
      toast.error('Không thể tạo câu hỏi huấn luyện. Vui lòng thử lại.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen h-full flex bg-[#F8FAFC]">
      {}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col min-w-0 overflow-hidden">
        {}
        <div className="p-4 border-b border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t('training.title')}</h2>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => {
              setEditedQuestion('');
              setEditedAnswer('');
              setEditedIntentId(null);
              setShowAddDialog(true);
            }}>
              <Plus className="h-4 w-4" />
              {t('common.add')}
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('training.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedIntent} onValueChange={setSelectedIntent}>
            <SelectTrigger>
              <SelectValue placeholder={t('documents.select_intent_placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {intentCategories.map(intent => (
                <SelectItem key={intent} value={intent}>{intent}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="draft">Bản nháp</SelectItem>
              <SelectItem value="approved">Đã duyệt</SelectItem>
              <SelectItem value="rejected">Đã từ chối</SelectItem>
            </SelectContent>
          </Select>

          <div className="text-sm text-muted-foreground">
            {loading ? 'Đang tải' : `${filteredTrainingQuestions.length} ${'Câu Hỏi Huấn Luyện'.toLowerCase()}`}
          </div>
        </div>

        {}
        <ScrollArea className="flex-1 overflow-hidden">
          <div className="p-2 space-y-1 min-w-0">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">{t('training.loading_questions')}</div>
            ) : filteredTrainingQuestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">{t('training.no_questions_found')}</div>
            ) : (
              filteredTrainingQuestions.map(tq => (
                <button
                  key={tq.question_id}
                  onClick={() => setSelectedQuestion(tq)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left overflow-hidden ${
                    selectedQuestion?.question_id === tq.question_id
                      ? 'bg-[#3B82F6] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <MessageCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium break-words flex-1">{tq.question}</div>
                      {tq.status && (
                        <div className="flex-shrink-0">
                          {getStatusBadge(tq.status)}
                        </div>
                      )}
                    </div>
                    <div className={`text-sm break-words ${
                      selectedQuestion?.question_id === tq.question_id ? 'text-blue-100' : 'text-muted-foreground'
                    }`}>
                      Danh mục: {tq.intent_name || 'Đang tải...'}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {}
      <div className="flex-1 flex flex-col">
        {selectedQuestion ? (
          <ScrollArea className="flex-1">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">
                  {isEditing ? 'Chỉnh sửa câu hỏi' : 'Chi tiết câu hỏi'}
                </h1>
                {!isEditing && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={handleEdit}>
                      <Edit className="h-4 w-4" />Chỉnh Sửa</Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="gap-2"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4" />Xóa</Button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('common.question')}</label>
                    <Input
                      value={editedQuestion}
                      onChange={(e) => setEditedQuestion(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('common.answer')}</label>
                    <Textarea
                      value={editedAnswer}
                      onChange={(e) => setEditedAnswer(e.target.value)}
                      className="min-h-[200px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('common.intent')}</label>
                    <Select value={editedIntentId?.toString() || ''} onValueChange={(value) => setEditedIntentId(Number(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('documents.select_intent_placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {intentLoading ? (
                          <SelectItem value="loading" disabled>{t('training.loading_intents')}</SelectItem>
                        ) : (
                          intents.map((intent) => (
                            <SelectItem key={intent.intent_id} value={intent.intent_id.toString()}>
                              {intent.intent_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleCancel}>{t('common.cancel')}</Button>
                    <Button onClick={handleSave}>
                      {t('common.save')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">{t('common.intent')}</div>
                      <div>{selectedQuestion.intent_name || 'Đang tải'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">{t('common.question')} ID</div>
                      <div>{selectedQuestion.question_id}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">{t('common.question')}</h3>
                      <p className="text-gray-700">{selectedQuestion.question}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">{t('common.answer')}</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedQuestion.answer}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="font-medium">{t('training.no_question_selected')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('training.select_question_prompt')}
              </p>
            </div>
          </div>
        )}
      </div>

      {}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa Câu Hỏi Huấn Luyện</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa câu hỏi huấn luyện này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete}>Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-6xl w-[1200px] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{t('training.create_question')}</DialogTitle>
            <DialogDescription>
              {t('training.use_template')}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 overflow-y-auto -mx-6 px-6">
            <div className="grid grid-cols-1 gap-6 py-4">
            {}
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-sm">{t('training.use_template')}</h3>
                <span className="text-xs text-muted-foreground ml-auto">
                  {templates.length} {t('common.optional')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {}
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('training.select_template')}</label>
                  <Select 
                    value={selectedTemplateId} 
                    onValueChange={handleTemplateChange}
                    disabled={templatesLoading || templates.length === 0}
                  >
                    <SelectTrigger className="h-11 bg-white">
                      <SelectValue placeholder={templatesLoading ? 'Đang tải' : 'Chọn mẫu câu hỏi'} />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.template_id} value={template.template_id!.toString()}>
                          {template.template_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Chọn Cặp Hỏi-Đáp</label>
                  <Select 
                    value={selectedQAPairIndex} 
                    onValueChange={setSelectedQAPairIndex}
                    disabled={!selectedTemplateId}
                  >
                    <SelectTrigger className="h-11 bg-white">
                      <SelectValue placeholder="Chọn cặp hỏi-đáp" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedTemplateId && templates
                        .find(t => t.template_id?.toString() === selectedTemplateId)
                        ?.qa_pairs
                        .sort((a, b) => a.order_position - b.order_position)
                        .map((qa, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {qa.question.substring(0, 50)}{qa.question.length > 50 ? '...' : ''}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {}
                <div className="space-y-2">
                  <label className="text-sm font-medium opacity-0">Hành động</label>
                  <Button
                    onClick={handleUseTemplate}
                    disabled={!selectedTemplateId || !selectedQAPairIndex}
                    className="w-full h-11 bg-[#EB5A0D] hover:bg-[#d14f0a]"
                  >
                    Tải Mẫu
                  </Button>
                </div>
              </div>

              {}
              {selectedTemplateId && selectedQAPairIndex && (
                <div className="p-3 bg-white rounded-md border border-blue-200 text-sm">
                  <div className="font-medium text-gray-700 mb-1">Xem Trước:</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div><span className="font-semibold">Câu hỏi:</span> {templates.find(t => t.template_id?.toString() === selectedTemplateId)?.qa_pairs[parseInt(selectedQAPairIndex)]?.question}</div>
                    <div className="line-clamp-2"><span className="font-semibold">Trả lời:</span> {templates.find(t => t.template_id?.toString() === selectedTemplateId)?.qa_pairs[parseInt(selectedQAPairIndex)]?.answer}</div>
                  </div>
                </div>
              )}
            </div>

            {}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  {t('common.question')}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  value={editedQuestion}
                  onChange={(e) => setEditedQuestion(e.target.value)}
                  placeholder={t('training.search_placeholder')}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  {t('common.answer')}
                  <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={editedAnswer}
                  onChange={(e) => setEditedAnswer(e.target.value)}
                  placeholder={t('common.answer')}
                  className="min-h-[180px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  {t('common.intent')}
                  <span className="text-red-500">*</span>
                </label>
                <Select value={editedIntentId?.toString() || ''} onValueChange={(value) => setEditedIntentId(Number(value))}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={t('training.select_intent_for_question')} />
                  </SelectTrigger>
                  <SelectContent>
                    {intentLoading ? (
                      <SelectItem value="loading" disabled>{t('training.loading_intents')}</SelectItem>
                    ) : (
                      intents.map((intent) => (
                        <SelectItem key={intent.intent_id} value={intent.intent_id.toString()}>
                          {intent.intent_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            </div>
          </ScrollArea>

          <DialogFooter className="flex-shrink-0">
            <Button 
              variant="outline" 
              onClick={() => {
                setEditedQuestion('');
                setEditedAnswer('');
                setEditedIntentId(null);
                setSelectedTemplateId('');
                setSelectedQAPairIndex('');
                setShowAddDialog(false);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleCreateTrainingQuestion}
              disabled={creating || !editedQuestion.trim() || !editedAnswer.trim() || !editedIntentId}
              className="bg-[#EB5A0D] hover:bg-[#d14f0a]"
            >
              {creating ? t('training.creating') : t('training.create_question')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}