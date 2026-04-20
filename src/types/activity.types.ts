export type ActivityType = 'conversation' | 'kb_update' | 'alert' | 'login' | 'system_update' | 'error';

export interface SystemActivity {
  id: string;
  type: ActivityType;
  user: string;
  action: string;
  time: string;
  status: 'active' | 'completed' | 'resolved' | 'warning' | 'error';
  metadata?: {
    ip?: string;
    location?: string;
    details?: any;
    relatedEntityId?: string;
    severity?: 'low' | 'medium' | 'high';
  };
  timestamp: string; // ISO string for actual timestamp
}

export interface ActivityFilters {
  type?: ActivityType[];
  status?: string[];
  user?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

export interface PaginatedActivities {
  items: SystemActivity[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}