import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DbArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  category_id: string | null;
  author_id: string;
  status: string;
  is_breaking: boolean;
  is_featured: boolean;
  tags: string[] | null;
  views: number;
  reading_time: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { display_name: string; avatar_url: string | null } | null;
  categories?: { name: string; slug: string } | null;
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
}

export interface DbComment {
  id: string;
  article_id: string;
  author_name: string;
  content: string;
  parent_id: string | null;
  created_at: string;
}

const articleSelect = '*, profiles!articles_author_id_fkey(display_name, avatar_url), categories(name, slug)';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*').order('name');
      return (data || []) as DbCategory[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useFeaturedArticles() {
  return useQuery({
    queryKey: ['articles', 'featured'],
    queryFn: async () => {
      const { data } = await supabase
        .from('articles')
        .select(articleSelect)
        .eq('status', 'approved')
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(4);
      return (data || []) as DbArticle[];
    },
  });
}

export function useBreakingArticles() {
  return useQuery({
    queryKey: ['articles', 'breaking'],
    queryFn: async () => {
      const { data } = await supabase
        .from('articles')
        .select('id, title, slug')
        .eq('status', 'approved')
        .eq('is_breaking', true)
        .order('published_at', { ascending: false })
        .limit(10);
      return (data || []) as Pick<DbArticle, 'id' | 'title' | 'slug'>[];
    },
  });
}

export function useLatestArticles(limit = 10) {
  return useQuery({
    queryKey: ['articles', 'latest', limit],
    queryFn: async () => {
      const { data } = await supabase
        .from('articles')
        .select(articleSelect)
        .eq('status', 'approved')
        .order('published_at', { ascending: false })
        .limit(limit);
      return (data || []) as DbArticle[];
    },
  });
}

export function useTrendingArticles() {
  return useQuery({
    queryKey: ['articles', 'trending'],
    queryFn: async () => {
      const { data } = await supabase
        .from('articles')
        .select(articleSelect)
        .eq('status', 'approved')
        .order('views', { ascending: false })
        .limit(5);
      return (data || []) as DbArticle[];
    },
  });
}

export function useArticlesByCategory(categoryId: string | undefined) {
  return useQuery({
    queryKey: ['articles', 'category', categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      const { data } = await supabase
        .from('articles')
        .select(articleSelect)
        .eq('status', 'approved')
        .eq('category_id', categoryId)
        .order('published_at', { ascending: false })
        .limit(20);
      return (data || []) as DbArticle[];
    },
    enabled: !!categoryId,
  });
}

export function useArticleBySlug(slug: string) {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      const { data } = await supabase
        .from('articles')
        .select(articleSelect)
        .eq('slug', slug)
        .eq('status', 'approved')
        .single();
      return data as DbArticle | null;
    },
    enabled: !!slug,
  });
}

export function useArticleComments(articleId: string | undefined) {
  return useQuery({
    queryKey: ['comments', articleId],
    queryFn: async () => {
      if (!articleId) return [];
      const { data } = await supabase
        .from('comments')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: true });
      return (data || []) as DbComment[];
    },
    enabled: !!articleId,
  });
}

export function useSearchArticles(query: string) {
  return useQuery({
    queryKey: ['articles', 'search', query],
    queryFn: async () => {
      if (!query) return [];
      const { data } = await supabase
        .from('articles')
        .select(articleSelect)
        .eq('status', 'approved')
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
        .order('published_at', { ascending: false })
        .limit(30);
      return (data || []) as DbArticle[];
    },
    enabled: !!query,
  });
}

export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();
      return data as DbCategory | null;
    },
    enabled: !!slug,
  });
}

export function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' });
}
