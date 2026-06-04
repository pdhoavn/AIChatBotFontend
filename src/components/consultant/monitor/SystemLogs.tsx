import { useState, useEffect } from 'react';
import { Activity, Clock, CheckCircle, XCircle, Trash2, PlusCircle, Search } from 'lucide-react';
import { knowledgeAPI } from '../../../services/fastapi';
import { toast } from 'react-toastify';
import { ScrollArea } from '../../ui/system_users/scroll-area';
import { Input } from '../../ui/system_users/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/system_users/select';
import { Pagination } from '../../common/Pagination';

type LogEvent = {
  id: string;
  type: 'document' | 'question';
  action: 'CREATE' | 'APPROVE' | 'REJECT' | 'DELETE';
  title: string;
  actorName: string;
  timestamp: Date;
  reason?: string;
  details: string;
};

export function SystemLogs() {
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    fetchAndProcessLogs();
  }, []);

  const fetchAndProcessLogs = async () => {
    try {
      setLoading(true);
      const [
        allDocs,
        allQuestions,
        deletedDocs,
        deletedQuestions
      ] = await Promise.all([
        knowledgeAPI.getDocuments().catch(() => []),
        knowledgeAPI.getTrainingQuestions().catch(() => []),
        knowledgeAPI.getDeletedDocuments().catch(() => []),
        knowledgeAPI.getDeletedTrainingQuestions().catch(() => [])
      ]);

      const docMap = new Map();
      [...allDocs, ...deletedDocs].forEach(d => docMap.set(d.document_id, d));
      
      const qMap = new Map();
      [...allQuestions, ...deletedQuestions].forEach(q => qMap.set(q.question_id, q));

      const events: LogEvent[] = [];

      docMap.forEach(doc => {
        if (doc.created_at) {
          events.push({
            id: `doc-create-${doc.document_id}`,
            type: 'document',
            action: 'CREATE',
            title: doc.title || 'Tài liệu không tên',
            actorName: doc.created_by_name || 'Hệ thống',
            timestamp: new Date(doc.created_at),
            details: `Tải lên tài liệu mới`
          });
        }
        
        if (doc.status === 'approved' && doc.reviewed_at) {
          events.push({
            id: `doc-approve-${doc.document_id}`,
            type: 'document',
            action: 'APPROVE',
            title: doc.title || 'Tài liệu không tên',
            actorName: doc.reviewed_by_name || 'Người quản trị',
            timestamp: new Date(doc.reviewed_at),
            details: `Phê duyệt tài liệu`
          });
        }
        
        if (doc.status === 'rejected' && (doc.reviewed_at || doc.updated_at)) {
          events.push({
            id: `doc-reject-${doc.document_id}`,
            type: 'document',
            action: 'REJECT',
            title: doc.title || 'Tài liệu không tên',
            actorName: doc.reviewed_by_name || 'Người quản trị',
            timestamp: new Date(doc.reviewed_at || doc.updated_at),
            reason: doc.reject_reason,
            details: `Từ chối tài liệu`
          });
        }

        if (doc.status === 'deleted') {
          events.push({
            id: `doc-delete-${doc.document_id}`,
            type: 'document',
            action: 'DELETE',
            title: doc.title || 'Tài liệu không tên',
            actorName: doc.deleted_by_name || 'Người dùng',
            timestamp: new Date(doc.updated_at || doc.created_at),
            details: `Xóa tài liệu khỏi hệ thống`
          });
        }
      });

      qMap.forEach(q => {
        if (q.created_at) {
          events.push({
            id: `q-create-${q.question_id}`,
            type: 'question',
            action: 'CREATE',
            title: q.question || 'Câu hỏi',
            actorName: q.created_by_name || 'Hệ thống',
            timestamp: new Date(q.created_at),
            details: `Tạo câu hỏi huấn luyện mới`
          });
        }
        
        if (q.status === 'approved' && q.approved_at) {
          events.push({
            id: `q-approve-${q.question_id}`,
            type: 'question',
            action: 'APPROVE',
            title: q.question || 'Câu hỏi',
            actorName: q.approved_by_name || 'Người quản trị',
            timestamp: new Date(q.approved_at),
            details: `Phê duyệt câu hỏi`
          });
        }

        if (q.status === 'rejected') {
          events.push({
            id: `q-reject-${q.question_id}`,
            type: 'question',
            action: 'REJECT',
            title: q.question || 'Câu hỏi',
            actorName: q.approved_by_name || 'Người quản trị',
            timestamp: new Date(q.updated_at || q.created_at),
            reason: q.reject_reason,
            details: `Từ chối câu hỏi`
          });
        }

        if (q.status === 'deleted') {
          events.push({
            id: `q-delete-${q.question_id}`,
            type: 'question',
            action: 'DELETE',
            title: q.question || 'Câu hỏi',
            actorName: q.deleted_by_name || 'Người dùng',
            timestamp: new Date(q.updated_at || q.created_at),
            details: `Xóa câu hỏi khỏi hệ thống`
          });
        }
      });

      events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setLogs(events);
      setFilteredLogs(events);
    } catch (error) {
      toast.error('Không thể tải dữ liệu nhật ký');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = logs;

    if (typeFilter !== 'all') {
      result = result.filter(log => log.type === typeFilter);
    }

    if (actionFilter !== 'all') {
      result = result.filter(log => log.action === actionFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(log => 
        log.title.toLowerCase().includes(q) || 
        log.actorName.toLowerCase().includes(q)
      );
    }

    setFilteredLogs(result);
    setCurrentPage(1);
  }, [searchQuery, actionFilter, typeFilter, logs]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return <PlusCircle className="h-5 w-5 text-blue-500" />;
      case 'APPROVE': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'REJECT': return <XCircle className="h-5 w-5 text-orange-500" />;
      case 'DELETE': return <Trash2 className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'CREATE': return <span className="text-blue-600 font-medium">đã TẠO</span>;
      case 'APPROVE': return <span className="text-green-600 font-medium">đã DUYỆT</span>;
      case 'REJECT': return <span className="text-orange-600 font-medium">đã TỪ CHỐI</span>;
      case 'DELETE': return <span className="text-red-600 font-medium">đã XÓA</span>;
      default: return <span>thực hiện hành động</span>;
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'document' ? 'Tài liệu' : 'Câu hỏi';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-6 max-w-7xl mx-auto h-full min-h-0 flex flex-col overflow-hidden">
      <div className="flex items-center mb-6">
        <div className="bg-indigo-100 p-3 rounded-full mr-4">
          <Activity className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nhật Ký Hệ Thống</h1>
          <p className="text-gray-600 mt-1">
            Theo dõi lịch sử các hành động tạo, duyệt, từ chối và xóa dữ liệu tri thức
          </p>
        </div>
      </div>

      <div className="flex space-x-1 mb-6 border-b">
        <button
          onClick={() => setTypeFilter('all')}
          className={`px-4 py-2 border-b-2 text-sm font-medium transition-colors ${
            typeFilter === 'all'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Tất Cả Phân Loại
        </button>
        <button
          onClick={() => setTypeFilter('document')}
          className={`px-4 py-2 border-b-2 text-sm font-medium transition-colors ${
            typeFilter === 'document'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Tài Liệu
        </button>
        <button
          onClick={() => setTypeFilter('question')}
          className={`px-4 py-2 border-b-2 text-sm font-medium transition-colors ${
            typeFilter === 'question'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Câu Hỏi Huấn Luyện
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'Tất cả hành động' },
            { id: 'CREATE', label: 'Tạo mới' },
            { id: 'APPROVE', label: 'Phê duyệt' },
            { id: 'REJECT', label: 'Từ chối' },
            { id: 'DELETE', label: 'Xóa' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setActionFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                actionFilter === filter.id
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 ml-auto max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Tìm kiếm người thực hiện hoặc nội dung..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p>Đang tải nhật ký...</p>
          </div>
        ) : (
          <ScrollArea className="flex-1 min-h-0">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">Không tìm thấy nhật ký nào phù hợp</div>
            ) : (
              <div className="p-4 space-y-6 relative">
                <div className="absolute left-[35px] top-8 bottom-8 w-px bg-gray-200"></div>

                {paginatedLogs.map((log) => (
                  <div key={log.id} className="relative flex gap-4 pl-4">
                    <div className="relative z-10 flex-shrink-0 bg-white pt-1">
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1 border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="text-sm">
                          <span className="font-semibold text-gray-900">{log.actorName}</span>{' '}
                          {getActionLabel(log.action)}{' '}
                          {getTypeLabel(log.type)}: <span className="font-medium text-gray-800">"{log.title}"</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(log.timestamp)}
                        </div>
                      </div>
                      
                      {log.reason && (
                        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
                          <strong>Lý do:</strong> {log.reason}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        )}
      </div>

      {filteredLogs.length > 0 && (
        <div className="mt-4 flex justify-center pb-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
