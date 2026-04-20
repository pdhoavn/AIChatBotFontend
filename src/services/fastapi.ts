import {
  fastAPIClient,
  Article,
  User,
  Major,
  Specialization,
  ChatMessage,
  ChatRequest,
  KnowledgeDocument,
  TrainingQuestion,
  Intent,
} from '../utils/fastapi-client';
import { Template, TemplateCreate, TemplateUpdate } from '../types/template.types';
import { ReviewArticle, ArticleStatusUpdate } from '../types/review.types';
import { API_CONFIG } from '../config/api.js';

import { LoginResponse } from '../utils/fastapi-client';

// Analytics types
export interface KnowledgeGap {
  id: number;
  question: string;
  frequency: number;
  intent_id: number | null;
  intent_name: string;
  suggestedAction: string;
  last_asked?: string;
  first_asked?: string;
  question_span_days?: number;
  match_score?: number;
  in_grace_period?: boolean;
}

export interface LowSatisfactionAnswer {
  id: number;
  question: string;
  currentSatisfaction: number;
  targetSatisfaction: number;
  feedback: string;
  suggestion: string;
  usage_count?: number;
  success_rate?: number;
}

export interface TrendingTopic {
  id: number;
  topic: string;
  growthRate: number;
  questionsCount: number;
  description: string;
  action: string;
  timeframe?: string;
}

export interface AnalyticsSummary {
  knowledge_gaps_count: number;
  low_satisfaction_count: number;
  trending_topics_count: number;
  total_interactions: number;
  existing_qa_count: number;
  user_questions_count: number;
}

export interface CategoryStatistic {
  category: string;
  total_questions: number;
  total_times_asked: number;
}

// RIASEC types
export interface RiasecResult {
  result_id: number;
  customer_id?: number;
  score_realistic: number;
  score_investigative: number;
  score_artistic: number;
  score_social: number;
  score_enterprising: number;
  score_conventional: number;
  result: string;
}

// Articles API
export const articlesAPI = {
  getAll: () => fastAPIClient.get<Article[]>('/articles'),
  getById: (id: number) => fastAPIClient.get<Article>(`/articles/${id}`),
  getByUserId: (userId: number) => fastAPIClient.get<Article[]>(`/articles/users/${userId}`),
  create: (formData: FormData) => {
    const token = localStorage.getItem("access_token");
    const headers: HeadersInit = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const url = `${API_CONFIG.FASTAPI_BASE_URL}/articles`;

    return fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    }).then(async (response) => {
      if (!response.ok) {
        let message = `HTTP error! status: ${response.status}`;
        try {
          const err = await response.json();
          if (err.detail) message = err.detail;
        } catch (_) {}
        throw new Error(message);
      }
      return response.json() as Promise<Article>;
    });
  },
  update: (id: number, data: Partial<Article> | FormData) => {
    const token = localStorage.getItem("access_token");
    const headers: HeadersInit = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // If data is already FormData, use it directly
    // Otherwise, convert plain object to FormData
    let formData: FormData;
    if (data instanceof FormData) {
      formData = data;
    } else {
      formData = new FormData();
      // Only append non-null/non-undefined values
      if (data.title !== undefined) formData.append('title', data.title);
      if (data.description !== undefined) formData.append('description', data.description);
      if (data.url !== undefined) formData.append('url', data.url || '');
      if (data.note !== undefined) formData.append('note', data.note || '');
      if (data.major_id !== undefined && data.major_id > 0) formData.append('major_id', data.major_id.toString());
      if (data.specialization_id !== undefined && data.specialization_id > 0) formData.append('specialization_id', data.specialization_id.toString());
      // Note: image file would need to be handled separately if provided
    }

    const url = `${API_CONFIG.FASTAPI_BASE_URL}/articles/${id}`;

    return fetch(url, {
      method: 'PUT',
      headers,
      body: formData,
    }).then(async (response) => {
      if (!response.ok) {
        let message = `HTTP error! status: ${response.status}`;
        try {
          const err = await response.json();
          if (err.detail) message = err.detail;
        } catch (_) {}
        throw new Error(message);
      }
      return response.json() as Promise<Article>;
    });
  },
  delete: (id: number) => fastAPIClient.delete(`/articles/${id}`),
  
  // Review APIs for Content Manager Leaders
  getReviewQueue: () => fastAPIClient.get<ReviewArticle[]>('/articles/review'),
  updateStatus: (articleId: number, data: ArticleStatusUpdate) => 
    fastAPIClient.put<ReviewArticle>(`/articles/${articleId}/status`, data),
};

