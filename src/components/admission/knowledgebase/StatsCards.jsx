import { BookOpen, FileText } from 'lucide-react';

export function StatsCards({ qaTemplatesCount, documentsCount }) {
  return (
    <div className="flex items-center gap-6 text-sm text-gray-600">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-blue-500" />
        <span>Mẫu Câu Hỏi: <span className="font-semibold text-gray-900">{qaTemplatesCount}</span></span>
      </div>
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-green-500" />
        <span>Tài Liệu: <span className="font-semibold text-gray-900">{documentsCount}</span></span>
      </div>
    </div>
  );
}

export default StatsCards;