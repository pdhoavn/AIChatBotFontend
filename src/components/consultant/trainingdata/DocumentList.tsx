import { TrainingDocument } from './types';
import { FileText } from 'lucide-react';

interface DocumentListProps {
  documents: TrainingDocument[];
  selectedDocument: TrainingDocument | null;
  onSelectDocument: (document: TrainingDocument) => void;
}

export function DocumentList({ documents, selectedDocument, onSelectDocument }: DocumentListProps) {
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

  const formatFileSize = (sizeInBytes: number) => {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div
          key={doc.document_id}
          onClick={() => onSelectDocument(doc)}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            selectedDocument?.document_id === doc.document_id
              ? 'bg-orange-50 border-[#EB5A0D] shadow-sm'
              : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded">
              <FileText className="h-5 w-5 text-gray-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium text-gray-900 truncate">
                  {doc.title}
                </h3>
                {getStatusBadge(doc.status)}
              </div>
              
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{doc.file_type?.toUpperCase() || 'FILE'}</span>
                {doc.intent_name && (
                  <>
                    <span>•</span>
                    <span>{doc.intent_name}</span>
                  </>
                )}
              </div>
              
              {doc.status === 'rejected' && doc.reject_reason && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                  <p className="text-xs text-red-700 line-clamp-2">
                    <span className="font-semibold">Lý do từ chối:</span> {doc.reject_reason}
                  </p>
                </div>
              )}
              
              {doc.created_at && (
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(doc.created_at).toLocaleDateString('vi-VN')}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {documents.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Không có tài liệu nào</p>
        </div>
      )}
    </div>
  );
}
