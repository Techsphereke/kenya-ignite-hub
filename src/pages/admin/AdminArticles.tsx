import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Trash2, Star, Zap, Eye, Clock, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';

type Article = Database['public']['Tables']['articles']['Row'];
type ArticleStatus = Database['public']['Enums']['article_status'];

const statusStyles: Record<ArticleStatus, string> = {
  draft: 'bg-muted/50 text-muted-foreground',
  pending: 'bg-accent/20 text-accent',
  approved: 'bg-secondary/20 text-secondary',
  rejected: 'bg-destructive/20 text-destructive',
};

// <input type="datetime-local"> needs a local "YYYY-MM-DDTHH:mm" value
const toLocalInput = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const AdminArticles = () => {
  const [articles, setArticles] = useState<(Article & { profiles?: { display_name: string } | null; categories?: { name: string } | null })[]>([]);
  const [filter, setFilter] = useState<ArticleStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    let query = supabase
      .from('articles')
      .select('*, profiles!articles_author_id_fkey(display_name), categories(name)')
      .order('created_at', { ascending: false });
    if (filter !== 'all') query = query.eq('status', filter);
    const { data, error } = await query;
    if (error) {
      const { data: fallback } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
      setArticles((fallback || []) as any);
    } else {
      setArticles(data as any);
    }
    setLoading(false);
  };

  useEffect(() => { fetchArticles(); }, [filter]);

  const updateArticle = async (id: string, updates: Partial<Article>) => {
    const { error } = await supabase.from('articles').update(updates).eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Article updated'); fetchArticles(); }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('Permanently delete this article?')) return;
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Article deleted'); fetchArticles(); }
  };

  const filters: { label: string; value: ArticleStatus | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Draft', value: 'draft' },
    { label: 'Rejected', value: 'rejected' },
  ];

  return (
    <AdminLayout>
      <div className="mb-5"><h1 className="font-newsroom-heading text-2xl font-semibold">Posts</h1><p className="mt-1 text-sm text-newsroom-muted">Review, schedule and manage every newsroom story.</p></div>
      <div className="flex flex-wrap gap-3 mb-4 border-b border-newsroom-line pb-3">
        {filters.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`text-sm transition-colors ${
              filter === f.value
                ? 'font-semibold text-newsroom-blue'
                : 'text-newsroom-muted hover:text-newsroom-blue'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-xl animate-spin" /></div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <FileText className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-body">No articles found</p>
        </div>
      ) : (
        <div className="newsroom-panel overflow-hidden divide-y divide-newsroom-line">
          {articles.map((article, i) => (
            <motion.div key={article.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-newsroom-surface p-4 hover:bg-newsroom-blueSoft transition-colors">
              <div className="flex items-start gap-4">
                {article.cover_image && (
                  <img src={article.cover_image} alt="" className="w-24 h-18 rounded-xl object-cover flex-shrink-0 hidden sm:block" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-newsroom-blue line-clamp-2">{article.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-xl text-xs font-body font-medium ${statusStyles[article.status]}`}>
                      {article.status}
                    </span>
                    {article.is_breaking && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-xs font-body font-medium bg-primary/10 text-primary">
                        <Zap className="w-3 h-3" /> Breaking
                      </span>
                    )}
                    {article.is_featured && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-xs font-body font-medium bg-accent/20 text-accent">
                        <Star className="w-3 h-3" /> Featured
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground font-body flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {article.views}
                    </span>
                    <span className="text-xs text-muted-foreground font-body flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(article.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <label className="text-xs font-semibold text-newsroom-muted">Publish date</label>
                    <input type="datetime-local" defaultValue={toLocalInput(article.published_at)}
                      onChange={e => updateArticle(article.id, { published_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                      className="newsroom-field max-w-[220px] py-1 text-xs" />
                  </div>
                </div>


                <div className="flex flex-col gap-1 flex-shrink-0">
                  {article.status !== 'approved' && (
                    <Button variant="ghost" size="icon" onClick={() => updateArticle(article.id, { status: 'approved', published_at: new Date().toISOString() })}
                      className="h-8 w-8 text-newsroom-success" title="Approve">
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                  {article.status !== 'rejected' && (
                    <Button variant="ghost" size="icon" onClick={() => updateArticle(article.id, { status: 'rejected' })}
                      className="h-8 w-8 text-newsroom-danger" title="Reject">
                      <XCircle className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => updateArticle(article.id, { is_breaking: !article.is_breaking })}
                    className={`h-8 w-8 ${article.is_breaking ? 'text-newsroom-danger bg-newsroom-canvas' : 'text-newsroom-muted'}`} title="Toggle breaking">
                    <Zap className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => updateArticle(article.id, { is_featured: !article.is_featured })}
                    className={`h-8 w-8 ${article.is_featured ? 'text-newsroom-warning bg-newsroom-canvas' : 'text-newsroom-muted'}`} title="Toggle featured">
                    <Star className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteArticle(article.id)}
                    className="h-8 w-8 text-newsroom-danger" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminArticles;
