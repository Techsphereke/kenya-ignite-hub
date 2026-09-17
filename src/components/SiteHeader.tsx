import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User, Shield, ArrowRight } from 'lucide-react';
import { useCategories } from '@/hooks/use-articles';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const SiteHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  const { data: categories } = useCategories();
  const isAdmin = roles.includes('admin') || roles.includes('editor');
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) { navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); setSearchOpen(false); setSearchQuery(''); }
  };

  return <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
    {/* Utility bar */}
    <div className="hidden md:block border-b border-border">
      <div className="container flex items-center justify-between py-2.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">
        <div className="flex items-center gap-6">
          <span>Edition: Juba, South Sudan</span>
          <span className="flex items-center gap-2 text-destructive"><i className="pulse-dot" />Live newsroom</span>
        </div>
        <div className="flex items-center gap-6">
          <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          <Link to="/search" className="animated-underline">Archive</Link>
        </div>
      </div>
    </div>

    {/* Masthead */}
    <div className="container relative flex items-center justify-between gap-4 py-4 md:py-9">
      <div className="flex-1 md:hidden" />
      <Link to="/" className="md:absolute md:left-1/2 md:-translate-x-1/2 text-center" aria-label="Juba Chronicle home">
        <span className="block font-display text-[1.65rem] sm:text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-none">
          Juba<span className="text-accent">.</span>Chronicle
        </span>
        <span className="hidden md:block mt-2 text-[10px] font-extrabold uppercase tracking-[0.45em] text-muted-foreground">The pulse of the nation</span>
      </Link>
      <div className="flex flex-1 items-center justify-end gap-1">
        <button onClick={() => setSearchOpen(v => !v)} className="grid place-items-center h-10 w-10 rounded-full hover:bg-muted transition-colors" aria-label="Search"><Search className="w-5 h-5" /></button>
        {isAdmin && <Link to="/admin" className="hidden md:grid place-items-center h-10 w-10 rounded-full text-accent hover:bg-muted" aria-label="Admin"><Shield className="w-5 h-5" /></Link>}
        <Link to={user ? '/dashboard' : '/auth'} className="hidden md:grid place-items-center h-10 w-10 rounded-full hover:bg-muted" aria-label={user ? 'Dashboard' : 'Sign in'}><User className="w-5 h-5" /></Link>
        <button onClick={() => setMenuOpen(v => !v)} className="grid place-items-center h-10 w-10 rounded-full border border-border md:hidden" aria-label="Menu">{menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
      </div>
    </div>

    {/* Category rail */}
    <nav className="hidden md:block border-t border-border">
      <div className="container flex items-center justify-center gap-3 py-2.5 overflow-x-auto">
        {(categories || []).map(c => (
          <Link key={c.id} to={`/category/${c.slug}`} className="chip whitespace-nowrap border border-border text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">{c.name}</Link>
        ))}
      </div>
    </nav>

    <AnimatePresence>{searchOpen && (
      <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} onSubmit={handleSearch} className="overflow-hidden border-t border-border bg-muted">
        <div className="container py-4 flex gap-2">
          <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search the Chronicle archive" className="flex-1 rounded-full bg-background border border-border px-5 py-3 focus:outline-none focus:border-accent" />
          <button className="pill-accent" aria-label="Submit search">Search<ArrowRight className="w-4 h-4" /></button>
        </div>
      </motion.form>
    )}</AnimatePresence>

    <AnimatePresence>{menuOpen && (
      <motion.nav initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-border md:hidden">
        <div className="container py-4 grid grid-cols-2 gap-2">
          {(categories || []).map(c => (
            <Link key={c.id} onClick={() => setMenuOpen(false)} to={`/category/${c.slug}`} className="rounded-xl bg-muted px-4 py-3 font-display text-sm font-bold uppercase">{c.name}</Link>
          ))}
        </div>
      </motion.nav>
    )}</AnimatePresence>
  </header>;
};
export default SiteHeader;
