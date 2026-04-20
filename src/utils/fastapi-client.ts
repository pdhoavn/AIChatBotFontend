// FastAPI client configuration and utilities
import { API_CONFIG } from '../config/api.js';

const FASTAPI_BASE_URL = API_CONFIG.FASTAPI_BASE_URL;

// Custom error class for authentication errors
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// Flag to prevent multiple simultaneous redirects
let isRedirecting = false;

// Generic API client with error handling
class FastAPIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    //Add Bearer token 
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }


    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized - but be smart about it
      if (response.status === 401) {
        // Check if token is actually expired before logging out
        const token = localStorage.getItem("access_token");
        let shouldLogout = true;
        
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const isExpired = payload.exp && payload.exp * 1000 < Date.now();
            
            // Only logout if token is truly expired
            // If token is valid but got 401, it's likely a permission issue, not expiration
            shouldLogout = isExpired;
            
            if (!isExpired) {
              // Token is valid, this is a permission error, not an auth error
              const errorData = await response.json().catch(() => ({ detail: 'Permission denied' }));
              throw new Error(errorData.detail || 'Permission denied');
            }
          } catch (decodeError) {
            // If we can't decode the token, it's invalid, logout
            shouldLogout = true;
          }
        }
        
        // Only logout if token is expired or invalid
        if (shouldLogout && !isRedirecting) {
          isRedirecting = true;
          localStorage.removeItem("access_token");
          localStorage.removeItem("token_type");
          
          // Small delay to ensure localStorage is cleared
          setTimeout(() => {
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }, 100);
          
          // Throw specific error type that components can check for
          throw new AuthenticationError('Your session has expired. Please log in again.');
        }
      }

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData?.detail) {
            if (Array.isArray(errorData.detail)) {
              errorMessage = errorData.detail.map((err: any) => `${err.loc?.join('.')}: ${err.msg}`).join(', ');
            } else {
              errorMessage = errorData.detail;
            }
          }
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      // If no content or empty response, return empty object
      if (contentLength === '0' || !contentType?.includes('application/json')) {
        return {} as T;
      }

      const text = await response.text();
      if (!text) {
        return {} as T;
      }

      const data = JSON.parse(text);
      return data;
    } catch (error) {
      // Re-throw authentication errors without logging
      if (error instanceof AuthenticationError) {
        throw error;
      }
      
      // Don't log error if it's an auth issue and user isn't logged in
      const isAuthError = error instanceof Error && 
        (error.message.includes('permission required') || 
         error.message.includes('Unauthorized') ||
         error.message.includes('401'));
      const hasToken = typeof window !== 'undefined' && localStorage.getItem('access_token');
      
      // Only log if it's not an auth issue, or if user should be authenticated
      // Errors are handled by caller through try/catch
      
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return await this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Create FastAPI client instance
export const fastAPIClient = new FastAPIClient(FASTAPI_BASE_URL);

// Helper function to handle API errors in components
export const handleAPIError = (error: unknown, fallbackMessage: string = 'An error occurred'): string => {
  // Don't show error message if it's an authentication error (handled by redirect)
  if (error instanceof AuthenticationError) {
    return ''; // Return empty string, component should not display error
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return fallbackMessage;
};

// Helper function to check if an error is an authentication error
export const isAuthError = (error: unknown): boolean => {
  return error instanceof AuthenticationError;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
};
// Article types
export interface Article {
  article_id: number;
  title: string;
  description: string;
  url: string;
  link_image?: string;
  note?: string;
  status: string;
  create_at: string;
  created_by: number;
  major_id: number;
  specialization_id: number;
  author_name: string;
  major_name: string;
  specialization_name: string;
}

// User types
export interface User {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

// Major types
export interface Major {
  major_id: number;
  major_name: string;
  articles?: Array<{
    article_id: number;
    title: string;
    description: string;
    url: string;
    create_at: string;
    specialization: {
      specialization_id: number;
      specialization_name: string;
    };
  }>;
  admission_forms?: any[];
}

// Specialization types
export interface Specialization {
  specialization_id: number;
  specialization_name: string;
  major_id: number;
  articles?: Array<{
    article_id: number;
    title: string;
    description: string;
    url: string;
    status: string;
    create_at: string;
    created_by: number;
    major_id: number;
    specialization_id: number;
    author_name: string | null;
    major_name: string | null;
    specialization_name: string | null;
  }>;
}

// Chat types
export interface ChatMessage {
  message_id: number;
  content: string;
  response: string;
  created_at: string;
}

export interface ChatSessionMessage {
  interaction_id: number;
  session_id: number;
  sender_id: number;
  message_text: string;
  timestamp: string;
  is_from_bot: boolean;
}

export interface ChatRequest {
  message: string;
}

// Knowledge base types
export interface KnowledgeDocument {
  document_id: number;
  title: string;
  content?: string;
  file_path: string;
  category?: string;
  created_at: string;
  updated_at?: string;
  created_by?: number;
  status?: string; // draft, approved, rejected, deleted
  reviewed_by?: number;
  reviewed_at?: string;
  reject_reason?: string;
}

export interface TrainingQuestion {
  question_id: number;
  question: string;
  answer: string;
  intent_id?: number;
  created_at?: string;
  approved_at?: string;
  created_by?: number;
  approved_by?: number;
  status?: string; // draft, approved, rejected, deleted
  reject_reason?: string;
}

// Intent types
export interface Intent {
  intent_id: number;
  intent_name: string;
  description?: string;
  is_deleted?: boolean;
}