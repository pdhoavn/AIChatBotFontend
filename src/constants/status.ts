// Article status constants for filtering
export const ARTICLE_STATUSES = [
  "Tất Cả Trạng Thái",
  "Bản Nháp",
  "Bị Từ Chối",
  "Đã Xuất Bản"
] as const;

// Type for article status filter
export type ArticleStatusFilter = typeof ARTICLE_STATUSES[number];