import { useSearchParams, Link } from 'react-router-dom';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ArticleCard from '@/components/ArticleCard';
import { useSearchArticles, useCategories } from '@/hooks/use-articles';
import { Search as SearchIcon, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const { data: results, isLoading } = useSearchArticles(initialQuery);
  const { data: categories } = useCategories();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container py-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground font-body hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search articles by title, keyword, or tag..."
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-border text-foreground font-body focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-body font-medium hover:opacity-90 transition-opacity">
            Search
          </button>
        </form>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(categories || []).map(cat => (
            <button key={cat.id} onClick={() => { setQuery(cat.name); setSearchParams({ q: cat.name }); }}
              className="px-4 py-1.5 rounded-full bg-muted text-sm font-body font-medium text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
              {cat.name}
            </button>
          ))}
        </div>

        {initialQuery && !isLoading && (
          <p className="text-sm text-muted-foreground font-body mb-6">
            {(results || []).length} result{(results || []).length !== 1 ? 's' : ''} for "<span className="font-semibold text-foreground">{initialQuery}</span>"
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(results || []).map(a => <ArticleCard key={a.id} article={a} />)}
        </div>

        {initialQuery && !isLoading && (results || []).length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg font-display text-muted-foreground">No articles found</p>
            <p className="text-sm font-body text-muted-foreground mt-1">Try different keywords or browse categories above</p>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
};

export default SearchPage;
