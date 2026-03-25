import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { getBreakingNews } from '@/data/demo-data';

const BreakingNewsTicker = () => {
  const breaking = getBreakingNews();
  if (breaking.length === 0) return null;

  const items = [...breaking, ...breaking]; // duplicate for seamless loop

  return (
    <div className="bg-primary overflow-hidden">
      <div className="container flex items-center">
        <div className="flex items-center gap-1.5 py-2 px-3 bg-foreground flex-shrink-0 z-10">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-body font-bold text-background uppercase tracking-wider">Breaking</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="ticker-scroll flex items-center gap-12 whitespace-nowrap py-2 px-4">
            {items.map((article, i) => (
              <Link key={`${article.id}-${i}`} to={`/article/${article.slug}`}
                className="text-sm font-body font-medium text-primary-foreground hover:underline">
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
