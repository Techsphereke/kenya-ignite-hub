import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { FileText, Users, MessageSquare, Clock, Eye, Zap, Star, Plus, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    articles: 0, pending: 0, users: 0, comments: 0,
    views: 0, breaking: 0, featured: 0, approved: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [artRes, pendRes, apprRes, brkRes, ftrRes, usrRes, cmtRes, viewsRes] = await Promise.all([
        supabase.from('articles').select('id', { count: 'exact', head: true }),
        supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('articles').select('id', { count: 'exact', head: true }).eq('is_breaking', true),
        supabase.from('articles').select('id', { count: 'exact', head: true }).eq('is_featured', true),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
        supabase.from('articles').select('views').eq('status', 'approved'),
      ]);
      const totalViews = (viewsRes.data || []).reduce((sum, a: any) => sum + (a.views || 0), 0);
      setStats({
        articles: artRes.count || 0,
        pending: pendRes.count || 0,
        approved: apprRes.count || 0,
        breaking: brkRes.count || 0,
        featured: ftrRes.count || 0,
        users: usrRes.count || 0,
        comments: cmtRes.count || 0,
        views: totalViews,
      });
    };
    fetchStats();
  }, []);

  const formatNum = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

  const cards = [
    { label: 'Total Articles', value: stats.articles, icon: FileText, gradient: 'from-primary/20 to-primary/5', glow: '' },
    { label: 'Total Views', value: formatNum(stats.views), icon: Eye, gradient: 'from-primary/20 to-accent/5', glow: '' },
    { label: 'Pending Approval', value: stats.pending, icon: Clock, gradient: 'from-accent/20 to-accent/5', glow: '' },
    { label: 'Approved', value: stats.approved, icon: FileText, gradient: 'from-secondary/20 to-secondary/5', glow: '' },
    { label: 'Breaking', value: stats.breaking, icon: Zap, gradient: 'from-primary/20 to-primary/5', glow: '' },
    { label: 'Featured', value: stats.featured, icon: Star, gradient: 'from-accent/20 to-accent/5', glow: '' },
    { label: 'Authors', value: stats.users, icon: Users, gradient: 'from-secondary/20 to-secondary/5', glow: '' },
    { label: 'Comments', value: stats.comments, icon: MessageSquare, gradient: 'from-muted to-muted/50', glow: '' },
  ];

  return (
    <AdminLayout>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h1 className="font-newsroom-heading text-2xl font-semibold">Dashboard</h1><p className="mt-1 text-sm text-newsroom-muted">Newsroom activity and publishing overview.</p></div><Button asChild className="bg-newsroom-blue hover:bg-newsroom-blue/90"><Link to="/dashboard"><Plus />Add New Post</Link></Button></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.5 }}
            className="newsroom-panel p-4 transition-colors hover:border-newsroom-blue">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-newsroom-muted">{c.label}</span>
              <c.icon className="w-4 h-4 text-newsroom-blue" />
            </div>
            <span className="font-newsroom-heading text-2xl font-semibold text-newsroom-ink">{c.value}</span>
          </motion.div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
        <section className="newsroom-panel"><div className="flex items-center justify-between border-b border-newsroom-line px-4 py-3"><h2 className="font-newsroom-heading text-sm font-semibold">At a glance</h2><Link to="/admin/articles" className="text-xs text-newsroom-blue hover:underline">Manage posts</Link></div><div className="grid grid-cols-2 gap-px bg-newsroom-line sm:grid-cols-3"><div className="bg-newsroom-surface p-5"><FileText className="mb-2 h-4 w-4 text-newsroom-blue"/><strong className="block text-xl">{stats.approved}</strong><span className="text-xs text-newsroom-muted">Published stories</span></div><div className="bg-newsroom-surface p-5"><Clock className="mb-2 h-4 w-4 text-newsroom-warning"/><strong className="block text-xl">{stats.pending}</strong><span className="text-xs text-newsroom-muted">Awaiting review</span></div><div className="bg-newsroom-surface p-5"><MessageSquare className="mb-2 h-4 w-4 text-newsroom-blue"/><strong className="block text-xl">{stats.comments}</strong><span className="text-xs text-newsroom-muted">Reader comments</span></div></div></section>
        <section className="newsroom-panel"><div className="border-b border-newsroom-line px-4 py-3"><h2 className="font-newsroom-heading text-sm font-semibold">Quick actions</h2></div><div className="divide-y divide-newsroom-line"><Link to="/admin/articles" className="flex items-center justify-between p-4 text-sm hover:bg-newsroom-blueSoft">Review pending stories <ArrowRight className="h-4 w-4 text-newsroom-blue"/></Link><Link to="/admin/comments" className="flex items-center justify-between p-4 text-sm hover:bg-newsroom-blueSoft">Moderate comments <ArrowRight className="h-4 w-4 text-newsroom-blue"/></Link><Link to="/admin/users" className="flex items-center justify-between p-4 text-sm hover:bg-newsroom-blueSoft">Manage newsroom roles <ArrowRight className="h-4 w-4 text-newsroom-blue"/></Link></div></section>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
