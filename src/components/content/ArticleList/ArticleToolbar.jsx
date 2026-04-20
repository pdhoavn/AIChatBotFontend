import { useEffect, useRef } from "react";

import { ARTICLE_STATUSES } from '../../../constants/status';

export default function ArticleToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  showStatusDropdown,
  onToggleStatusDropdown,
  showCategoryDropdown,
  onToggleCategoryDropdown,
  majors,
  majorsLoading,
  onClickOutside
}) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClickOutside();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClickOutside]);

  return (
    <div ref={dropdownRef} className="bg-white border rounded-xl p-3 mb-4 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-2 border rounded-md w-full max-w-md">
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm bài viết..."
          className="outline-none text-sm w-full"
        />
      </div>
      
      <div className="relative">
        <button 
          onClick={onToggleStatusDropdown}
          className="flex items-center gap-1 px-3 py-2 border rounded-md text-sm hover:bg-gray-50"
        >
          {statusFilter}
        </button>
        {showStatusDropdown && (
          <div className="absolute top-full left-0 mt-1 w-40 bg-white border rounded-md shadow-lg z-10">
            {ARTICLE_STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => onStatusFilterChange(status)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-md last:rounded-b-md"
              >
                {status}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="relative">
        <button 
          onClick={onToggleCategoryDropdown}
          className="flex items-center gap-1 px-3 py-2 border rounded-md text-sm hover:bg-gray-50"
        >
          {categoryFilter}
        </button>
        {showCategoryDropdown && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border rounded-md shadow-lg z-10">
            <button
              onClick={() => onCategoryFilterChange("Tất Cả Ngành")}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-md"
            >
              Tất Cả Ngành
            </button>
            {majorsLoading ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                Đang tải ngành...
              </div>
            ) : (
              majors.map((major) => (
                <button
                  key={major.major_id}
                  onClick={() => onCategoryFilterChange(major.major_name)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 last:rounded-b-md"
                >
                  {major.major_name}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
