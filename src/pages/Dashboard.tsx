import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import RichTextEditor from '@/components/RichTextEditor';
import { toast } from 'sonner';
import { PenLine, FileText, Clock, CheckCircle, XCircle, Plus, LogOut, Edit, Trash2, Eye, Send } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Article = Database['public']['Tables']['articles']['Row'];
type ArticleStatus = Database['public']['Enums']['article_status'];
type Category = Database['public']['Tables']['categories']['Row'];

const statusConfig: Record<ArticleStatus, { label: string; icon: typeof Clock; color: string }> = {
  draft: { label: 'Draft', icon: FileText, color: 'text-muted-foreground bg-muted' },
  pending: { label: 'Pending Review', icon: Clock, color: 'text-accent-foreground bg-accent' },
  approved: { label: 'Published', icon: CheckCircle, color: 'text-secondary-foreground bg-secondary' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'text-destructive-foreground bg-destructive' },
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
    if (user) {
      fetchArticles();
      fetchCategories();
    }
  }, [user]);

  const fetchArticles = async () => {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .eq('author_id', user!.id)
      .order('created_at', { ascending: false });
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
      title: title.trim(),
      slug: '',
      excerpt: excerpt || '',
      content: content || '',
      cover_image: cover_image || null,
      category_id: category_id || null,
      tags: tags || [],
      author_id: user.id,
      status,
      published_at: status === 'approved' ? new Date().toISOString() : null,
    };

    let error;
    if (editingArticle.id) {
      const res = await supabase.from('articles').update(payload).eq('id', editingArticle.id);
      error = res.error;
    } else {
      const res = await supabase.from('articles').insert(payload);
      error = res.error;
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(status === 'pending' ? 'Submitted for review!' : 'Article saved!');
      setView('list');
      setEditingArticle(null);
      fetchArticles();
    }
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
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container py-20 text-center font-body text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (view === 'editor') {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container max-w-3xl py-6">
          <button onClick={() => { setView('list'); setEditingArticle(null); }}
            className="text-sm font-body text-muted-foreground hover:text-primary mb-4 block">
            ← Back to dashboard
          </button>

          <h2 className="text-xl font-display font-bold text-foreground mb-6">
            {editingArticle?.id ? 'Edit Article' : 'New Article'}
          </h2>

          <div className="space-y-4">
            <input type="text" placeholder="Article title"
              value={editingArticle?.title || ''}
              onChange={e => setEditingArticle(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground font-display text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary" />

            <textarea placeholder="Short excerpt (1-2 sentences)"
              value={editingArticle?.excerpt || ''}
              onChange={e => setEditingArticle(prev => ({ ...prev, excerpt: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-body font-medium text-foreground block mb-1">Category</label>
                <select value={editingArticle?.category_id || ''}
                  onChange={e => setEditingArticle(prev => ({ ...prev, category_id: e.target.value || null }))}
                  className="w-full px-3 py-2 rounded-md bg-card border border-border text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-body font-medium text-foreground block mb-1">Tags (comma-separated)</label>
                <input type="text"
                  value={(editingArticle?.tags || []).join(', ')}
                  onChange={e => setEditingArticle(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                  className="w-full px-3 py-2 rounded-md bg-card border border-border text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>

            {/* Cover image */}
            <div>
              <label className="text-sm font-body font-medium text-foreground block mb-1">Cover Image</label>
              {editingArticle?.cover_image && (
                <img src={editingArticle.cover_image} alt="Cover" className="w-full h-48 object-cover rounded-lg mb-2" />
              )}
              <input type="file" accept="image/*"
                onChange={e => e.target.files?.[0] && handleCoverUpload(e.target.files[0])}
                className="text-sm font-body text-muted-foreground" />
            </div>

            <div>
              <label className="text-sm font-body font-medium text-foreground block mb-1">Content</label>
              <RichTextEditor
                content={editingArticle?.content || ''}
                onChange={html => setEditingArticle(prev => ({ ...prev, content: html }))}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => handleSave('draft')}
                className="px-5 py-2.5 bg-muted text-foreground rounded-md font-body text-sm font-medium hover:opacity-80 transition-opacity">
                Save Draft
              </button>
              <button onClick={() => handleSave('pending')}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-md font-body text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5">
                <Send className="w-4 h-4" /> Submit for Review
              </button>
            </div>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">Author Dashboard</h2>
            <p className="text-sm font-body text-muted-foreground">Welcome, {profile?.display_name || user?.email}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setEditingArticle({}); setView('editor'); }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> New Article
            </button>
            <button onClick={signOut}
              className="px-4 py-2 bg-muted text-foreground rounded-md font-body text-sm font-medium hover:opacity-80 transition-opacity flex items-center gap-1.5">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {(['draft', 'pending', 'approved', 'rejected'] as ArticleStatus[]).map(status => {
            const count = articles.filter(a => a.status === status).length;
            const cfg = statusConfig[status];
            const Icon = cfg.icon;
            return (
              <div key={status} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-body font-medium text-muted-foreground uppercase">{cfg.label}</span>
                </div>
                <span className="text-2xl font-display font-bold text-foreground">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Article list */}
        <div className="space-y-3">
          {articles.length === 0 && (
            <div className="text-center py-16 text-muted-foreground font-body">
              <PenLine className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No articles yet. Start writing!</p>
            </div>
          )}
          {articles.map(article => {
            const cfg = statusConfig[article.status];
            const Icon = cfg.icon;
            return (
              <div key={article.id} className="bg-card border border-border rounded-lg p-4 flex items-start gap-4">
                {article.cover_image && (
                  <img src={article.cover_image} alt="" className="w-20 h-16 rounded object-cover flex-shrink-0 hidden sm:block" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-display font-semibold text-foreground line-clamp-2">{article.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-body font-medium ${cfg.color}`}>
                      <Icon className="w-3 h-3" /> {cfg.label}
                    </span>
                    <span className="text-xs text-muted-foreground font-body">
                      {new Date(article.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {article.status === 'approved' && (
                    <Link to={`/article/${article.slug}`} className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground">
                      <Eye className="w-4 h-4" />
                    </Link>
                  )}
                  <button onClick={() => { setEditingArticle(article); setView('editor'); }}
                    className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(article.id)}
                    className="p-2 rounded-md hover:bg-destructive/10 transition-colors text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
};

export default Dashboard;
