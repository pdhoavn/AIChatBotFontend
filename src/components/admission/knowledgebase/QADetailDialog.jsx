import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/system_users/dialog';

export function QADetailDialog({ isQADialogOpen, setIsQADialogOpen, selectedQA }) {
  return (
    <Dialog open={isQADialogOpen} onOpenChange={setIsQADialogOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Chi Tiết Câu Hỏi Huấn Luyện</DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết về câu hỏi và câu trả lời huấn luyện
          </DialogDescription>
        </DialogHeader>
        {selectedQA && (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Danh Mục</div>
                <div className="font-medium">{selectedQA.category}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Câu Hỏi ID</div>
                <div className="font-medium">{selectedQA.id}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Câu Hỏi</h3>
                <p className="text-gray-700">{selectedQA.question}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Câu Trả Lời</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedQA.answer}</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default QADetailDialog;