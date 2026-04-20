import { useState } from 'react';
import { 
  Plus, 
  Search,
  Save,
  Trash2,
  History,
  ChevronRight,
  Calendar,
  Tag,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/system_users/card';
import { Input } from '../ui/system_users/input';
import { Button } from '../ui/system_users/button';
import { ScrollArea } from '../ui/system_users/scroll-area';
import { Badge } from '../ui/system_users/badge';
import { Textarea } from '../ui/system_users/textarea';
import { Label } from '../ui/system_users/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/system_users/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/system_users/dialog';

interface QAPair {
  id: number;
  question: string;
  answer: string;
  category: string;
  lastUpdated: string;
  source?: string;
  relatedQuestions?: number[];
}

const qaPairs: QAPair[] = [];

const categories = [
  'Tất Cả Danh Mục',
];

export function KnowledgeBaseManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất Cả Danh Mục');
  const [selectedQA, setSelectedQA] = useState<QAPair | null>(qaPairs[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState('');
  const [editedAnswer, setEditedAnswer] = useState('');
  const [editedCategory, setEditedCategory] = useState('');

  const filteredQAPairs = qaPairs.filter(qa => {
    const matchesSearch = qa.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         qa.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tất Cả Danh Mục' || qa.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = () => {
    if (selectedQA) {
      setEditedQuestion(selectedQA.question);
      setEditedAnswer(selectedQA.answer);
      setEditedCategory(selectedQA.category);
      setIsEditing(true);
    }
  };

  const handleSave = () => {

    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="h-full flex bg-[#F8FAFC]">
      {}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {}
        <div className="p-4 border-b border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2>Cơ Sở Tri Thức</h2>
            <Button size="sm" className="bg-[#EB5A0D] hover:bg-[#d14f0a]">
              <Plus className="h-4 w-4 mr-1" />
              Thêm Mới
            </Button>
          </div>
          
          {}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm cặp hỏi-đáp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="text-sm text-muted-foreground">
            {filteredQAPairs.length} cặp hỏi-đáp
          </div>
        </div>

        {}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredQAPairs.map(qa => (
              <button
                key={qa.id}
                onClick={() => setSelectedQA(qa)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedQA?.id === qa.id
                    ? 'bg-[#3B82F6] text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-sm mb-1">
                      {qa.question}
                    </div>
                    <Badge 
                      variant={selectedQA?.id === qa.id ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {qa.category}
                    </Badge>
                  </div>
                  <ChevronRight className={`h-4 w-4 flex-shrink-0 ${
                    selectedQA?.id === qa.id ? 'text-white' : 'text-muted-foreground'
                  }`} />
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {}
      <div className="flex-1 flex flex-col">
        {selectedQA ? (
          <ScrollArea className="flex-1">
            <div className="p-6 pb-8 max-w-4xl">
              {}
              <div className="flex items-center justify-between mb-6">
                <h1>Chi Tiết Hỏi-Đáp</h1>
                {!isEditing ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <History className="h-4 w-4" />
                      Lịch Sử Phiên Bản
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEdit}
                    >
                      Chỉnh Sửa Hỏi-Đáp
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                    >Hủy</Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      className="bg-[#3B82F6] hover:bg-[#2563EB]"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Lưu Thay Đổi
                    </Button>
                  </div>
                )}
              </div>

              {}
              <div className="space-y-6">
                {}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Câu Hỏi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Textarea
                        value={editedQuestion}
                        onChange={(e) => setEditedQuestion(e.target.value)}
                        rows={2}
                        className="resize-none"
                      />
                    ) : (
                      <p>{selectedQA.question}</p>
                    )}
                  </CardContent>
                </Card>

                {}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Câu Trả Lời</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Textarea
                        value={editedAnswer}
                        onChange={(e) => setEditedAnswer(e.target.value)}
                        rows={6}
                        className="resize-none"
                      />
                    ) : (
                      <p className="leading-relaxed">{selectedQA.answer}</p>
                    )}
                  </CardContent>
                </Card>

                {}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Siêu Dữ Liệu</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Tag className="h-4 w-4" />
                        Danh Mục
                      </Label>
                      {isEditing ? (
                        <Select value={editedCategory} onValueChange={setEditedCategory}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.filter(c => c !== 'Tất Cả Danh Mục').map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline">{selectedQA.category}</Badge>
                      )}
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4" />
                        Cập Nhật Lần Cuối
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedQA.lastUpdated).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    {selectedQA.source && (
                      <div>
                        <Label className="mb-2 block">Nguồn</Label>
                        <p className="text-sm text-muted-foreground">{selectedQA.source}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {}
                {selectedQA.relatedQuestions && selectedQA.relatedQuestions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Câu Hỏi Liên Quan</CardTitle>
                      <CardDescription>
                        Các cặp hỏi-đáp khác thường được hỏi cùng nhau
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedQA.relatedQuestions.map(relatedId => {
                          const related = qaPairs.find(q => q.id === relatedId);
                          return related ? (
                            <button
                              key={related.id}
                              onClick={() => setSelectedQA(related)}
                              className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm">{related.question}</span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </button>
                          ) : null;
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Chọn một cặp hỏi-đáp từ danh sách để xem chi tiết</p>
            </div>
          </div>
        )}
      </div>

      {}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa Cặp Hỏi-Đáp</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa cặp hỏi-đáp này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Hủy</Button>
            <Button 
              variant="destructive"
              onClick={() => {

                setShowDeleteDialog(false);
              }}
            >Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
