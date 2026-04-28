import { Search, Users, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/system_users/select';

interface Intent {
  intent_id: number;
  intent_name: string;
  description?: string;
}

const AUDIENCE_FILTER_OPTIONS = [
  {
    value: 'CANBO',
    label: 'Viên chức/NLĐ',
    inactive: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    active:   'bg-blue-600 text-white border-blue-600 shadow-sm',
    dot:      'bg-blue-500',
  },
  {
    value: 'SINHVIEN',
    label: 'Sinh viên',
    inactive: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
    active:   'bg-green-600 text-white border-green-600 shadow-sm',
    dot:      'bg-green-500',
  },
  {
    value: 'PHUHUYNH',
    label: 'Phụ huynh',
    inactive: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    active:   'bg-purple-600 text-white border-purple-600 shadow-sm',
    dot:      'bg-purple-500',
  },
  {
    value: 'TUYENSINH',
    label: 'Tuyển sinh',
    inactive: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
    active:   'bg-yellow-600 text-white border-yellow-600 shadow-sm',
    dot:      'bg-yellow-500',
  },
] as const;

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  audienceFilter?: string[];
  onAudienceFilterChange?: (audiences: string[]) => void;
  showAudienceFilter?: boolean;
  intents: Intent[];
  isLeader: boolean;
}

export function SearchAndFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  audienceFilter = [],
  onAudienceFilterChange,
  showAudienceFilter = false,
  intents,
  isLeader
}: SearchAndFilterProps) {
  const toggleAudience = (value: string) => {
    if (!onAudienceFilterChange) return;
    onAudienceFilterChange(
      audienceFilter.includes(value)
        ? audienceFilter.filter(v => v !== value)
        : [...audienceFilter, value]
    );
  };

  const clearAudiences = () => {
    if (onAudienceFilterChange) onAudienceFilterChange([]);
  };

  return (
    <div className="mb-4 space-y-3">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#facb01] focus:border-transparent"
          />
        </div>

        {}
        {isLeader && (
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="draft">Nháp</SelectItem>
              <SelectItem value="approved">Đã duyệt</SelectItem>
              <SelectItem value="rejected">Từ chối</SelectItem>
            </SelectContent>
          </Select>
        )}

        {}
        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Lĩnh vực" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả lĩnh vực</SelectItem>
            {intents?.map((intent) => (
              <SelectItem key={intent.intent_id} value={intent.intent_id.toString()}>
                {intent.intent_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {}
      {showAudienceFilter && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium pr-1">
            <Users className="h-4 w-4 text-gray-500" />
            <span>Đối tượng:</span>
          </div>

          {AUDIENCE_FILTER_OPTIONS.map((opt) => {
            const selected = audienceFilter.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleAudience(opt.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  selected ? opt.active : opt.inactive
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${selected ? 'bg-white' : opt.dot}`} />
                {opt.label}
              </button>
            );
          })}

          {audienceFilter.length > 0 && (
            <button
              type="button"
              onClick={clearAudiences}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors ml-1"
            >
              <X className="h-3 w-3" />
              Xóa lọc
            </button>
          )}
        </div>
      )}
    </div>
  );
}
