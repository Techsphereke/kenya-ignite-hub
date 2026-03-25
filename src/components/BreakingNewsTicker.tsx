import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { useBreakingArticles } from '@/hooks/use-articles';

const BreakingNewsTicker = () => {
  const { data: breaking } = useBreakingArticles();
  if (!breaking || breaking.length === 0) return null;

  const items = [...breaking, ...breaking];

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b border-primary/20">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent animate-pulse" />
      <div className="container flex items-center relative">
        <div className="flex items-center gap-1.5 py-2.5 px-4 bg-primary/20 backdrop-blur-sm flex-shrink-0 z-10 border-r border-primary/20">
          <Zap className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span className="text-xs font-body font-bold text-primary uppercase tracking-wider">Breaking</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="ticker-scroll flex items-center gap-12 whitespace-nowrap py-2.5 px-4">
            {items.map((article, i) => (
              <Link key={`${article.id}-${i}`} to={`/article/${article.slug}`}
                className="text-sm font-body font-medium text-foreground/80 hover:text-primary transition-colors duration-300">
                {article.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakingNewsTicker;