// Users API
export const usersAPI = {
  getAll: () => fastAPIClient.get<User[]>('/users'),
  getById: (id: number) => fastAPIClient.get<User>(`/users/${id}`),
  create: (data: Partial<User>) => fastAPIClient.post<User>('/users', data),
  update: (id: number, data: Partial<User>) => fastAPIClient.put<User>(`/users/${id}`, data),
  delete: (id: number) => fastAPIClient.delete(`/users/${id}`),
};

// Permissions API
export interface Permission {
  permission_id: number;
  permission_name: string;
  description?: string;
}

export const permissionsAPI = {
  getAll: () => fastAPIClient.get<Permission[]>('/users/permissions'),
};

export interface Role {
  role_id: number;
  role_name: string;
}

export const rolesAPI = {
  getAll: () => fastAPIClient.get<Role[]>('/users/roles'),
};

// Authentication API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    fastAPIClient.post<LoginResponse>('/auth/login', credentials),
  register: (userData: { username: string; email: string; password: string; full_name: string }) =>
    fastAPIClient.post('/auth/register', userData),
  logout: () => fastAPIClient.post('/auth/logout', {}),
  refreshToken: () => fastAPIClient.post('/auth/refresh', {}),
};

// Profile API
export const profileAPI = {
  getProfile: () => fastAPIClient.get('/profile'),
  getUserById: (userId: number) => fastAPIClient.get(`/profile/${userId}`),
  updateProfile: (data: any) => fastAPIClient.put('/profile', data),
};

// Majors API
export const majorsAPI = {
  getAll: () => fastAPIClient.get<Major[]>('/majors'),
  getById: (id: number) => fastAPIClient.get<Major>(`/majors/${id}`),
  create: (data: Partial<Major>) => fastAPIClient.post<Major>('/majors', data),
  update: (id: number, data: Partial<Major>) => fastAPIClient.put<Major>(`/majors/${id}`, data),
  delete: (id: number) => fastAPIClient.delete(`/majors/${id}`),
};

// Specializations API
export const specializationsAPI = {
  getAll: () => fastAPIClient.get<Specialization[]>('/specializations'),
  getById: (id: number) => fastAPIClient.get<Specialization>(`/specializations/${id}`),
  getByMajor: (majorId: number) => fastAPIClient.get<Specialization[]>(`/specializations/major/${majorId}`),
  create: (data: Partial<Specialization>) => fastAPIClient.post<Specialization>('/specializations', data),
  update: (id: number, data: Partial<Specialization>) => fastAPIClient.put<Specialization>(`/specializations/${id}`, data),
  delete: (id: number) => fastAPIClient.delete(`/specializations/${id}`),
};

// Chat API
export const chatAPI = {
  sendMessage: (data: ChatRequest) => fastAPIClient.post<ChatMessage>('/chat', data),
  getHistory: () => fastAPIClient.get<ChatMessage[]>('/chat/history'),
  clearHistory: () => fastAPIClient.delete('/chat/history'),
};

