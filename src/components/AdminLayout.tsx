import { useEffect, useState, ReactNode } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Flame, LayoutDashboard, FileText, Users, MessageSquare, ArrowLeft, Menu, X } from 'lucide-react';

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
    return <div className="min-h-screen bg-background flex items-center justify-center font-body text-muted-foreground">Loading...</div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-card border-r border-border flex flex-col transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-foreground">Kenya <span className="text-primary">Ignite</span></span>
          </Link>
          <p className="text-xs font-body text-muted-foreground mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-body font-medium transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                <item.icon className="w-4 h-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-body text-muted-foreground hover:bg-muted">
            <ArrowLeft className="w-4 h-4" /> Back to site
          </Link>
          <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-body text-muted-foreground hover:bg-muted text-left">
            Sign out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-foreground/30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 md:ml-60">
        <header className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3 md:px-6">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 rounded-md hover:bg-muted">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-display font-bold text-foreground">
            {navItems.find(i => i.path === location.pathname)?.title || 'Admin'}
          </h1>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
