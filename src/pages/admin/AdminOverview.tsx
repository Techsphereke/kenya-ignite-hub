import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { FileText, Users, MessageSquare, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminOverview = () => {
  const [stats, setStats] = useState({ articles: 0, pending: 0, users: 0, comments: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [artRes, pendRes, usrRes, cmtRes] = await Promise.all([
        supabase.from('articles').select('id', { count: 'exact', head: true }),
        supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        articles: artRes.count || 0,
        pending: pendRes.count || 0,
        users: usrRes.count || 0,
        comments: cmtRes.count || 0,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Articles', value: stats.articles, icon: FileText, gradient: 'from-primary/20 to-primary/5', glow: 'hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)]' },
    { label: 'Pending Approval', value: stats.pending, icon: Clock, gradient: 'from-accent/20 to-accent/5', glow: 'hover:shadow-[0_0_30px_hsl(var(--accent)/0.2)]' },
    { label: 'Authors', value: stats.users, icon: Users, gradient: 'from-secondary/20 to-secondary/5', glow: 'hover:shadow-[0_0_30px_hsl(var(--secondary)/0.2)]' },
    { label: 'Comments', value: stats.comments, icon: MessageSquare, gradient: 'from-muted to-muted/50', glow: 'hover:shadow-[0_0_30px_hsl(var(--border)/0.3)]' },
  ];

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.5 }}
            className={`glass-card rounded-xl p-5 bg-gradient-to-br ${c.gradient} stat-card ${c.glow} transition-all duration-500`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-body font-medium text-muted-foreground">{c.label}</span>
              <c.icon className="w-5 h-5 text-foreground/40" />
            </div>
            <span className="text-3xl font-display font-bold gradient-text">{c.value}</span>
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
        className="glass-card rounded-xl p-6">
        <h2 className="text-lg font-display font-bold text-foreground mb-2">Welcome to the Admin Panel</h2>
        <p className="text-sm font-body text-muted-foreground leading-relaxed">
          Use the sidebar to manage articles, users, and comments. You can approve or reject submitted articles,
          mark stories as breaking news or featured, manage user roles, and moderate comments.
        </p>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminOverview;
