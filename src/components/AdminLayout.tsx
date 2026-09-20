import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, FileText, Users, MessageSquare, ArrowLeft, LogOut, Menu, X, PlusSquare, Image, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

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

  const pageTitle = nav.find(n => n.path === location.pathname)?.title || 'Newsroom';
  return <div className="newsroom-workspace min-h-screen bg-newsroom-canvas text-newsroom-ink flex">
    <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-newsroom-sidebar text-newsroom-sidebarText flex flex-col transition-transform duration-200 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="px-5 py-5 border-b border-newsroom-sidebarLine">
        <Link to="/" className="font-newsroom-heading text-xl font-bold text-newsroom-sidebarActive">Juba Chronicle</Link>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-newsroom-sidebarMuted">Newsroom admin</p>
      </div>
      <nav className="flex-1 py-3">
        {nav.map(n => {
          const active = location.pathname === n.path;
          return <Link key={n.path} to={n.path} onClick={() => setOpen(false)}
            className={`relative flex items-center gap-3 border-l-4 px-5 py-2.5 text-sm transition-colors ${active ? 'border-newsroom-blue bg-newsroom-sidebarHover text-newsroom-sidebarActive' : 'border-transparent text-newsroom-sidebarText hover:bg-newsroom-sidebarHover hover:text-newsroom-sidebarActive'}`}>
            <n.icon className="w-4 h-4" />{n.title}
          </Link>;
        })}
        <Link to="/dashboard" className="flex items-center gap-3 border-l-4 border-transparent px-6 py-2.5 text-sm text-newsroom-sidebarText hover:bg-newsroom-sidebarHover hover:text-newsroom-sidebarActive"><PlusSquare className="h-4 w-4" />Add New</Link>
        <div className="flex items-center gap-3 px-6 py-2.5 text-sm text-newsroom-sidebarMuted"><Image className="h-4 w-4" />Media</div>
      </nav>
      <div className="p-3 border-t border-newsroom-sidebarLine space-y-1">
        <Button asChild variant="ghost" size="sm" className="w-full justify-start text-newsroom-sidebarText hover:bg-newsroom-sidebarHover hover:text-newsroom-sidebarActive"><Link to="/"><ArrowLeft />Back to site</Link></Button>
        <Button onClick={signOut} variant="ghost" size="sm" className="w-full justify-start text-newsroom-sidebarText hover:bg-newsroom-sidebarHover hover:text-newsroom-sidebarActive"><LogOut />Sign out</Button>
      </div>
    </aside>

    <AnimatePresence>{open && <motion.button aria-label="Close menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-30 bg-newsroom-overlay md:hidden" onClick={() => setOpen(false)} />}</AnimatePresence>

    <div className="flex-1 md:ml-60">
      <header className="sticky top-0 z-20 bg-newsroom-surface border-b border-newsroom-line px-3 md:px-6 h-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button onClick={() => setOpen(v => !v)} variant="ghost" size="icon" className="md:hidden" aria-label="Menu">{open ? <X /> : <Menu />}</Button>
          <h1 className="font-newsroom-heading text-base font-semibold">{pageTitle}</h1>
        </div>
        <Link to="/" className="flex items-center gap-1 text-xs text-newsroom-muted hover:text-newsroom-blue">View site <ExternalLink className="h-3.5 w-3.5" /></Link>
      </header>
      <motion.main key={location.pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-7">{children}</motion.main>
    </div>
  </div>;
};
export default AdminLayout;
