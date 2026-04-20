export interface QATemplate {
  id: string;
  title: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  confidence_score?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  metadata?: {
    source_documents?: string[];
    response_type?: 'factual' | 'procedural' | 'conversational';
    usage_count?: number;
  };
}

export type TemplateCreate = Omit<QATemplate, 'id' | 'created_at' | 'updated_at'>;
export type TemplateUpdate = Partial<TemplateCreate>;

export interface TemplateSearchParams {
  query?: string;
  category?: string;
  tags?: string[];
  sortBy?: 'title' | 'created_at' | 'category' | 'confidence_score';
  sortDirection?: 'asc' | 'desc';
}