// Review-related types for article management
export interface ArticleStatusUpdate {
  status: string; // "published", "rejected", "cancelled"
  note?: string;
}

export interface ReviewArticle {
  article_id: number;
  title: string;
  description: string;
  url?: string;
  status: string;
  create_at: string;
  created_by: number;
  major_id?: number;
  specialization_id?: number;
  author_name?: string;
  major_name?: string;
  specialization_name?: string;
  note?: string;
}