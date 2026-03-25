import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Flame, User, Shield } from 'lucide-react';
import { useCategories } from '@/hooks/use-articles';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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
      {/* Top bar — hidden on mobile for cleaner app feel */}
      <div className="bg-gradient-to-r from-primary/20 via-accent/10 to-secondary/20 hidden md:block">
        <div className="container flex items-center justify-between py-1.5">
          <span className="text-xs font-body text-foreground/50">
            {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <div className="flex items-center gap-2">
            <div className="pulse-dot" />
            <span className="text-xs font-body text-foreground/50">
              Live • Igniting Stories That Matter
            </span>
          </div>
        </div>
      </div>

      {/* Main header — compact on mobile */}
      <div className="container flex items-center justify-between py-2 md:py-4">
        <Link to="/" className="flex items-center gap-1.5 md:gap-2 group">
          <motion.div
            animate={{
              rotate: [-2, 2, -1, 3, -2],
              scale: [1, 1.08, 0.97, 1.05, 1],
              y: [0, -2, 1, -3, 0],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.15 }}
            className="relative"
          >
            <Flame className="w-7 h-7 md:w-11 md:h-11 text-[hsl(15,95%,50%)] drop-shadow-[0_0_12px_rgba(255,80,0,0.7)]" strokeWidth={2.2} />
            <motion.div
              animate={{
                opacity: [0.4, 0.8, 0.3, 0.9, 0.4],
                scale: [0.8, 1.1, 0.9, 1.05, 0.8],
              }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Flame className="w-4 h-4 md:w-6 md:h-6 text-[hsl(40,100%,55%)] drop-shadow-[0_0_6px_rgba(255,200,0,0.6)]" strokeWidth={2} />
            </motion.div>
          </motion.div>
          <div>
            <h1 className="text-xl md:text-3xl font-display font-bold tracking-tight leading-none">
              Kenya <span className="text-[hsl(20,90%,50%)]">Ignite</span>
            </h1>
          </div>
        </Link>

        <div className="flex items-center gap-0.5">
          {/* Search button — visible on mobile header */}
          <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-lg transition-all duration-300 hover:bg-primary/10 text-foreground/70 hover:text-foreground" aria-label="Search">
            <Search className="w-5 h-5" />
          </button>

          {/* Admin — desktop + mobile if admin */}
          {isAdmin && (
            <Link to="/admin" className="p-2 rounded-lg transition-all duration-300 hover:bg-primary/10 text-primary hidden md:flex" aria-label="Admin">
              <Shield className="w-5 h-5" />
            </Link>
          )}

          {/* User — desktop only (mobile uses bottom nav) */}
          <Link to={user ? '/dashboard' : '/auth'} className="p-2 rounded-lg transition-all duration-300 hover:bg-primary/10 text-foreground/70 hover:text-foreground hidden md:flex" aria-label={user ? 'Dashboard' : 'Sign in'}>
            <User className="w-5 h-5" />
          </Link>

          {/* Mobile menu toggle */}
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
            <form onSubmit={handleSearch} className="container py-2 md:py-3">
              <div className="flex gap-2">
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="flex-1 px-3 md:px-4 py-2 md:py-2.5 rounded-lg bg-muted/50 border border-border/50 text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  autoFocus />
                <button type="submit" className="px-4 md:px-5 py-2 md:py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-body font-medium hover:glow-primary transition-all duration-300">
                  Search
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category nav — desktop only */}
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

      {/* Mobile menu — categories */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
            className="border-t border-border/30 md:hidden overflow-hidden">
            <div className="container py-2 flex flex-col gap-0.5">
              {(categories || []).map((cat, i) => (
                <motion.div key={cat.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/category/${cat.slug}`} onClick={() => setMenuOpen(false)}
                    className="py-2.5 px-3 rounded-lg text-sm font-body font-medium text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all block">
                    {cat.name}
                  </Link>
                </motion.div>
              ))}
              {isAdmin && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (categories?.length || 0) * 0.05 }}>
                  <Link to="/admin" onClick={() => setMenuOpen(false)}
                    className="py-2.5 px-3 rounded-lg text-sm font-body font-medium text-primary hover:bg-primary/10 transition-all block flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Admin Panel
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default SiteHeader;
