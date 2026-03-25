import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Article, getAuthor, getCategory, timeAgo } from '@/data/demo-data';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured' | 'compact' | 'horizontal';
}

const ArticleCard = ({ article, variant = 'default' }: ArticleCardProps) => {
  const author = getAuthor(article.authorId);
  const category = getCategory(article.categoryId);

  if (variant === 'compact') {
    return (
      <Link to={`/article/${article.slug}`} className="flex gap-3 group py-3 border-b border-border last:border-0">
        <img src={article.coverImage} alt={article.title} className="w-20 h-20 rounded-md object-cover flex-shrink-0" loading="lazy" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-display font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <span className="text-xs text-muted-foreground font-body mt-1 block">{timeAgo(article.publishedAt)}</span>
        </div>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link to={`/article/${article.slug}`} className="flex gap-4 group">
        <img src={article.coverImage} alt={article.title} className="w-32 h-24 md:w-48 md:h-32 rounded-md object-cover flex-shrink-0" loading="lazy" />
        <div className="flex-1 min-w-0">
          {category && <span className="text-xs font-body font-semibold text-primary uppercase">{category.name}</span>}
          <h3 className="text-base md:text-lg font-display font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors mt-0.5">
            {article.title}
          </h3>
          <p className="text-sm text-muted-foreground font-body line-clamp-2 mt-1 hidden md:block">{article.excerpt}</p>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground font-body">
            <span>{author?.name}</span>
            <span>·</span>
            <span>{timeAgo(article.publishedAt)}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link to={`/article/${article.slug}`} className="group relative block rounded-lg overflow-hidden">
        <img src={article.coverImage} alt={article.title} className="w-full h-64 md:h-80 object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          {category && <span className="text-xs font-body font-semibold text-primary uppercase">{category.name}</span>}
          <h2 className="text-lg md:text-2xl font-display font-bold text-background leading-tight mt-1 group-hover:text-primary transition-colors">
            {article.title}
          </h2>
          <p className="text-sm text-background/70 font-body mt-1.5 line-clamp-2 hidden md:block">{article.excerpt}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-background/60 font-body">
            <span>{author?.name}</span>
            <span>·</span>
            <Clock className="w-3 h-3" />
            <span>{article.readingTime} min read</span>
          </div>
        </div>
      </Link>
    );
  }

  // Default card
  return (
    <Link to={`/article/${article.slug}`} className="group block">
      <div className="rounded-lg overflow-hidden bg-card border border-border hover:shadow-lg transition-shadow">
        <img src={article.coverImage} alt={article.title} className="w-full h-44 object-cover" loading="lazy" />
        <div className="p-4">
          {category && <span className="text-xs font-body font-semibold text-primary uppercase">{category.name}</span>}
          <h3 className="text-base font-display font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors mt-0.5">
            {article.title}
          </h3>
          <p className="text-sm text-muted-foreground font-body line-clamp-2 mt-1">{article.excerpt}</p>
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground font-body">
            <span>{author?.name}</span>
            <span>·</span>
            <span>{timeAgo(article.publishedAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
