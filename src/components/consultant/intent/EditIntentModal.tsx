import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/system_users/dialog';
import { Button } from '../../ui/system_users/button';
import { Input } from '../../ui/system_users/input';
import { Textarea } from '../../ui/system_users/textarea';
import { Label } from '../../ui/system_users/label';
import { Intent } from '../../../utils/fastapi-client';

interface EditIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  intent: Intent | null;
  onEdit: (intentName: string, description: string) => Promise<void>;
}

export function EditIntentModal({ isOpen, onClose, intent, onEdit }: EditIntentModalProps) {
  const [intentName, setIntentName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (intent) {
      setIntentName(intent.intent_name);
      setDescription(intent.description || '');
    }
  }, [intent]);

  const handleSubmit = async () => {
    if (!intentName.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      await onEdit(intentName.trim(), description.trim());
    } catch (error) {

    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chỉnh Sửa Danh Mục</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin danh mục
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-intent-name">
              Tên Danh Mục <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-intent-name"
              placeholder="Ví dụ: Tuyển sinh, Học phí, Chương trình học..."
              value={intentName}
              onChange={(e) => setIntentName(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Mô Tả</Label>
            <Textarea
              id="edit-description"
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
            {submitting ? 'Đang cập nhật...' : 'Cập Nhật'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
