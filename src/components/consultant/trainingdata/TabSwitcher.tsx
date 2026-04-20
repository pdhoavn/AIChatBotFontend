import { MessageCircle, FileText } from 'lucide-react';
import { TabType } from './types';

interface TabSwitcherProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <div className="flex gap-2 mb-6">
      <button
        onClick={() => onTabChange('questions')}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
          activeTab === 'questions'
            ? 'bg-[#EB5A0D] text-white shadow-md'
            : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        <MessageCircle className="h-5 w-5" />
        <span>Câu Hỏi Huấn Luyện</span>
      </button>

      <button
        onClick={() => onTabChange('documents')}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
          activeTab === 'documents'
            ? 'bg-[#EB5A0D] text-white shadow-md'
            : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        <FileText className="h-5 w-5" />
        <span>Tài Liệu</span>
      </button>
    </div>
  );
}
