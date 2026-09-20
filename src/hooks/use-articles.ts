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
  author_name?: string;
  author_avatar?: string | null;
  category_name?: string;
  category_slug?: string;
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

async function enrichArticles(articles: any[]): Promise<DbArticle[]> {
  if (articles.length === 0) return [];
  const authorIds = [...new Set(articles.map(a => a.author_id))];
  const categoryIds = [...new Set(articles.map(a => a.category_id).filter(Boolean))];

  const [profilesRes, categoriesRes] = await Promise.all([
    supabase.from('profiles').select('user_id, display_name, avatar_url').in('user_id', authorIds),
    categoryIds.length > 0
      ? supabase.from('categories').select('id, name, slug').in('id', categoryIds)
      : Promise.resolve({ data: [] }),
  ]);

  const profiles = new Map((profilesRes.data || []).map(p => [p.user_id, p]));
  const catsData = ((categoriesRes as any).data || []) as DbCategory[];
  const cats = new Map(catsData.map(c => [c.id, c]));

  return articles.map(a => ({
    ...a,
    author_name: profiles.get(a.author_id)?.display_name || 'Unknown',
    author_avatar: profiles.get(a.author_id)?.avatar_url || null,
    category_name: cats.get(a.category_id)?.name || undefined,
    category_slug: cats.get(a.category_id)?.slug || undefined,
  }));
}

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
        .from('articles').select('*')
        .eq('status', 'approved').eq('is_featured', true)
        .order('published_at', { ascending: false }).limit(4);
      return enrichArticles(data || []);
    },
  });
}

export function useBreakingArticles() {
  return useQuery({
    queryKey: ['articles', 'breaking'],
    queryFn: async () => {
      const { data } = await supabase
        .from('articles').select('id, title, slug')
        .eq('status', 'approved').eq('is_breaking', true)
        .order('published_at', { ascending: false }).limit(10);
      return (data || []) as Pick<DbArticle, 'id' | 'title' | 'slug'>[];
    },
  });
}

export function useLatestArticles(limit = 10) {
  return useQuery({
    queryKey: ['articles', 'latest', limit],
    queryFn: async () => {
      const { data } = await supabase
        .from('articles').select('*')
        .eq('status', 'approved')
        .order('published_at', { ascending: false }).limit(limit);
      return enrichArticles(data || []);
    },
  });
}

export function useTrendingArticles() {
  return useQuery({
    queryKey: ['articles', 'trending'],
    queryFn: async () => {
      const { data } = await supabase
        .from('articles').select('*')
        .eq('status', 'approved')
        .order('views', { ascending: false }).limit(5);
      return enrichArticles(data || []);
    },
  });
}

export function useArticlesByCategory(categoryId: string | undefined) {
  return useQuery({
    queryKey: ['articles', 'category', categoryId],
    queryFn: async () => {
      const { data } = await supabase
        .from('articles').select('*')
        .eq('status', 'approved').eq('category_id', categoryId!)
        .order('published_at', { ascending: false }).limit(20);
      return enrichArticles(data || []);
    },
    enabled: !!categoryId,
  });
}

export function useArticleBySlug(slug: string) {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      const { data } = await supabase
        .from('articles').select('*')
        .eq('slug', slug).eq('status', 'approved').single();
      if (!data) return null;
      const enriched = await enrichArticles([data]);
      return enriched[0] || null;
    },
    enabled: !!slug,
  });
}

export function useArticleComments(articleId: string | undefined) {
  return useQuery({
    queryKey: ['comments', articleId],
    queryFn: async () => {
      const { data } = await supabase
        .from('comments').select('*')
        .eq('article_id', articleId!)
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
      const { data } = await supabase
        .from('articles').select('*')
        .eq('status', 'approved')
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
        .order('published_at', { ascending: false }).limit(30);
      return enrichArticles(data || []);
    },
    enabled: !!query,
  });
}

export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      const { data } = await supabase
        .from('categories').select('*').eq('slug', slug).single();
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
