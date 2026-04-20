import { supabase } from '../lib/supabase';
import type { AdmissionInfo, Program, NewsArticle, ContactMessage } from '../types';

// FastAPI Base URL - should be moved to environment variables
const FASTAPI_BASE_URL = 'http://34.158.58.188:8000';

// Article type based on the API response
export interface Article {
  article_id: number;
  title: string;
  description: string;
  url: string;
  status: string;
  create_at: string;
  created_by: number;
  major_id: number;
  specialization_id: number;
  author_name: string;
  major_name: string;
  specialization_name: string;
}

// FastAPI Articles API
export const articlesApi = {
  getAll: async (): Promise<Article[]> => {
    try {
      const response = await fetch(`${FASTAPI_BASE_URL}/articles`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as Article[];
    } catch (error) {
      throw error;
    }
  },

  getById: async (id: number): Promise<Article> => {
    try {
      const response = await fetch(`${FASTAPI_BASE_URL}/articles/${id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as Article;
    } catch (error) {
      throw error;
    }
  },

  create: async (articleData: Partial<Article>): Promise<Article> => {
    try {
      const response = await fetch(`${FASTAPI_BASE_URL}/articles`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as Article;
    } catch (error) {
      throw error;
    }
  },

  update: async (id: number, articleData: Partial<Article>): Promise<Article> => {
    try {
      const response = await fetch(`${FASTAPI_BASE_URL}/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as Article;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${FASTAPI_BASE_URL}/articles/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      throw error;
    }
  },
};

export const admissionsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('admissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as AdmissionInfo[];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('admissions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as AdmissionInfo | null;
  },
};

export const programsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as Program[];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Program | null;
  },
};

export const newsApi = {
  getAll: async (published = true) => {
    let query = supabase.from('news').select('*');

    if (published) {
      query = query.eq('published', true);
    }

    const { data, error } = await query.order('published_at', { ascending: false });

    if (error) throw error;
    return data as NewsArticle[];
  },

  getBySlug: async (slug: string) => {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();

    if (error) throw error;
    return data as NewsArticle | null;
  },
};

export const contactApi = {
  create: async (message: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert(message)
      .select()
      .single();

    if (error) throw error;
    return data as ContactMessage;
  },
};
