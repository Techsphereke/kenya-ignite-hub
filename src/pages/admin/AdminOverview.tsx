import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { FileText, Users, MessageSquare, Clock } from 'lucide-react';

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
    { label: 'Total Articles', value: stats.articles, icon: FileText, color: 'text-primary' },
    { label: 'Pending Approval', value: stats.pending, icon: Clock, color: 'text-accent' },
    { label: 'Authors', value: stats.users, icon: Users, color: 'text-secondary' },
    { label: 'Comments', value: stats.comments, icon: MessageSquare, color: 'text-muted-foreground' },
  ];

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-body font-medium text-muted-foreground">{c.label}</span>
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </div>
            <span className="text-3xl font-display font-bold text-foreground">{c.value}</span>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-display font-bold text-foreground mb-2">Welcome to the Admin Panel</h2>
        <p className="text-sm font-body text-muted-foreground leading-relaxed">
          Use the sidebar to manage articles, users, and comments. You can approve or reject submitted articles,
          mark stories as breaking news or featured, manage user roles, and moderate comments.
        </p>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
