import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { DbArticle, timeAgo } from '@/hooks/use-articles';
import { motion } from 'framer-motion';

interface ArticleCardProps {
  article: DbArticle;
  variant?: 'default' | 'featured' | 'compact' | 'horizontal';
}

const ArticleCard = ({ article, variant = 'default' }: ArticleCardProps) => {
  if (variant === 'compact') {
    return (
      <Link to={`/article/${article.slug}`} className="flex gap-3 group py-3 border-b border-border/30 last:border-0">
        {article.cover_image && <img src={article.cover_image} alt={article.title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0 transition-transform duration-500 group-hover:scale-105" loading="lazy" />}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-display font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {article.title}
          </h3>
          <span className="text-xs text-muted-foreground font-body mt-1 block">{timeAgo(article.published_at)}</span>
        </div>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <Link to={`/article/${article.slug}`} className="flex gap-4 group glass-card rounded-xl p-3 hover:glow-border transition-all duration-500">
          {article.cover_image && (
            <div className="overflow-hidden rounded-lg flex-shrink-0">
              <img src={article.cover_image} alt={article.title} className="w-32 h-24 md:w-48 md:h-32 object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
            </div>
          )}
          <div className="flex-1 min-w-0 py-1">
            {article.category_name && <span className="text-xs font-body font-semibold text-primary uppercase tracking-wider">{article.category_name}</span>}
            <h3 className="text-base md:text-lg font-display font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-300 mt-0.5">
              {article.title}
            </h3>
            <p className="text-sm text-muted-foreground font-body line-clamp-2 mt-1 hidden md:block">{article.excerpt}</p>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground font-body">
              <span>{article.author_name}</span>
              <span className="text-primary/40">·</span>
              <span>{timeAgo(article.published_at)}</span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  if (variant === 'featured') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
        <Link to={`/article/${article.slug}`} className="group relative block rounded-xl overflow-hidden glow-border">
          <img src={article.cover_image || '/placeholder.svg'} alt={article.title} className="w-full h-64 md:h-80 object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
            {article.category_name && <span className="text-xs font-body font-semibold text-primary-foreground/90 uppercase tracking-wider">{article.category_name}</span>}
            <h2 className="text-lg md:text-2xl font-display font-bold text-white leading-tight mt-1 group-hover:text-primary-foreground transition-colors duration-300">
              {article.title}
            </h2>
            <p className="text-sm text-foreground/60 font-body mt-1.5 line-clamp-2 hidden md:block">{article.excerpt}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-foreground/40 font-body">
              <span>{article.author_name}</span>
              <span className="text-primary/40">·</span>
              <Clock className="w-3 h-3" />
              <span>{article.reading_time} min read</span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Default card
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
      <Link to={`/article/${article.slug}`} className="group block">
        <div className="rounded-xl overflow-hidden glass-card hover:glow-border transition-all duration-500 hover:-translate-y-1">
          <div className="overflow-hidden">
            <img src={article.cover_image || '/placeholder.svg'} alt={article.title} className="w-full h-44 object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
          </div>
          <div className="p-4">
            {article.category_name && <span className="text-xs font-body font-semibold text-primary uppercase tracking-wider">{article.category_name}</span>}
            <h3 className="text-base font-display font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-300 mt-0.5">
              {article.title}
            </h3>
            <p className="text-sm text-muted-foreground font-body line-clamp-2 mt-1">{article.excerpt}</p>
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground font-body">
              <span>{article.author_name}</span>
              <span className="text-primary/40">·</span>
              <span>{timeAgo(article.published_at)}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ArticleCard;
