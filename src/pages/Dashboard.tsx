import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AuthorDashboardLayout from '@/components/AuthorDashboardLayout';
import RichTextEditor from '@/components/RichTextEditor';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileText, Clock, CheckCircle, XCircle, Plus, Trash2, Eye, Send, Search, ImagePlus, ChevronDown, MessageSquare, UserRound, Images, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Database } from '@/integrations/supabase/types';

type Article = Database['public']['Tables']['articles']['Row'];
type ArticleStatus = Database['public']['Enums']['article_status'];
type Category = Database['public']['Tables']['categories']['Row'];
type WorkspaceView = 'dashboard' | 'posts' | 'editor' | 'media' | 'comments' | 'profile';
type MediaFile = { name: string; created_at?: string; metadata?: { size?: number } | null };
type StoryComment = Database['public']['Tables']['comments']['Row'] & { articleTitle?: string };

const statusConfig: Record<ArticleStatus, { label: string; icon: typeof Clock; className: string }> = {
  draft: { label: 'Draft', icon: FileText, className: 'text-newsroom-muted' },
  pending: { label: 'Pending Review', icon: Clock, className: 'text-newsroom-warning' },
  approved: { label: 'Published', icon: CheckCircle, className: 'text-newsroom-success' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'text-newsroom-danger' },
};

