export interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  author: string;
  publishedDate?: string;
  lastModified: string;
  views: number;
  viewGrowth: number;
  tags: string[];
}

export interface ChatSession {
  id: string;
  studentName: string;
  studentType: 'domestic' | 'international';
  topic: string;
  waitTime: number;
  status: 'waiting' | 'active' | 'completed';
  messages: ChatMessage[];
  startTime: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'student' | 'officer';
  content: string;
  timestamp: string;
  attachments?: string[];
}

export interface StudentInsight {
  topic: string;
  count: number;
  growth: number;
}

export interface GeographicData {
  country: string;
  visitors: number;
  percentage: number;
}