// Knowledge Base API
export const knowledgeAPI = {
  uploadDocument: (formData: FormData, intendId: number) => {
    // For file uploads, we need to handle FormData differently
    const token = localStorage.getItem("access_token");
    const headers: HeadersInit = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Add intend_id as query parameter (backend expects intend_id, not intent_id)
    const url = `${API_CONFIG.FASTAPI_BASE_URL}/knowledge/upload/document?intend_id=${intendId}`;

    return fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
  },

  uploadTrainingQuestion: (data: { question: string; answer: string; intent_id: number }) =>
    fastAPIClient.post<TrainingQuestion>('/knowledge/upload/training_question', data),

  // Get documents with optional status filter
  getDocuments: (status?: string) => {
    const params = status ? `?status=${status}` : '';
    return fastAPIClient.get<KnowledgeDocument[]>(`/knowledge/documents${params}`);
  },
  getDocumentById: (id: number) => fastAPIClient.get<KnowledgeDocument>(`/knowledge/documents/${id}`),
  
  // Get training questions with optional status filter
  getTrainingQuestions: (status?: string) => {
    const params = status ? `?status=${status}` : '';
    return fastAPIClient.get<TrainingQuestion[]>(`/knowledge/training_questions${params}`);
  },

  // Soft delete (sets status to 'deleted')
  deleteDocument: (id: number) => fastAPIClient.delete(`/knowledge/documents/${id}`),
  deleteTrainingQuestion: (id: number) => fastAPIClient.delete(`/knowledge/training_questions/${id}`),

  // Review workflow for documents
  getPendingDocuments: () => fastAPIClient.get<KnowledgeDocument[]>('/knowledge/documents/pending-review'),
  submitDocumentForReview: (id: number) => fastAPIClient.post(`/knowledge/documents/${id}/submit-review`, {}),
  approveDocument: (id: number) => fastAPIClient.post(`/knowledge/documents/${id}/approve`, {}),
  rejectDocument: (id: number, reason: string) => {
    const formData = new FormData();
    formData.append('reason', reason);
    
    const token = localStorage.getItem("access_token");
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return fetch(`${API_CONFIG.FASTAPI_BASE_URL}/knowledge/documents/${id}/reject`, {
      method: 'POST',
      headers,
      body: formData,
    }).then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.detail || `HTTP error! status: ${response.status}`);
        });
      }
      return response.json();
    });
  },

  // Review workflow for training questions
  getPendingTrainingQuestions: () => fastAPIClient.get<TrainingQuestion[]>('/knowledge/training_questions/pending-review'),
  submitTrainingQuestionForReview: (id: number) => fastAPIClient.post(`/knowledge/training_questions/${id}/submit-review`, {}),
  approveTrainingQuestion: (id: number) => fastAPIClient.post(`/knowledge/training_questions/${id}/approve`, {}),
  rejectTrainingQuestion: (id: number, reason: string) => {
    const formData = new FormData();
    formData.append('reason', reason);
    
    const token = localStorage.getItem("access_token");
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return fetch(`${API_CONFIG.FASTAPI_BASE_URL}/knowledge/training_questions/${id}/reject`, {
      method: 'POST',
      headers,
      body: formData,
    }).then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.detail || `HTTP error! status: ${response.status}`);
        });
      }
      return response.json();
    });
  },
  
  downloadDocument: async (id: number) => {
    const token = localStorage.getItem("access_token");
    const url = `${API_CONFIG.FASTAPI_BASE_URL}/knowledge/documents/${id}/download`;
    
    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    
    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch (e) {
        // If response is not JSON, use default message
      }
      throw new Error(errorMessage);
    }
    
    return response.blob();
  },
};

// RIASEC API (if needed)
export const riasecAPI = {
  // Add RIASEC-related endpoints when they are implemented in the backend
  getTest: () => fastAPIClient.get('/riasec/test'),
  submitAnswers: (answers: any) => fastAPIClient.post('/riasec/submit', answers),
  getResults: (id: number) => fastAPIClient.get(`/riasec/results/${id}`),
  getUserResults: (userId: number) => fastAPIClient.get<RiasecResult[]>(`/riasec/users/${userId}/riasec/results`),
};

// Content Analytics types
export interface ContentStatistics {
  overview: {
    total_articles: number;
    published_articles: number;
    draft_articles: number;
    review_articles: number;
    my_articles: number;
  };
  recent_articles: Array<{
    article_id: number;
    title: string;
    author: string;
    status: string;
    created_at: string;
    major_id?: number;
    specialization_id?: number;
  }>;
  popular_articles: Array<{
    article_id: number;
    title: string;
    author: string;
    created_at: string;
    view_count: number;
    url?: string;
  }>;
  articles_by_major: Array<{
    major_name: string;
    article_count: number;
  }>;
  monthly_trends: Array<{
    month: string;
    total_articles: number;
    published_articles: number;
  }>;
  status_distribution: Record<string, number>;
  generated_at: string;
}

// Content Analytics API
export const contentAnalyticsAPI = {
  getStatistics: () =>
    fastAPIClient.get<{ success: boolean; data: ContentStatistics }>('/analytics/content-statistics'),
  getMyArticlesStatistics: () =>
    fastAPIClient.get<{ success: boolean; data: any }>('/analytics/category-statistics')
};

// Consultant Analytics types
export interface ConsultantStatistics {
  overview_stats: {
    total_queries: number;
    queries_growth: number;
    accuracy_rate: number;
    accuracy_improvement: number;
    most_active_time: string;
    unanswered_queries: number;
  };
  questions_over_time: Array<{
    date: string;
    queries: number;
  }>;
  question_categories: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  last_updated: string;
}

export interface UnansweredQuestion {
  id: number;
  question: string;
  frequency: number;
  priority: 'high' | 'medium' | 'low';
  category: string;
  suggestedAction: string;
  last_asked: string;
  first_asked: string;
  question_span_days: number;
  match_score: number;
  in_grace_period: boolean;
}

