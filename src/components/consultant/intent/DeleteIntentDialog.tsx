import { AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/system_users/dialog';
import { Button } from '../../ui/system_users/button';
import { Intent } from '../../../utils/fastapi-client';

interface DeleteIntentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  intent: Intent | null;
  onDelete: () => Promise<void>;
}

export function DeleteIntentDialog({ isOpen, onClose, intent, onDelete }: DeleteIntentDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle>Xác Nhận Xóa Danh Mục</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Bạn có chắc chắn muốn xóa danh mục này không? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        {intent && (
          <div className="bg-gray-50 rounded-lg p-4 my-2">
            <div className="font-medium text-gray-900">{intent.intent_name}</div>
            {intent.description && (
              <div className="text-sm text-gray-600 mt-1">{intent.description}</div>
            )}
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 my-2">
          <p className="text-sm text-yellow-800">
            <strong>Lưu ý:</strong> Việc xóa danh mục có thể ảnh hưởng đến các câu hỏi và tài liệu đã liên kết với danh mục này.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
          >
            Xóa Danh Mục
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