const toLocalInput = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [view, setView] = useState<WorkspaceView>('dashboard');
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ArticleStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [storyComments, setStoryComments] = useState<StoryComment[]>([]);
  const [profileForm, setProfileForm] = useState({ display_name: '', bio: '', avatar_url: '' });

  useEffect(() => { if (!authLoading && !user) navigate('/auth'); }, [user, authLoading, navigate]);
  useEffect(() => { if (user) { fetchArticles(user.id); fetchCategories(); } }, [user]);

  const fetchArticles = async (userId?: string) => {
    const authorId = userId || user?.id;
    if (!authorId) return;
    const { data } = await supabase.from('articles').select('*').eq('author_id', authorId).order('created_at', { ascending: false });
    setArticles(data || []); setLoading(false);
  };
  const fetchCategories = async () => { const { data } = await supabase.from('categories').select('*').order('name'); setCategories(data || []); };

  const openList = () => { setView('posts'); setEditingArticle(null); };
  const openNew = () => { setEditingArticle({}); setView('editor'); };
  const loadMedia = async () => {
    if (!user) return;
    const { data, error } = await supabase.storage.from('media').list(user.id, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
    if (error) toast.error(error.message); else setMediaFiles(data || []);
  };
  const loadComments = async () => {
    if (!user) return;
    const { data: ownArticles } = await supabase.from('articles').select('id,title').eq('author_id', user.id);
    if (!ownArticles?.length) { setStoryComments([]); return; }
    const { data, error } = await supabase.from('comments').select('*').in('article_id', ownArticles.map(article => article.id)).order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    else setStoryComments((data || []).map(comment => ({ ...comment, articleTitle: ownArticles.find(article => article.id === comment.article_id)?.title })));
  };
  const navigateWorkspace = (next: Exclude<WorkspaceView, 'editor'>) => {
    setView(next); setEditingArticle(null);
    if (next === 'media') loadMedia();
    if (next === 'comments') loadComments();
    if (next === 'profile') setProfileForm({ display_name: profile?.display_name || '', bio: profile?.bio || '', avatar_url: profile?.avatar_url || '' });
  };

  const handleSave = async (status: ArticleStatus) => {
    if (!editingArticle || !user) return;
    const { title, excerpt, content, cover_image, category_id, tags, published_at } = editingArticle;
    if (!title?.trim()) { toast.error('Title is required'); return; }
    const live = status === 'approved' || status === 'pending';
    const payload = { title: title.trim(), slug: '', excerpt: excerpt || '', content: content || '', cover_image: cover_image || null, category_id: category_id || null, tags: tags || [], author_id: user.id, status, published_at: published_at ? new Date(published_at).toISOString() : (live ? new Date().toISOString() : null) };
    const result = editingArticle.id ? await supabase.from('articles').update(payload).eq('id', editingArticle.id) : await supabase.from('articles').insert(payload);
    if (result.error) toast.error(result.error.message);
    else { toast.success(status === 'approved' ? 'Article published!' : 'Draft saved'); openList(); fetchArticles(); }
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Move this article to trash?')) return;
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Article deleted'); fetchArticles(); }
  };
  const handleCoverUpload = async (file: File) => {
    if (!user) return;
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('media').upload(path, file);
    if (error) { toast.error('Upload failed'); return; }
    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
    setEditingArticle(prev => ({ ...prev, cover_image: publicUrl }));
  };
  const handleMediaUpload = async (file: File) => {
    if (!user) return;
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('media').upload(path, file);
    if (error) toast.error(error.message); else { toast.success('Media uploaded'); loadMedia(); }
  };
  const saveProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update({ display_name: profileForm.display_name.trim(), bio: profileForm.bio.trim(), avatar_url: profileForm.avatar_url.trim() || null }).eq('user_id', user.id);
    if (error) toast.error(error.message); else toast.success('Profile updated');
  };

  const visibleArticles = useMemo(() => articles.filter(article => (filter === 'all' || article.status === filter) && article.title.toLowerCase().includes(search.toLowerCase())), [articles, filter, search]);
  const count = (status: ArticleStatus) => articles.filter(article => article.status === status).length;

  if (authLoading || loading) return <div className="grid min-h-screen place-items-center bg-newsroom-canvas"><div className="h-8 w-8 animate-spin rounded-full border-2 border-newsroom-blue border-t-transparent" /></div>;

  if (view === 'editor') return (
    <AuthorDashboardLayout active="new" onDashboard={openList} onNewPost={openNew} onNavigate={navigateWorkspace}>
      <div className="border-b border-newsroom-line bg-newsroom-surface px-4 py-3 md:px-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><Button variant="link" size="sm" onClick={openList} className="h-auto p-0 text-xs text-newsroom-blue">Posts</Button><h1 className="font-newsroom-heading text-xl font-semibold">{editingArticle?.id ? 'Edit post' : 'Add new post'}</h1></div>
          <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => handleSave('draft')}>Save draft</Button><Button size="sm" onClick={() => handleSave('approved')} className="bg-newsroom-blue hover:bg-newsroom-blue/90"><Send />Publish</Button></div>
        </div>
      </div>
      <main className="p-4 md:p-7">
        <div className="mx-auto grid max-w-[1220px] gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="min-w-0 space-y-4">
            <input value={editingArticle?.title || ''} onChange={e => setEditingArticle(prev => ({ ...prev, title: e.target.value }))} placeholder="Add title" className="newsroom-field h-14 font-newsroom-heading text-2xl font-semibold" />
            <RichTextEditor content={editingArticle?.content || ''} onChange={content => setEditingArticle(prev => ({ ...prev, content }))} />
            <div className="newsroom-panel p-4"><label className="mb-2 block text-sm font-semibold">Excerpt</label><textarea value={editingArticle?.excerpt || ''} onChange={e => setEditingArticle(prev => ({ ...prev, excerpt: e.target.value }))} rows={3} className="newsroom-field resize-none" placeholder="Write a short summary for cards and search results." /></div>
          </section>
          <aside className="space-y-4">
            <div className="newsroom-panel"><h2 className="border-b border-newsroom-line px-4 py-3 font-newsroom-heading text-sm font-semibold">Publish</h2><div className="space-y-3 p-4 text-sm"><div className="flex justify-between"><span className="text-newsroom-muted">Status</span><strong>{editingArticle?.status || 'Draft'}</strong></div><label className="block text-newsroom-muted">Publish date</label><input type="datetime-local" value={toLocalInput(editingArticle?.published_at)} onChange={e => setEditingArticle(prev => ({ ...prev, published_at: e.target.value ? new Date(e.target.value).toISOString() : null }))} className="newsroom-field" /><p className="text-xs text-newsroom-muted">Leave empty to publish immediately, or choose an earlier date.</p></div><div className="flex items-center justify-between border-t border-newsroom-line bg-newsroom-canvas p-3"><Button variant="link" size="sm" className="text-newsroom-danger" onClick={openList}>Cancel</Button><Button size="sm" onClick={() => handleSave('approved')} className="bg-newsroom-blue"><Send />Publish</Button></div></div>
            <div className="newsroom-panel"><h2 className="border-b border-newsroom-line px-4 py-3 font-newsroom-heading text-sm font-semibold">Categories & tags</h2><div className="space-y-3 p-4"><select value={editingArticle?.category_id || ''} onChange={e => setEditingArticle(prev => ({ ...prev, category_id: e.target.value || null }))} className="newsroom-field"><option value="">Select category</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select><input value={(editingArticle?.tags || []).join(', ')} onChange={e => setEditingArticle(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) }))} className="newsroom-field" placeholder="Tags, separated by commas" /></div></div>
            <div className="newsroom-panel"><h2 className="border-b border-newsroom-line px-4 py-3 font-newsroom-heading text-sm font-semibold">Featured image</h2><div className="p-4">{editingArticle?.cover_image ? <img src={editingArticle.cover_image} alt="Featured" className="mb-3 aspect-video w-full object-cover" /> : <div className="mb-3 grid aspect-video place-items-center border border-dashed border-newsroom-line bg-newsroom-canvas text-newsroom-muted"><ImagePlus className="h-7 w-7" /></div>}<label className="cursor-pointer text-sm font-semibold text-newsroom-blue hover:underline">Set featured image<input type="file" accept="image/*" className="sr-only" onChange={e => e.target.files?.[0] && handleCoverUpload(e.target.files[0])} /></label></div></div>
          </aside>
        </div>
      </main>
    </AuthorDashboardLayout>
  );

  if (view === 'dashboard') return <AuthorDashboardLayout active="dashboard" onDashboard={openList} onNewPost={openNew} onNavigate={navigateWorkspace}><main className="p-4 md:p-7"><div className="mb-5 flex items-center justify-between"><div><h1 className="font-newsroom-heading text-2xl font-semibold">Dashboard</h1><p className="mt-1 text-sm text-newsroom-muted">Welcome back. Here is your publishing overview.</p></div><Button onClick={openNew} className="bg-newsroom-blue"><Plus />New post</Button></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{(['approved','pending','draft','rejected'] as ArticleStatus[]).map(status => { const item=statusConfig[status]; const Icon=item.icon; return <div key={status} className="newsroom-panel p-4"><div className="mb-3 flex justify-between"><span className="text-xs text-newsroom-muted">{item.label}</span><Icon className={`h-4 w-4 ${item.className}`}/></div><strong className="font-newsroom-heading text-2xl">{count(status)}</strong></div>; })}</div><div className="mt-5 grid gap-5 lg:grid-cols-2"><section className="newsroom-panel"><div className="border-b border-newsroom-line px-4 py-3 font-newsroom-heading text-sm font-semibold">Recent posts</div>{articles.slice(0,5).map(article=><div key={article.id} className="flex items-center justify-between gap-4 border-b border-newsroom-line p-4 last:border-0"><div className="min-w-0"><p className="truncate text-sm font-semibold text-newsroom-blue">{article.title}</p><span className="text-xs text-newsroom-muted">{statusConfig[article.status].label}</span></div><Button variant="ghost" size="icon" onClick={()=>{setEditingArticle(article);setView('editor')}} aria-label="Edit post"><ArrowRight/></Button></div>)}</section><section className="newsroom-panel p-5"><h2 className="font-newsroom-heading text-sm font-semibold">Quick actions</h2><div className="mt-4 grid gap-2"><Button variant="outline" className="justify-start" onClick={openNew}><Plus/>Write a new story</Button><Button variant="outline" className="justify-start" onClick={()=>navigateWorkspace('media')}><Images/>Open media library</Button><Button variant="outline" className="justify-start" onClick={()=>navigateWorkspace('comments')}><MessageSquare/>Read story comments</Button><Button variant="outline" className="justify-start" onClick={()=>navigateWorkspace('profile')}><UserRound/>Edit profile</Button></div></section></div></main></AuthorDashboardLayout>;

  if (view === 'media') return <AuthorDashboardLayout active="media" onDashboard={openList} onNewPost={openNew} onNavigate={navigateWorkspace}><main className="p-4 md:p-7"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h1 className="font-newsroom-heading text-2xl font-semibold">Media Library</h1><p className="mt-1 text-sm text-newsroom-muted">Upload and reuse images from your stories.</p></div><label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-newsroom-blue px-4 text-sm font-medium text-primary-foreground"><ImagePlus className="h-4 w-4"/>Upload image<input type="file" accept="image/*" className="sr-only" onChange={event=>event.target.files?.[0]&&handleMediaUpload(event.target.files[0])}/></label></div>{mediaFiles.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{mediaFiles.map(file=>{const {data:{publicUrl}}=supabase.storage.from('media').getPublicUrl(`${user?.id}/${file.name}`); return <div key={file.name} className="newsroom-panel overflow-hidden"><img src={publicUrl} alt={file.name} className="aspect-square w-full object-cover"/><div className="truncate p-2 text-xs text-newsroom-muted" title={file.name}>{file.name}</div></div>})}</div>:<div className="newsroom-panel grid min-h-60 place-items-center text-sm text-newsroom-muted">No media uploaded yet.</div>}</main></AuthorDashboardLayout>;

  if (view === 'comments') return <AuthorDashboardLayout active="comments" onDashboard={openList} onNewPost={openNew} onNavigate={navigateWorkspace}><main className="p-4 md:p-7"><div className="mb-5"><h1 className="font-newsroom-heading text-2xl font-semibold">Comments</h1><p className="mt-1 text-sm text-newsroom-muted">Reader responses on your stories.</p></div><div className="newsroom-panel divide-y divide-newsroom-line">{storyComments.length?storyComments.map(comment=><article key={comment.id} className="p-4"><div className="flex flex-wrap items-center gap-2 text-xs text-newsroom-muted"><strong className="text-newsroom-ink">{comment.author_name}</strong><span>on</span><span className="text-newsroom-blue">{comment.articleTitle}</span><span>{new Date(comment.created_at).toLocaleString()}</span></div><p className="mt-2 text-sm">{comment.content}</p></article>):<div className="p-12 text-center text-sm text-newsroom-muted">No comments on your stories yet.</div>}</div></main></AuthorDashboardLayout>;

  if (view === 'profile') return <AuthorDashboardLayout active="profile" onDashboard={openList} onNewPost={openNew} onNavigate={navigateWorkspace}><main className="p-4 md:p-7"><div className="mb-5"><h1 className="font-newsroom-heading text-2xl font-semibold">Profile</h1><p className="mt-1 text-sm text-newsroom-muted">Update your newsroom account details.</p></div><section className="newsroom-panel max-w-2xl p-5 space-y-4"><label className="block text-sm font-semibold">Display name<input className="newsroom-field mt-2" value={profileForm.display_name} onChange={e=>setProfileForm(previous=>({...previous,display_name:e.target.value}))}/></label><label className="block text-sm font-semibold">Biography<textarea className="newsroom-field mt-2 resize-none" rows={5} value={profileForm.bio} onChange={e=>setProfileForm(previous=>({...previous,bio:e.target.value}))}/></label><label className="block text-sm font-semibold">Profile image URL<input className="newsroom-field mt-2" type="url" value={profileForm.avatar_url} onChange={e=>setProfileForm(previous=>({...previous,avatar_url:e.target.value}))}/></label><div className="border-t border-newsroom-line pt-4"><Button onClick={saveProfile} className="bg-newsroom-blue">Save profile</Button></div></section></main></AuthorDashboardLayout>;

  return (
    <AuthorDashboardLayout active="posts" onDashboard={openList} onNewPost={openNew} onNavigate={navigateWorkspace}>
      <main className="p-4 md:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h1 className="font-newsroom-heading text-2xl font-semibold">Posts</h1><p className="mt-1 text-sm text-newsroom-muted">Create, edit and track your newsroom stories.</p></div><Button onClick={openNew} className="bg-newsroom-blue hover:bg-newsroom-blue/90"><Plus />Add New Post</Button></div>
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{(['approved','pending','draft','rejected'] as ArticleStatus[]).map((status, index) => { const item=statusConfig[status]; const Icon=item.icon; return <motion.button key={status} onClick={() => setFilter(status)} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:index*.04 }} className="newsroom-panel flex items-center justify-between p-4 text-left hover:border-newsroom-blue"><div><p className="text-xs text-newsroom-muted">{item.label}</p><strong className="font-newsroom-heading text-2xl">{count(status)}</strong></div><Icon className={`h-5 w-5 ${item.className}`} /></motion.button>; })}</div>
        <section className="newsroom-panel overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-newsroom-line p-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap gap-1 text-sm"><Button variant="link" size="sm" onClick={() => setFilter('all')} className={filter==='all'?'font-semibold text-newsroom-blue':'text-newsroom-muted'}>All ({articles.length})</Button>{(['approved','draft','pending','rejected'] as ArticleStatus[]).map(status => <Button key={status} variant="link" size="sm" onClick={() => setFilter(status)} className={filter===status?'font-semibold text-newsroom-blue':'text-newsroom-muted'}>{statusConfig[status].label} ({count(status)})</Button>)}</div><label className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-newsroom-muted" /><input value={search} onChange={e => setSearch(e.target.value)} className="newsroom-field w-full pl-9 sm:w-64" placeholder="Search posts" /></label></div>
          <div className="overflow-x-auto"><table className="newsroom-table w-full min-w-[760px]"><thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Views</th><th>Date</th></tr></thead><tbody>{visibleArticles.map(article => { const category=categories.find(item=>item.id===article.category_id); return <tr key={article.id} className="group bg-newsroom-surface hover:bg-newsroom-blueSoft"><td className="w-[44%]"><Button variant="link" size="sm" onClick={() => { setEditingArticle(article); setView('editor'); }} className="h-auto justify-start p-0 text-left font-semibold text-newsroom-blue">{article.title || 'Untitled'}</Button><div className="mt-1 flex items-center gap-1 text-xs text-newsroom-muted opacity-100 md:opacity-0 md:group-hover:opacity-100"><Button variant="link" size="sm" onClick={() => { setEditingArticle(article); setView('editor'); }} className="h-auto p-0 text-xs text-newsroom-blue">Edit</Button><span>|</span><Button variant="link" size="sm" onClick={() => handleDelete(article.id)} className="h-auto p-0 text-xs text-newsroom-danger">Trash</Button>{article.status==='approved'&&<><span>|</span><Link to={`/article/${article.slug}`} className="hover:text-newsroom-blue">View</Link></>}</div></td><td>{category?.name || 'Uncategorized'}</td><td><span className={`font-semibold ${statusConfig[article.status].className}`}>{statusConfig[article.status].label}</span></td><td><Eye className="mr-1 inline h-3.5 w-3.5" />{article.views}</td><td className="text-xs text-newsroom-muted">{article.status==='approved'?'Published':'Last modified'}<br/>{new Date(article.updated_at).toLocaleDateString()}</td></tr>; })}</tbody></table></div>
          {visibleArticles.length===0&&<div className="p-12 text-center text-sm text-newsroom-muted">No posts found.</div>}
          <footer className="flex items-center justify-between border-t border-newsroom-line bg-newsroom-canvas px-4 py-3 text-xs text-newsroom-muted"><span>{visibleArticles.length} items</span><Button variant="outline" size="sm" disabled>1 <ChevronDown /></Button></footer>
        </section>
      </main>
    </AuthorDashboardLayout>
  );
};

export default Dashboard;