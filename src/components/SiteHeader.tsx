import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Flame, User, Shield, Sun, Moon } from 'lucide-react';
import { useCategories } from '@/hooks/use-articles';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

const SiteHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  const isAdmin = roles.includes('admin') || roles.includes('editor');
  const { data: categories } = useCategories();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-border/50">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-primary/20 via-accent/10 to-secondary/20">
        <div className="container flex items-center justify-between py-1.5">
          <span className="text-xs font-body text-foreground/50">
            {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <div className="flex items-center gap-2">
            <div className="pulse-dot" />
            <span className="text-xs font-body text-foreground/50 hidden sm:block">
              Live • Igniting Stories That Matter
            </span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container flex items-center justify-between py-3 md:py-4">
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }} transition={{ duration: 0.5 }}>
            <Flame className="w-7 h-7 md:w-8 md:h-8 text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
          </motion.div>
          <div>
            <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight leading-none">
              Kenya <span className="gradient-text">Ignite</span>
            </h1>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          {[
            { onClick: () => setSearchOpen(!searchOpen), icon: Search, label: 'Search', show: true },
            { to: '/admin', icon: Shield, label: 'Admin', show: isAdmin, highlight: true },
            { to: user ? '/dashboard' : '/auth', icon: User, label: user ? 'Dashboard' : 'Sign in', show: true },
          ].filter(i => i.show).map((item, idx) => {
            const Icon = item.icon;
            const cls = `p-2 rounded-lg transition-all duration-300 hover:bg-primary/10 hover:shadow-[0_0_15px_hsl(var(--primary)/0.2)] ${item.highlight ? 'text-primary' : 'text-foreground/70 hover:text-foreground'}`;
            if ('to' in item && item.to) {
              return <Link key={idx} to={item.to} className={cls} aria-label={item.label}><Icon className="w-5 h-5" /></Link>;
            }
            return <button key={idx} onClick={item.onClick} className={cls} aria-label={item.label}><Icon className="w-5 h-5" /></button>;
          })}
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-primary/10 transition-all duration-300 md:hidden" aria-label="Menu">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
            className="border-t border-border/50 overflow-hidden">
            <form onSubmit={handleSearch} className="container py-3">
              <div className="flex gap-2">
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="flex-1 px-4 py-2.5 rounded-lg bg-muted/50 border border-border/50 text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  autoFocus />
                <button type="submit" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-body font-medium hover:glow-primary transition-all duration-300">
                  Search
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category nav */}
      <nav className="border-t border-border/30 hidden md:block">
        <div className="container flex items-center gap-6 py-2.5">
          {(categories || []).map(cat => (
            <Link key={cat.id} to={`/category/${cat.slug}`}
              className="text-sm font-body font-medium text-muted-foreground animated-underline hover:text-foreground transition-colors duration-300 whitespace-nowrap">
              {cat.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
            className="border-t border-border/30 md:hidden overflow-hidden">
            <div className="container py-3 flex flex-col gap-1">
              {(categories || []).map((cat, i) => (
                <motion.div key={cat.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/category/${cat.slug}`} onClick={() => setMenuOpen(false)}
                    className="py-2.5 px-3 rounded-lg text-sm font-body font-medium text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all block">
                    {cat.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default SiteHeader;
