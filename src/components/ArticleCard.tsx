import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { DbArticle, timeAgo } from '@/hooks/use-articles';
import { motion } from 'framer-motion';

interface Props { article: DbArticle; variant?: 'default' | 'featured' | 'compact' | 'horizontal' }

const Meta = ({ article, light = false }: { article: DbArticle; light?: boolean }) => (
  <div className={`flex flex-wrap items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.16em] ${light ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
    <span>Our Correspondent</span><span>•</span>
    <span>{timeAgo(article.published_at)}</span>
  </div>
);

const ArticleCard = ({ article, variant = 'default' }: Props) => {
  // Sidebar brief: square thumbnail beside a tight headline
  if (variant === 'compact') return (
    <Link to={`/article/${article.slug}`} className="group flex gap-4 py-4 border-b border-border last:border-0">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
        <img src={article.cover_image || '/placeholder.svg'} alt={article.title} loading="lazy" className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
      </div>
      <div className="min-w-0">
        <span className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-accent">{article.category_name || 'News'}</span>
        <h3 className="font-display text-[15px] font-bold leading-tight mt-1 line-clamp-2 group-hover:text-accent transition-colors">{article.title}</h3>
        <div className="mt-1.5"><Meta article={article} /></div>
      </div>
    </Link>
  );

  if (variant === 'horizontal') return (
    <motion.article initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Link to={`/article/${article.slug}`} className="group grid grid-cols-[7.5rem_1fr] md:grid-cols-[14rem_1fr] gap-4 md:gap-7 py-6 border-t border-border">
        <div className="overflow-hidden rounded-xl aspect-[4/3] bg-muted">
          <img src={article.cover_image || '/placeholder.svg'} alt={article.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>
        <div className="flex flex-col justify-between py-1">
          <div>
            <span className="chip bg-muted text-accent">{article.category_name || 'News'}</span>
            <h3 className="font-display text-base md:text-2xl font-bold leading-tight mt-2 group-hover:text-accent transition-colors line-clamp-2">{article.title}</h3>
            <p className="hidden md:block text-sm text-muted-foreground mt-2 line-clamp-2">{article.excerpt}</p>
          </div>
          <div className="mt-3"><Meta article={article} /></div>
        </div>
      </Link>
    </motion.article>
  );

  // Lead story: full-bleed photo, ghost wordmark behind, overlay copy
  if (variant === 'featured') return (
    <motion.article initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group">
      <Link to={`/article/${article.slug}`} className="block">
        <div className="relative overflow-hidden rounded-2xl aspect-[4/5] md:aspect-[16/10] bg-muted image-reveal">
          <img src={article.cover_image || '/placeholder.svg'} alt={article.title} fetchPriority="high" decoding="async" className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/30 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="ghost-headline text-[22vw] md:text-[15vw]">Juba</span>
          </div>
          <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8 text-primary-foreground">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              {article.is_breaking && <span className="chip bg-destructive text-destructive-foreground">Breaking news</span>}
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/85">{article.category_name || 'Top story'}{article.reading_time ? ` • ${article.reading_time} min read` : ''}</span>
            </div>
            <h2 className="font-display text-2xl md:text-5xl font-bold leading-[1.05] max-w-2xl headline-reveal">{article.title}</h2>
            <p className="hidden md:block text-primary-foreground/80 mt-4 max-w-xl line-clamp-2">{article.excerpt}</p>
            <span className="pill-accent mt-6">Read article<ArrowRight className="w-4 h-4" /></span>
          </div>
        </div>
      </Link>
    </motion.article>
  );

  return (
    <motion.article initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group glass-card overflow-hidden">
      <Link to={`/article/${article.slug}`}>
        <div className="overflow-hidden aspect-[4/3] bg-muted">
          <img src={article.cover_image || '/placeholder.svg'} alt={article.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <span className="chip bg-muted text-accent">{article.category_name || 'News'}</span>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
          </div>
          <h3 className="font-display text-lg font-bold leading-tight mt-3 group-hover:text-accent transition-colors line-clamp-2">{article.title}</h3>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{article.excerpt}</p>
          <div className="mt-4"><Meta article={article} /></div>
        </div>
      </Link>
    </motion.article>
  );
};
export default ArticleCard;
