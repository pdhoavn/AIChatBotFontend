// Template types - matching backend schema exactly
export interface TemplateQA {
  question: string;
  answer: string;
  order_position: number;
  qa_id?: number;
  template_id?: number;
}

export interface Template {
  template_name: string;
  description?: string;
  template_id?: number;
  is_active?: boolean;
  created_by?: number;
  qa_pairs: TemplateQA[];
}

// Template creation and update types
export interface TemplateCreate {
  template_name: string;
  description?: string;
  qa_pairs: Omit<TemplateQA, 'qa_id' | 'template_id'>[];
}

export interface TemplateUpdate {
  template_name?: string;
  description?: string;
  qa_pairs?: Omit<TemplateQA, 'qa_id' | 'template_id'>[];
}

