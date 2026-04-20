import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/system_users/dialog';
import { Button } from '../../ui/system_users/button';
import { Input } from '../../ui/system_users/input';
import { Textarea } from '../../ui/system_users/textarea';
import { Label } from '../../ui/system_users/label';

interface AddIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (intentName: string, description: string) => Promise<void>;
}

export function AddIntentModal({ isOpen, onClose, onAdd }: AddIntentModalProps) {
  const [intentName, setIntentName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!intentName.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      await onAdd(intentName.trim(), description.trim());

      setIntentName('');
      setDescription('');
    } catch (error) {

    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setIntentName('');
      setDescription('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm Danh Mục Mới</DialogTitle>
          <DialogDescription>
            Tạo danh mục mới để phân loại câu hỏi và tài liệu
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="intent-name">
              Tên Danh Mục <span className="text-red-500">*</span>
            </Label>
            <Input
              id="intent-name"
              placeholder="Ví dụ: Tuyển sinh, Học phí, Chương trình học..."
              value={intentName}
              onChange={(e) => setIntentName(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô Tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả ngắn gọn về danh mục này..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!intentName.trim() || submitting}
            className="bg-[#EB5A0D] hover:bg-[#d64f0a]"
          >
            {submitting ? 'Đang tạo...' : 'Tạo Danh Mục'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
