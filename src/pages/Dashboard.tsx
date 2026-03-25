import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import RichTextEditor from '@/components/RichTextEditor';
import { toast } from 'sonner';
import { PenLine, FileText, Clock, CheckCircle, XCircle, Plus, LogOut, Edit, Trash2, Eye, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Database } from '@/integrations/supabase/types';

type Article = Database['public']['Tables']['articles']['Row'];
type ArticleStatus = Database['public']['Enums']['article_status'];
type Category = Database['public']['Tables']['categories']['Row'];

const statusConfig: Record<ArticleStatus, { label: string; icon: typeof Clock; gradient: string; text: string }> = {
  draft: { label: 'Draft', icon: FileText, gradient: 'from-muted to-muted/50', text: 'text-muted-foreground' },
  pending: { label: 'Pending Review', icon: Clock, gradient: 'from-accent/20 to-accent/5', text: 'text-accent' },
  approved: { label: 'Published', icon: CheckCircle, gradient: 'from-secondary/20 to-secondary/5', text: 'text-secondary' },
  rejected: { label: 'Rejected', icon: XCircle, gradient: 'from-destructive/20 to-destructive/5', text: 'text-destructive' },
};

const Dashboard = () => {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) { fetchArticles(); fetchCategories(); }
  }, [user]);

  const fetchArticles = async () => {
    const { data } = await supabase.from('articles').select('*').eq('author_id', user!.id).order('created_at', { ascending: false });
    setArticles(data || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
  };

  const handleSave = async (status: ArticleStatus) => {
    if (!editingArticle || !user) return;
    const { title, excerpt, content, cover_image, category_id, tags } = editingArticle;
    if (!title?.trim()) { toast.error('Title is required'); return; }
    const payload = {
      title: title.trim(), slug: '', excerpt: excerpt || '', content: content || '',
      cover_image: cover_image || null, category_id: category_id || null, tags: tags || [],
      author_id: user.id, status,
      published_at: (status === 'approved' || status === 'pending') ? new Date().toISOString() : null,
    };
    let error;
    if (editingArticle.id) {
      const res = await supabase.from('articles').update(payload).eq('id', editingArticle.id);
      error = res.error;
    } else {
      const res = await supabase.from('articles').insert(payload);
      error = res.error;
    }
    if (error) { toast.error(error.message); }
    else { toast.success(status === 'pending' ? 'Submitted for review!' : 'Article saved!'); setView('list'); setEditingArticle(null); fetchArticles(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Deleted'); fetchArticles(); }
  };

  const handleCoverUpload = async (file: File) => {
    if (!user) return;
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('media').upload(path, file);
    if (error) { toast.error('Upload failed'); return; }
    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
    setEditingArticle(prev => ({ ...prev, cover_image: publicUrl }));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background animated-bg noise-overlay">
        <SiteHeader />
        <div className="container py-20 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      </div>
    );
  }

  if (view === 'editor') {
    return (
      <div className="min-h-screen bg-background animated-bg noise-overlay">
        <SiteHeader />
        <div className="container max-w-3xl py-6 relative z-10">
          <button onClick={() => { setView('list'); setEditingArticle(null); }}
            className="text-sm font-body text-muted-foreground hover:text-primary transition-colors duration-300 mb-4 block">
            ← Back to dashboard
          </button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-xl font-display font-bold text-foreground mb-6">
              {editingArticle?.id ? 'Edit Article' : 'New Article'}
            </h2>

            <div className="space-y-4">
              <input type="text" placeholder="Article title"
                value={editingArticle?.title || ''}
                onChange={e => setEditingArticle(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl glass-card text-foreground font-display text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />

              <textarea placeholder="Short excerpt (1-2 sentences)"
                value={editingArticle?.excerpt || ''}
                onChange={e => setEditingArticle(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl glass-card text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-body font-medium text-foreground block mb-1">Category</label>
                  <select value={editingArticle?.category_id || ''}
                    onChange={e => setEditingArticle(prev => ({ ...prev, category_id: e.target.value || null }))}
                    className="w-full px-3 py-2.5 rounded-xl glass-card text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all">
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-body font-medium text-foreground block mb-1">Tags (comma-separated)</label>
                  <input type="text"
                    value={(editingArticle?.tags || []).join(', ')}
                    onChange={e => setEditingArticle(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                    className="w-full px-3 py-2.5 rounded-xl glass-card text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
              </div>

              <div>
                <label className="text-sm font-body font-medium text-foreground block mb-1">Cover Image</label>
                {editingArticle?.cover_image && (
                  <img src={editingArticle.cover_image} alt="Cover" className="w-full h-48 object-cover rounded-xl mb-2 glow-border" />
                )}
                <input type="file" accept="image/*"
                  onChange={e => e.target.files?.[0] && handleCoverUpload(e.target.files[0])}
                  className="text-sm font-body text-muted-foreground" />
              </div>

              <div>
                <label className="text-sm font-body font-medium text-foreground block mb-1">Content</label>
                <RichTextEditor content={editingArticle?.content || ''} onChange={html => setEditingArticle(prev => ({ ...prev, content: html }))} />
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => handleSave('draft')}
                  className="px-5 py-2.5 glass-card rounded-xl font-body text-sm font-medium text-foreground hover:bg-muted/50 transition-all duration-300">
                  Save Draft
                </button>
                <button onClick={() => handleSave('pending')}
                  className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-body text-sm font-medium hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all duration-300 flex items-center gap-1.5">
                  <Send className="w-4 h-4" /> Submit for Review
                </button>
              </div>
            </div>
          </motion.div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animated-bg noise-overlay">
      <SiteHeader />
      <div className="container py-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">Author Dashboard</h2>
            <p className="text-sm font-body text-muted-foreground">Welcome, {profile?.display_name || user?.email}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setEditingArticle({}); setView('editor'); }}
              className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-body text-sm font-medium hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all duration-300 flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> New Article
            </button>
            <button onClick={signOut}
              className="px-4 py-2.5 glass-card rounded-xl font-body text-sm font-medium text-foreground hover:bg-muted/50 transition-all duration-300 flex items-center gap-1.5">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {(['draft', 'pending', 'approved', 'rejected'] as ArticleStatus[]).map((status, i) => {
            const count = articles.filter(a => a.status === status).length;
            const cfg = statusConfig[status];
            const Icon = cfg.icon;
            return (
              <motion.div key={status} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`glass-card rounded-xl p-4 bg-gradient-to-br ${cfg.gradient} stat-card transition-all duration-500`}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${cfg.text}`} />
                  <span className="text-xs font-body font-medium text-muted-foreground uppercase">{cfg.label}</span>
                </div>
                <span className="text-2xl font-display font-bold text-foreground">{count}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Article list */}
        <div className="space-y-3">
          {articles.length === 0 && (
            <div className="text-center py-16 glass-card rounded-xl">
              <PenLine className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground font-body">No articles yet. Start writing!</p>
            </div>
          )}
          {articles.map((article, i) => {
            const cfg = statusConfig[article.status];
            const Icon = cfg.icon;
            return (
              <motion.div key={article.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl p-4 flex items-start gap-4 hover:glow-border transition-all duration-300">
                {article.cover_image && (
                  <img src={article.cover_image} alt="" className="w-20 h-16 rounded-lg object-cover flex-shrink-0 hidden sm:block" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-display font-semibold text-foreground line-clamp-2">{article.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-body font-medium ${cfg.text} bg-current/10`}
                      style={{ backgroundColor: 'transparent' }}>
                      <Icon className="w-3 h-3" /> {cfg.label}
                    </span>
                    <span className="text-xs text-muted-foreground font-body">
                      {new Date(article.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {article.status === 'approved' && (
                    <Link to={`/article/${article.slug}`} className="p-2 rounded-lg hover:bg-muted/50 transition-all duration-300 text-muted-foreground hover:text-foreground">
                      <Eye className="w-4 h-4" />
                    </Link>
                  )}
                  <button onClick={() => { setEditingArticle(article); setView('editor'); }}
                    className="p-2 rounded-lg hover:bg-muted/50 transition-all duration-300 text-muted-foreground hover:text-foreground">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(article.id)}
                    className="p-2 rounded-lg hover:bg-destructive/20 transition-all duration-300 text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
};

export default Dashboard;
