import { useState, useEffect } from 'react';
import { Search, Plus, FileText, Trash2, Edit, Download, Loader2 } from 'lucide-react';
import { ScrollArea } from '../ui/system_users/scroll-area';
import { Input } from '../ui/system_users/input';
import { Button } from '../ui/system_users/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/system_users/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/system_users/dialog';
import { KnowledgeDocument, Intent } from '../../utils/fastapi-client';
import { knowledgeAPI, intentAPI } from '../../services/fastapi';
import { useAuth } from '../../contexts/Auth';
import { API_CONFIG } from '../../config/api.js';
import { toast } from 'react-toastify';
import { t } from '../../utils/i18n';

type Document = KnowledgeDocument;

const getFileType = (filePath: string) => {
  const extension = filePath.split('.').pop()?.toLowerCase() || '';
  return extension;
};

const formatFileSize = (sizeInBytes: number) => {
  if (sizeInBytes < 1024) return `${sizeInBytes} B`;
  if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export function DocumentManagement() {
  const { user, isConsultantLeader } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [intents, setIntents] = useState<Intent[]>([]);
  const [selectedIntent, setSelectedIntent] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState('');

  const isLeader = isConsultantLeader();

  useEffect(() => {
    fetchDocuments();
    fetchIntents();
  }, [statusFilter]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      const data = statusFilter !== 'all' 
        ? await knowledgeAPI.getDocuments(statusFilter)
        : await knowledgeAPI.getDocuments();
      setDocuments(data);

      if (data.length > 0 && !selectedDoc) {
        await fetchDocumentDetails(data[0].document_id);
      } else if (data.length === 0) {
        setSelectedDoc(null);
      }
    } catch (error) {
      toast.error('Không thể tải tài liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentDetails = async (documentId: number) => {
    try {
      const details = await knowledgeAPI.getDocumentById(documentId);
      setSelectedDoc(details);
    } catch (error) {
      toast.error('Không thể tải chi tiết tài liệu. Vui lòng thử lại.');
    }
  };

  const fetchIntents = async () => {
    try {
      const data = await intentAPI.getIntents();
      setIntents(data);
    } catch (error) {
      toast.error('Không thể tải danh mục. Vui lòng thử lại.');
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile || !user || !selectedIntent) {
      toast.error('Vui lòng điền tất cả các trường bắt buộc (tệp và danh mục)');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('title', documentTitle || uploadedFile.name.split('.')[0]);
      formData.append('current_user_id', user.id.toString());

      await knowledgeAPI.uploadDocument(formData, parseInt(selectedIntent));

      setUploadedFile(null);
      setSelectedIntent('');
      setDocumentTitle('');
      setShowUploadDialog(false);

      await fetchDocuments();
      
      toast.success('Tải lên tài liệu thành công!');
    } catch (error) {
      toast.error(`Không thể tải lên tài liệu: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDoc) return;

    try {
      setDeleting(true);
      await knowledgeAPI.deleteDocument(selectedDoc.document_id);

      setDocuments(prev => prev.filter(doc => doc.document_id !== selectedDoc.document_id));

      setSelectedDoc(null);
      setShowDeleteDialog(false);
      
      toast.success('Xóa tài liệu thành công!');
    } catch (error) {
      toast.error('Không thể xóa tài liệu. Vui lòng thử lại.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const blob = await knowledgeAPI.downloadDocument(doc.document_id);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.title || `document-${doc.document_id}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Tải tài liệu thành công!');
    } catch (error: any) {
      const errorMessage = error?.message || 'Không thể tải xuống tài liệu. Vui lòng thử lại.';
      toast.error(errorMessage);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'deleted': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'approved': return 'Đã duyệt';
      case 'draft': return 'Nháp';
      case 'rejected': return 'Từ chối';
      case 'deleted': return 'Đã xóa';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen h-full flex bg-[#F8FAFC]">
      {}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {}
        <div className="p-4 border-b border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t('documents.title')}</h2>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => {
                setUploadedFile(null);
                setShowUploadDialog(true);
              }}
            >
              <Plus className="h-4 w-4" />
              {t('common.upload')}
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {}
          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('common.filter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('status.all_statuses')}</SelectItem>
                <SelectItem value="draft">{t('status.draft')}</SelectItem>
                <SelectItem value="approved">{t('status.approved')}</SelectItem>
                <SelectItem value="rejected">{t('status.rejected')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            {filteredDocuments.length} {'Tài Liệu'.toLowerCase()}
          </div>
        </div>

        {}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">{t('common.loading')}</span>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">{t('documents.no_documents_found')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery 
                  ? `${t('documents.no_documents_found')} "${searchQuery}"`
                  : t('documents.upload_first_document')
                }
              </p>
              {!searchQuery && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => {
                    setUploadedFile(null);
                    setShowUploadDialog(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Tải Lên Tài Liệu Đầu Tiên
                </Button>
              )}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Không tìm thấy tài liệu</p>
                  {searchQuery ? (
                    <p className="text-xs mt-1">Thử điều chỉnh cụm từ tìm kiếm của bạn</p>
                  ) : (
                    <p className="text-xs mt-1">Tải lên tài liệu đầu tiên để bắt đầu</p>
                  )}
                </div>
              ) : (
                filteredDocuments.map(doc => (
                  <button
                    key={doc.document_id}
                    onClick={() => fetchDocumentDetails(doc.document_id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left ${
                      selectedDoc?.document_id === doc.document_id
                        ? 'bg-[#3B82F6] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FileText className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium truncate flex-1">{doc.title}</div>
                        {doc.status && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(doc.status)}`}>
                            {getStatusLabel(doc.status)}
                          </span>
                        )}
                      </div>
                      <div className={`text-sm truncate ${
                        selectedDoc?.document_id === doc.document_id ? 'text-blue-100' : 'text-muted-foreground'
                      }`}>
                        Tạo {formatDate(doc.created_at)}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      {}
      <div className="flex-1 flex flex-col">
        {selectedDoc ? (
          <ScrollArea className="flex-1">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">{selectedDoc.title}</h1>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => handleDownload(selectedDoc)}
                  >
                    <Download className="h-4 w-4" />{t('common.download')}</Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    {t('common.delete')}
                  </Button>
                </div>
              </div>

              {}
              {selectedDoc.status && (
                <div className="mb-4">
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(selectedDoc.status)}`}>
                    {t('common.status')}: {getStatusLabel(selectedDoc.status)}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">{t('common.created')}</div>
                  <div>{formatDate(selectedDoc.created_at)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">{t('documents.file_type')}</div>
                  <div className="capitalize">{getFileType(selectedDoc.file_path)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">{t('common.category')}</div>
                  <div className="capitalize">{selectedDoc.category || 'Chung'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">{t('documents.document_id')}</div>
                  <div>{selectedDoc.document_id}</div>
                </div>
                {selectedDoc.status && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">{t('common.status')}</div>
                    <div className="capitalize">{selectedDoc.status}</div>
                  </div>
                )}
                {selectedDoc.reviewed_by && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">{t('documents.reviewed_by')}</div>
                    <div>ID Người Dùng: {selectedDoc.reviewed_by}</div>
                  </div>
                )}
                {selectedDoc.reviewed_at && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">{t('documents.reviewed_at')}</div>
                    <div>{formatDate(selectedDoc.reviewed_at)}</div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="font-medium">{t('documents.no_document_selected')}</h3>
              <p className="text-sm text-muted-foreground">
                {documents.length === 0 
                  ? t('documents.upload_first_document')
                  : t('documents.select_document_prompt')
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa Tài Liệu</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tài liệu này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Hủy</Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang xóa...
                </>
              ) : (
                'Xóa'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('documents.upload_document')}</DialogTitle>
            <DialogDescription>
              {t('documents.upload_dialog_description')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {}
            <div className="space-y-2">
              <label className="text-sm font-medium text-red-600">{t('documents.intent_required')}</label>
              <Select value={selectedIntent} onValueChange={setSelectedIntent}>
                <SelectTrigger>
                  <SelectValue placeholder={t('documents.select_intent_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {intents.map((intent) => (
                    <SelectItem key={intent.intent_id} value={intent.intent_id.toString()}>
                      {intent.intent_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {intents.length === 0 && (
                <p className="text-xs text-muted-foreground">{t('documents.loading_intents')}</p>
              )}
            </div>

            {}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('documents.document_title')}</label>
              <Input
                type="text"
                placeholder={t('documents.enter_title_placeholder')}
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {t('documents.title_helper_text')}
              </p>
            </div>

            {}
            <div className="space-y-2">
              <label className="text-sm font-medium text-red-600">{t('documents.file_required')}</label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.html,.xlsx,.pptx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {

                      const maxSize = 50 * 1024 * 1024;
                      if (file.size > maxSize) {
                        toast.error('Kích thước tệp vượt quá giới hạn 50MB');
                        e.target.value = '';
                        return;
                      }
                      
                      setUploadedFile(file);

                      if (!documentTitle) {
                        setDocumentTitle(file.name.split('.')[0]);
                      }
                    }
                  }}
                  className="flex-1"
                />
              </div>
              {uploadedFile && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('documents.file_size')}: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {t('documents.supported_formats')}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setUploadedFile(null);
              setSelectedIntent('');
              setDocumentTitle('');
              setShowUploadDialog(false);
            }}>{t('common.cancel')}</Button>
            <Button 
              onClick={handleUpload}
              disabled={!uploadedFile || !selectedIntent || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t('documents.uploading')}
                </>
              ) : (
                'Tải Lên Tài Liệu'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}