import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, FileText, Users, MessageSquare, ArrowLeft, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const nav = [
  { title: 'Overview', path: '/admin', icon: LayoutDashboard },
  { title: 'Articles', path: '/admin/articles', icon: FileText },
  { title: 'Users', path: '/admin/users', icon: Users },
  { title: 'Comments', path: '/admin/comments', icon: MessageSquare },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { user, roles, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const allowed = roles.includes('admin') || roles.includes('editor');

  useEffect(() => { if (!loading && (!user || !allowed)) navigate('/'); }, [user, loading, allowed, navigate]);
  if (loading) return <div className="min-h-screen bg-muted grid place-items-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!allowed) return null;

  return <div className="min-h-screen bg-muted flex">
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary text-primary-foreground flex flex-col transition-transform duration-300 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 border-b border-primary-foreground/15">
        <Link to="/" className="font-display text-2xl font-black uppercase tracking-tighter">Juba<span className="text-accent">.</span>Chronicle</Link>
        <p className="mt-2 text-[9px] font-extrabold uppercase tracking-[0.24em] text-primary-foreground/50">Newsroom desk</p>
      </div>
      <nav className="flex-1 p-3 space-y-1.5">
        {nav.map(n => {
          const active = location.pathname === n.path;
          return <Link key={n.path} to={n.path} onClick={() => setOpen(false)}
            className={`relative flex items-center gap-3 rounded-xl px-4 py-3 text-[11px] font-extrabold uppercase tracking-[0.14em] transition-colors ${active ? 'bg-accent text-accent-foreground' : 'text-primary-foreground/70 hover:bg-primary-foreground/10'}`}>
            <n.icon className="w-4 h-4" />{n.title}
          </Link>;
        })}
      </nav>
      <div className="p-3 border-t border-primary-foreground/15 space-y-1">
        <Link to="/" className="flex items-center gap-2 rounded-xl px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-primary-foreground/70 hover:bg-primary-foreground/10"><ArrowLeft className="w-4 h-4" />Back to site</Link>
        <button onClick={signOut} className="w-full flex items-center gap-2 rounded-xl px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-primary-foreground/70 hover:bg-destructive hover:text-destructive-foreground transition-colors"><LogOut className="w-4 h-4" />Sign out</button>
      </div>
    </aside>

    <AnimatePresence>{open && <motion.button aria-label="Close menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-30 bg-primary/60 md:hidden" onClick={() => setOpen(false)} />}</AnimatePresence>

    <div className="flex-1 md:ml-64">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 md:px-7 h-16 flex items-center gap-4">
        <button onClick={() => setOpen(v => !v)} className="md:hidden rounded-full border border-border p-2" aria-label="Menu">{open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
        <div>
          <span className="text-[9px] font-extrabold uppercase tracking-[0.24em] text-accent">Admin</span>
          <h1 className="font-display text-xl font-bold leading-none">{nav.find(n => n.path === location.pathname)?.title || 'Newsroom'}</h1>
        </div>
      </header>
      <motion.main key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-7">{children}</motion.main>
    </div>
  </div>;
};
export default AdminLayout;
