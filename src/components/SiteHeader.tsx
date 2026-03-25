import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Flame, User } from 'lucide-react';
import { categories } from '@/data/demo-data';
import { useAuth } from '@/contexts/AuthContext';
import { Shield } from 'lucide-react';

const SiteHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      {/* Top bar */}
      <div className="bg-foreground">
        <div className="container flex items-center justify-between py-1.5">
          <span className="text-xs font-body text-background/70">
            {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <span className="text-xs font-body text-background/50 hidden sm:block">
            Igniting Stories That Matter
          </span>
        </div>
      </div>

      {/* Main header */}
      <div className="container flex items-center justify-between py-3 md:py-4">
        <Link to="/" className="flex items-center gap-2 group">
          <Flame className="w-7 h-7 md:w-8 md:h-8 text-primary transition-transform group-hover:scale-110" />
          <div>
            <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight text-foreground leading-none">
              Kenya <span className="text-primary">Ignite</span>
            </h1>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-md hover:bg-muted transition-colors" aria-label="Search">
            <Search className="w-5 h-5 text-foreground" />
          </button>
          <Link to={user ? '/dashboard' : '/auth'} className="p-2 rounded-md hover:bg-muted transition-colors" aria-label={user ? 'Dashboard' : 'Sign in'}>
            <User className="w-5 h-5 text-foreground" />
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-md hover:bg-muted transition-colors md:hidden" aria-label="Menu">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="border-t border-border bg-card">
          <form onSubmit={handleSearch} className="container py-3">
            <div className="flex gap-2">
              <input
                type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="flex-1 px-4 py-2 rounded-md bg-muted border border-border text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-body font-medium hover:opacity-90 transition-opacity">
                Search
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category nav */}
      <nav className="border-t border-border hidden md:block">
        <div className="container flex items-center gap-6 py-2">
          {categories.map(cat => (
            <Link key={cat.id} to={`/category/${cat.slug}`}
              className="text-sm font-body font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
              {cat.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="border-t border-border md:hidden bg-card">
          <div className="container py-3 flex flex-col gap-2">
            {categories.map(cat => (
              <Link key={cat.id} to={`/category/${cat.slug}`}
                onClick={() => setMenuOpen(false)}
                className="py-2 text-sm font-body font-medium text-muted-foreground hover:text-primary transition-colors">
                {cat.name}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};

export default SiteHeader;
