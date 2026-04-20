import { FileText, Download, Tag, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/system_users/card';
import { Badge } from '../../ui/system_users/badge';
import { Button } from '../../ui/system_users/button';
import { Separator } from '../../ui/system_users/separator';
import { knowledgeAPI } from '../../../services/fastapi';
import { toast } from 'react-toastify';
import { useState } from 'react';

export function DocumentList({ filteredDocuments }) {
  const [failedDownloads, setFailedDownloads] = useState(new Set());

  const getStatusBadge = (status) => {
    if (!status) return null;

    const statusConfig = {
      draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Nháp' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Đã duyệt' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Từ chối' },
      deleted: { color: 'bg-gray-100 text-gray-800', label: 'Đã xóa' }
    };

    const config = statusConfig[status];
    if (!config) return null;

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${config.color}`}>
        {config.label}
      </span>
    );
  };
  
  const handleDownload = async (doc) => {
    try {

      const blob = await knowledgeAPI.downloadDocument(doc.document_id);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.title || `document-${doc.document_id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Tải tài liệu thành công!');
    } catch (error) {

      setFailedDownloads(prev => new Set([...prev, doc.document_id]));

      let errorMessage = 'Không thể tải tài liệu. Vui lòng thử lại.';
      
      if (error instanceof Error) {

        if (error.message.includes('File not found')) {
          errorMessage = 'Tệp không tồn tại trên máy chủ. Tài liệu này có thể đã bị xóa.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Tệp không tồn tại. Vui lòng liên hệ quản trị viên.';
        } else {
          errorMessage = error.message;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.detail) {
        errorMessage = error.detail;
      }
      
      toast.error(errorMessage);
    }
  };
  if (filteredDocuments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Không tìm thấy tài liệu nào.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filteredDocuments.map((doc) => (
        <Card key={doc.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base mb-1">{doc.title}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Separator />
            <div className="flex items-center text-sm text-muted-foreground">
              <span>{doc.fileType}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {getStatusBadge(doc.status)}
              <Badge variant="secondary">{doc.category}</Badge>
              {doc.tags && doc.tags.length > 0 && doc.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              Tải lên: {new Date(doc.uploadedDate).toLocaleDateString('vi-VN')}
            </div>
            {failedDownloads.has(doc.document_id) ? (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs">Tệp không khả dụng trên máy chủ</span>
              </div>
            ) : (
              <Button 
                size="sm" 
                className="w-full gap-2 bg-[#EB5A0D] hover:bg-[#d14f0a] text-white"
                onClick={() => handleDownload(doc)}
              >
                <Download className="h-4 w-4" />
                Tải Xuống
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default DocumentList;