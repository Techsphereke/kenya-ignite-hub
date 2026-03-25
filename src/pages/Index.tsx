import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import BreakingNewsTicker from '@/components/BreakingNewsTicker';
import ArticleCard from '@/components/ArticleCard';
import { useFeaturedArticles, useLatestArticles, useTrendingArticles, useCategories, useArticlesByCategory } from '@/hooks/use-articles';
import { TrendingUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CategorySection = ({ categoryId, categoryName, categorySlug }: { categoryId: string; categoryName: string; categorySlug: string }) => {
  const { data: articles } = useArticlesByCategory(categoryId);
  if (!articles || articles.length === 0) return null;

  return (
    <section className="container mt-12">
      <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full" />
          {categoryName}
        </h2>
        <Link to={`/category/${categorySlug}`} className="text-sm font-body font-medium text-primary hover:text-accent transition-colors duration-300 flex items-center gap-0.5 animated-underline">
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {articles.slice(0, 3).map(a => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
    </section>
  );
};

const Index = () => {
  const { data: featured } = useFeaturedArticles();
  const { data: latest } = useLatestArticles(8);
  const { data: trending } = useTrendingArticles();
  const { data: categories } = useCategories();

  return (
    <div className="min-h-screen bg-background animated-bg noise-overlay">
      <SiteHeader />
      <BreakingNewsTicker />

      <main className="relative z-10">
        {/* Featured Stories */}
        {featured && featured.length > 0 && (
          <section className="container mt-6 md:mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featured[0] && <ArticleCard article={featured[0]} variant="featured" />}
              <div className="grid grid-cols-1 gap-4">
                {featured.slice(1, 3).map(a => (
                  <ArticleCard key={a.id} article={a} variant="featured" />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Latest + Trending sidebar */}
        <section className="container mt-10 md:mt-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.h2 initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className="text-xl font-display font-bold text-foreground mb-5 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full" />
                Latest News
              </motion.h2>
              {latest && latest.length > 0 ? (
                <div className="space-y-4">
                  {latest.map(a => (
                    <ArticleCard key={a.id} article={a} variant="horizontal" />
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-xl p-12 text-center">
                  <p className="text-muted-foreground font-body">No published articles yet. Check back soon!</p>
                </div>
              )}
            </div>

            <aside>
              <motion.h2 initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className="text-xl font-display font-bold text-foreground mb-5 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Trending
              </motion.h2>
              <div className="glass-card rounded-xl p-4 shimmer">
                {trending && trending.length > 0 ? (
                  trending.map((a, i) => (
                    <div key={a.id} className="flex gap-3 py-3 border-b border-border/30 last:border-0">
                      <span className="text-2xl font-display font-bold gradient-text opacity-60">{String(i + 1).padStart(2, '0')}</span>
                      <ArticleCard article={a} variant="compact" />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground font-body py-4 text-center">No trending articles yet</p>
                )}
              </div>
            </aside>
          </div>
        </section>

        {/* Category sections */}
        {(categories || []).slice(0, 4).map(cat => (
          <CategorySection key={cat.id} categoryId={cat.id} categoryName={cat.name} categorySlug={cat.slug} />
        ))}
      </main>

      <SiteFooter />
    </div>
  );
};

export default Index;
