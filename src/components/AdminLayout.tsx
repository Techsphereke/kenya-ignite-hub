import { useEffect, useState, ReactNode } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Flame, LayoutDashboard, FileText, Users, MessageSquare, ArrowLeft, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { title: 'Overview', path: '/admin', icon: LayoutDashboard },
  { title: 'Articles', path: '/admin/articles', icon: FileText },
  { title: 'Users', path: '/admin/users', icon: Users },
  { title: 'Comments', path: '/admin/comments', icon: MessageSquare },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { user, roles, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdmin = roles.includes('admin') || roles.includes('editor');

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate('/');
  }, [user, roles, loading, navigate, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background animated-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background animated-bg noise-overlay flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 glass-card border-r border-border/30 flex flex-col transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-border/30">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.4 }}>
              <Flame className="w-6 h-6 text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.4)]" />
            </motion.div>
            <span className="font-display font-bold text-foreground">Kenya <span className="gradient-text">Ignite</span></span>
          </Link>
          <p className="text-xs font-body text-muted-foreground mt-1 flex items-center gap-1.5">
            <div className="pulse-dot !w-[6px] !h-[6px]" /> Admin Panel
          </p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-body font-medium transition-all duration-300 ${
                  active
                    ? 'bg-primary/20 text-primary shadow-[0_0_15px_hsl(var(--primary)/0.15)]'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}>
                <item.icon className="w-4 h-4" />
                {item.title}
                {active && <motion.div layoutId="admin-active" className="absolute left-0 w-0.5 h-5 bg-primary rounded-full" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border/30 space-y-1">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-300">
            <ArrowLeft className="w-4 h-4" /> Back to site
          </Link>
          <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-300 text-left">
            Sign out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 md:ml-60 relative z-10">
        <header className="sticky top-0 z-20 glass-card border-b border-border/30 px-4 py-3 flex items-center gap-3 md:px-6">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 rounded-lg hover:bg-muted/50 transition-all">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-display font-bold text-foreground">
            {navItems.find(i => i.path === location.pathname)?.title || 'Admin'}
          </h1>
        </header>
        <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} key={location.pathname}
          className="p-4 md:p-6">
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default AdminLayout;
