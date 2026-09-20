import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import { LayoutDashboard, FileText, PlusSquare, Image, MessageSquare, UserRound, ExternalLink, LogOut, Menu, X } from 'lucide-react';

type AuthorDashboardLayoutProps = {
  children: ReactNode;
  active: 'dashboard' | 'posts' | 'new' | 'media' | 'comments' | 'profile';
  onDashboard: () => void;
  onNewPost: () => void;
  onNavigate: (view: 'dashboard' | 'posts' | 'media' | 'comments' | 'profile') => void;
};

const AuthorDashboardLayout = ({ children, active, onDashboard, onNewPost, onNavigate }: AuthorDashboardLayoutProps) => {
  const { profile, user, roles, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const name = profile?.display_name || user?.email || 'Contributor';
  const initial = name.charAt(0).toUpperCase();
  const nav = [
    { label: 'Dashboard', icon: LayoutDashboard, key: 'dashboard' as const, action: () => onNavigate('dashboard') },
    { label: 'Posts', icon: FileText, key: 'posts' as const, action: () => onNavigate('posts') },
    { label: 'Add New', icon: PlusSquare, key: 'new' as const, action: onNewPost },
  ];

  return (
    <div className="newsroom-workspace min-h-screen bg-newsroom-canvas text-newsroom-ink">
      <SEO title="Author workspace" noindex />
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-newsroom-sidebar text-newsroom-sidebarText transition-transform duration-200 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="border-b border-newsroom-sidebarLine px-5 py-5">
          <Link to="/" className="font-newsroom-heading text-xl font-bold text-newsroom-sidebarActive">Juba Chronicle</Link>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-newsroom-sidebarMuted">Author workspace</p>
        </div>
        <nav className="flex-1 py-3">
          {nav.map(item => {
            const Icon = item.icon;
            const selected = active === item.key;
            return <Button key={item.key} variant="ghost" onClick={() => { item.action(); setOpen(false); }} className={`h-auto w-full justify-start rounded-none border-l-4 px-5 py-2.5 text-left text-sm ${selected ? 'border-newsroom-blue bg-newsroom-sidebarHover text-newsroom-sidebarActive' : 'border-transparent text-newsroom-sidebarText hover:bg-newsroom-sidebarHover hover:text-newsroom-sidebarActive'}`}><Icon className="h-4 w-4" />{item.label}</Button>;
          })}
          <div className="my-3 border-t border-newsroom-sidebarLine" />
          {[
            { label: 'Media', icon: Image, key: 'media' as const },
            { label: 'Comments', icon: MessageSquare, key: 'comments' as const },
            { label: 'Profile', icon: UserRound, key: 'profile' as const },
          ].map(item => <Button key={item.key} variant="ghost" onClick={() => { onNavigate(item.key); setOpen(false); }} className={`h-auto w-full justify-start rounded-none border-l-4 px-5 py-2.5 text-sm ${active === item.key ? 'border-newsroom-blue bg-newsroom-sidebarHover text-newsroom-sidebarActive' : 'border-transparent text-newsroom-sidebarText hover:bg-newsroom-sidebarHover hover:text-newsroom-sidebarActive'}`}><item.icon className="h-4 w-4" />{item.label}</Button>)}
          {(roles.includes('admin') || roles.includes('editor')) && <Link to="/admin" className="mt-3 flex items-center gap-3 border-l-4 border-newsroom-danger bg-newsroom-sidebarHover px-6 py-2.5 text-sm font-semibold text-newsroom-sidebarActive"><LayoutDashboard className="h-4 w-4" />Admin panel</Link>}
        </nav>
        <div className="border-t border-newsroom-sidebarLine p-4">
          <div className="mb-3 flex items-center gap-3 px-2">
            <span className="grid h-8 w-8 place-items-center rounded-sm bg-newsroom-blue text-xs font-bold text-newsroom-sidebarActive">{initial}</span>
            <div className="min-w-0"><p className="truncate text-sm font-semibold text-newsroom-sidebarActive">{name}</p><p className="text-xs text-newsroom-sidebarMuted">Contributor</p></div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut} className="w-full justify-start text-newsroom-sidebarText hover:bg-newsroom-sidebarHover hover:text-newsroom-sidebarActive"><LogOut />Sign out</Button>
        </div>
      </aside>
      {open && <button aria-label="Close menu" className="fixed inset-0 z-40 bg-newsroom-overlay md:hidden" onClick={() => setOpen(false)} />}
      <div className="min-h-screen md:ml-60">
        <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-newsroom-line bg-newsroom-surface px-3 md:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(value => !value)} aria-label="Open menu">{open ? <X /> : <Menu />}</Button>
            <span className="font-newsroom-heading text-sm font-semibold">Juba Chronicle</span>
          </div>
          <Link to="/" className="flex items-center gap-1 text-xs text-newsroom-muted hover:text-newsroom-blue">View site <ExternalLink className="h-3.5 w-3.5" /></Link>
        </header>
        {children}
      </div>
    </div>
  );
};

export default AuthorDashboardLayout;