export interface RecentQuestion {
  id: number;
  question: string;
  timestamp: string;
  user_name: string;
  rating?: number;
}

export interface UserQuestion {
  id: number;
  question: string;
  category: string;
  timestamp: string;
  status: 'answered' | 'unanswered';
}

export interface UnansweredQuestion {
  session_id: string;
  question_id: number;
  question_text: string;
  bot_response: string;
  timestamp: string;
  fail_reason: string;
}

export interface PaginatedResponse<T> {
  status: string;
  data: T[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  message: string;
}

export interface IntentAskedStatistic {
  intent_id: number;
  intent_name: string;
  description?: string;
  question_count: number;
}

// Consultant Analytics API
export const consultantAnalyticsAPI = {
  getStatistics: () =>
    fastAPIClient.get<{ status: string; data: ConsultantStatistics; message: string }>('/analytics/consultant-statistics'),
  getUnansweredQuestions: (limit?: number) =>
    fastAPIClient.get<{ total_failed: number; data: UnansweredQuestion[] }>(
      `/analytics/unanswered-questions?limit=${limit || 100}`
    ),
  getRecentQuestions: (limit: number = 5) =>
    fastAPIClient.get<{ status: string; data: RecentQuestion[]; message: string }>(`/analytics/recent-questions?limit=${limit}`),
  getKnowledgeGaps: (days?: number, minFrequency?: number) =>
    fastAPIClient.get<{ status: string; data: KnowledgeGap[]; message: string }>(`/analytics/knowledge-gaps?days=${days || 30}&min_frequency=${minFrequency || 3}`),
  getLowSatisfactionAnswers: (threshold?: number, minUsage?: number) =>
    fastAPIClient.get<{ status: string; data: LowSatisfactionAnswer[]; message: string }>(`/analytics/low-satisfaction-answers?threshold=${threshold || 3.5}&min_usage=${minUsage || 5}`),
  getTrendingTopics: (days?: number, minQuestions?: number) =>
    fastAPIClient.get<{ status: string; data: TrendingTopic[]; message: string }>(`/analytics/trending-topics?days=${days || 14}&min_questions=${minQuestions || 5}`),
  getCategoryStatistics: (days?: number) =>
    fastAPIClient.get<{ status: string; data: CategoryStatistic[]; message: string }>(`/analytics/category-statistics?days=${days || 30}`),
  getUserQuestions: (days?: number, page?: number, pageSize?: number, search?: string) =>
    fastAPIClient.get<PaginatedResponse<UserQuestion>>(
      `/analytics/user-questions?days=${days || 30}&page=${page || 1}&page_size=${pageSize || 10}${search ? `&search=${encodeURIComponent(search)}` : ''}`
    ),
  getIntentAskedStatistics: () =>
    fastAPIClient.get<{ status: string; data: IntentAskedStatistic[]; message: string }>('/analytics/intent-asked-statistics')
};

// Dashboard Analytics API
export const dashboardAnalyticsAPI = {
  getMetrics: (days: number = 7) =>
    fastAPIClient.get(`/analytics/dashboard/metrics?days=${days}`),
  getChatbotRequests: (days: number = 30) =>
    fastAPIClient.get(`/analytics/dashboard/chatbot-requests?days=${days}`),
  getSystemHealth: () =>
    fastAPIClient.get('/analytics/dashboard/system-health'),
  getAdmissionStats: (days: number = 30) =>
    fastAPIClient.get(`/analytics/dashboard/admission-stats?days=${days}`)
};

// Live Chat types
export interface LiveChatQueueItem {
  id: number;
  customer_id: number;
  admission_official_id: number;
  status: 'waiting' | 'accepted' | 'rejected';
  created_at: string;
  customer: {
    full_name: string;
    email: string;
    phone_number: string;
  };
}

export interface ChatSessionMessage {
  id: number;
  session_id: number;
  sender_id: number;
  message_text: string;
  timestamp: string;
  is_from_bot: boolean;
}

export interface ChatSession {
  chat_session_id: number;
  session_type: string;
  start_time: string;
  end_time?: string;
}

export interface ActiveChatSession {
  session_id: number;
  customer_id: number;
  customer_name: string;
  session_type: string;
  start_time: string;
  status: 'active';
}

// Live Chat API functions
export const liveChatAPI = {
  // Customer joins queue
  joinQueue: (customerId: number, officialId?: number) => {
    const params: any = { customer_id: customerId };
    if (officialId !== undefined && officialId !== null) {
      params.official_id = officialId;
    }
    const queryString = new URLSearchParams(params).toString();
    return fastAPIClient.post(`/live_chat/livechat/live-chat/join_queue?${queryString}`, {});
  },

  // Customer cancels queue request
  cancelQueueRequest: (customerId: number) =>
    fastAPIClient.post(`/live_chat/livechat/customer/cancel_queue?customer_id=${customerId}`, {}),

  // Get queue list for admission official
  getQueueList: (officialId: number) =>
    fastAPIClient.get<LiveChatQueueItem[]>(`/live_chat/livechat/admission_official/queue/list/${officialId}`),

  // Get active sessions for admission official
  getActiveSessions: (officialId: number) =>
    fastAPIClient.get<ActiveChatSession[]>(`/live_chat/livechat/admission_official/active_sessions/${officialId}`),

  // Accept a queue request
  acceptRequest: (officialId: number, queueId: number) =>
    fastAPIClient.post<ChatSession>(`/live_chat/livechat/admission_official/accept?official_id=${officialId}&queue_id=${queueId}`, {}),

  // Reject a queue request
  rejectRequest: (officialId: number, queueId: number, reason: string) =>
    fastAPIClient.post(`/live_chat/livechat/admission_official/reject?official_id=${officialId}&queue_id=${queueId}&reason=${encodeURIComponent(reason)}`, {}),

  // Get messages for a session
  getSessionMessages: (sessionId: number) =>
    fastAPIClient.get<ChatSessionMessage[]>(`/live_chat/livechat/session/${sessionId}/messages`),

  // End session
  endSession: (sessionId: number, endedBy: number) =>
    fastAPIClient.post(`/live_chat/livechat/live-chat/end?session_id=${sessionId}&ended_by=${endedBy}`, {})
};

// Intent API functions
export const intentAPI = {
  // Get all intents
  getIntents: () => fastAPIClient.get<Intent[]>('/intent'),

  // Get specific intent
  getIntent: (intentId: number) => fastAPIClient.get<Intent>(`/intent/${intentId}`),

  // Create new intent
  createIntent: (data: { intent_name: string; description?: string }) =>
    fastAPIClient.post<Intent>('/intent', data),

  // Update intent
  updateIntent: (intentId: number, data: { intent_name: string; description?: string }) =>
    fastAPIClient.put<Intent>(`/intent/${intentId}`, data),

  // Delete intent
  deleteIntent: (intentId: number) =>
    fastAPIClient.delete(`/intent/${intentId}`)
};

// Academic Scores API types
export interface AcademicScore {
  score_id: number;
  customer_id: number;
  math: number;
  literature: number;
  english: number;
  physics: number;
  chemistry: number;
  biology: number;
  history: number;
  geography: number;
}

// Academic Scores API functions
export const academicScoresAPI = {
  // Get academic scores for a specific user
  getUserAcademicScores: (userId: number) => 
    fastAPIClient.get<AcademicScore>(`/academic-score/users/${userId}/academic-scores`),
};

// Template API functions
export const templateAPI = {
  // Get all templates
  getTemplates: () => fastAPIClient.get<Template[]>('/template'),

  // Get specific template
  getTemplate: (templateId: number) => fastAPIClient.get<Template>(`/template/${templateId}`),

  // Create new template
  createTemplate: (data: TemplateCreate) => fastAPIClient.post<Template>('/template', data),

  // Update existing template
  updateTemplate: (templateId: number, data: TemplateUpdate) => 
    fastAPIClient.put<Template>(`/template/${templateId}`, data),

  // Delete templates (soft delete)
  deleteTemplates: (templateIds: number[]) => 
    fastAPIClient.delete('/template', { template_ids: templateIds })
};


// Export all APIs
export {
  articlesAPI as fastAPIArticles,
  usersAPI as fastAPIUsers,
  authAPI as fastAPIAuth,
  profileAPI as fastAPIProfile,
  majorsAPI as fastAPIMajors,
  specializationsAPI as fastAPISpecializations,
  chatAPI as fastAPIChat,
  knowledgeAPI as fastAPIKnowledge,
  riasecAPI as fastAPIRiasec,
  contentAnalyticsAPI as fastAPIContentAnalytics,
  liveChatAPI as fastAPILiveChat,
  intentAPI as fastAPIIntent,
  templateAPI as fastAPITemplate,
};