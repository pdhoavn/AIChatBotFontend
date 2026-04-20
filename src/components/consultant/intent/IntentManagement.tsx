import { useState, useEffect } from 'react';
import { Search, Plus, Tag } from 'lucide-react';
import { ScrollArea } from '../../ui/system_users/scroll-area';
import { Input } from '../../ui/system_users/input';
import { Button } from '../../ui/system_users/button';
import { useAuth } from '../../../contexts/Auth';
import { intentAPI } from '../../../services/fastapi';
import { Intent } from '../../../utils/fastapi-client';
import { toast } from 'react-toastify';
import { IntentList } from './IntentList';
import { AddIntentModal } from './AddIntentModal';
import { EditIntentModal } from './EditIntentModal';
import { DeleteIntentDialog } from './DeleteIntentDialog';
import { Pagination } from '../../common/Pagination';

type FilterType = 'all' | 'active';

export function IntentManagement() {
  const { hasPermission, user, isConsultantLeader } = useAuth();
  const [intents, setIntents] = useState<Intent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'deleted'>('all');
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const isLeader = isConsultantLeader();

  useEffect(() => {
    fetchIntents();
  }, []);

  const fetchIntents = async () => {
    setLoading(true);
    try {
      const response = await intentAPI.getIntents();
      const intentList = Array.isArray(response) ? response : [];

      const filteredList = intentList.filter(intent => intent.intent_id !== 0);
      setIntents(filteredList);
    } catch (error) {
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIntent = async (intentName: string, description: string) => {
    try {
      await intentAPI.createIntent({ intent_name: intentName, description });
      toast.success('Tạo danh mục thành công');
      await fetchIntents();
      setShowAddDialog(false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Không thể tạo danh mục');
      throw error;
    }
  };

  const handleEditIntent = async (intentName: string, description: string) => {
    if (!selectedIntent) return;
    
    const wasDeleted = selectedIntent.is_deleted === true;
    
    try {
      await intentAPI.updateIntent(selectedIntent.intent_id, { 
        intent_name: intentName, 
        description 
      });
      
      if (wasDeleted) {
        toast.success('Cập nhật danh mục thành công và khôi phục thành công');
      } else {
        toast.success('Cập nhật danh mục thành công');
      }
      
      await fetchIntents();
      setShowEditDialog(false);
      setSelectedIntent(null);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Không thể cập nhật danh mục');
      throw error;
    }
  };

  const handleDeleteIntent = async () => {
    if (!selectedIntent) return;
    
    try {
      await intentAPI.deleteIntent(selectedIntent.intent_id);
      toast.success('Xóa danh mục thành công');
      await fetchIntents();
      setShowDeleteDialog(false);
      setSelectedIntent(null);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Không thể xóa danh mục');
    }
  };

  const openEditDialog = (intent: Intent) => {
    setSelectedIntent(intent);
    setShowEditDialog(true);
  };

  const openDeleteDialog = (intent: Intent) => {
    setSelectedIntent(intent);
    setShowDeleteDialog(true);
  };

  const filteredIntents = intents.filter(intent => {
    const matchesSearch = intent.intent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (intent.description && intent.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesFilter = true;
    if (filterType === 'active') {
      matchesFilter = !intent.is_deleted;
    } else if (filterType === 'deleted') {
      matchesFilter = intent.is_deleted === true;
    }

    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredIntents.length / ITEMS_PER_PAGE);
  const paginatedIntents = filteredIntents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản Lý Danh Mục</h1>
          </div>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-[#EB5A0D] hover:bg-[#d64f0a]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm Danh Mục
          </Button>
        </div>

        {}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm danh mục theo tên hoặc mô tả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {}
          <div className="flex gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
              className={filterType === 'all' ? 'bg-[#EB5A0D] hover:bg-[#d64f0a]' : ''}
            >
              Tất Cả
            </Button>
            <Button
              variant={filterType === 'active' ? 'default' : 'outline'}
              onClick={() => setFilterType('active')}
              className={filterType === 'active' ? 'bg-[#EB5A0D] hover:bg-[#d64f0a]' : ''}
            >
              Đang Sử Dụng
            </Button>
            <Button
              variant={filterType === 'deleted' ? 'default' : 'outline'}
              onClick={() => setFilterType('deleted')}
              className={filterType === 'deleted' ? 'bg-[#EB5A0D] hover:bg-[#d64f0a]' : ''}
            >
              Vô Hiệu Hóa
            </Button>
          </div>
        </div>

        {}
        <div className="mt-4 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              Tổng số: <span className="font-semibold text-gray-900">{intents.length}</span>
            </span>
          </div>
          {searchQuery && (
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                Kết quả tìm kiếm: <span className="font-semibold text-gray-900">{filteredIntents.length}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#EB5A0D]"></div>
                  <p className="mt-2 text-sm text-gray-500">Đang tải danh mục...</p>
                </div>
              </div>
            ) : filteredIntents.length === 0 ? (
              <div className="text-center py-12">
                <Tag className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'Không tìm thấy danh mục' : 'Chưa có danh mục nào'}
                </h3>
                <p className="text-gray-500">
                  {searchQuery 
                    ? 'Thử tìm kiếm với từ khóa khác' 
                    : 'Bắt đầu bằng cách tạo danh mục đầu tiên'}
                </p>
              </div>
            ) : (
              <>
                <IntentList
                  intents={paginatedIntents}
                  onEdit={openEditDialog}
                  onDelete={openDeleteDialog}
                  onClick={openEditDialog}
                  isLeader={isLeader}
                />
                {filteredIntents.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {}
      <AddIntentModal
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddIntent}
      />

      <EditIntentModal
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedIntent(null);
        }}
        intent={selectedIntent}
        onEdit={handleEditIntent}
      />

      <DeleteIntentDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedIntent(null);
        }}
        intent={selectedIntent}
        onDelete={handleDeleteIntent}
      />
    </div>
  );
}
