import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import BreakingNewsTicker from '@/components/BreakingNewsTicker';
import ArticleCard from '@/components/ArticleCard';
import RotatingBadge from '@/components/RotatingBadge';
import { useFeaturedArticles, useLatestArticles, useTrendingArticles, useCategories, useArticlesByCategory } from '@/hooks/use-articles';
import { ArrowRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CategorySection = ({ categoryId, categoryName, categorySlug }: { categoryId: string; categoryName: string; categorySlug: string }) => {
  const { data: articles } = useArticlesByCategory(categoryId);
  if (!articles?.length) return null;
  return <section className="mt-16 md:mt-24">
    <div className="section-kicker mb-7"><h2 className="font-display text-xl md:text-2xl">{categoryName}</h2><Link to={`/category/${categorySlug}`} className="flex items-center gap-1 text-accent hover:gap-2 transition-all">View all <ArrowRight className="w-3 h-3" /></Link></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">{articles.slice(0, 3).map(a => <ArticleCard key={a.id} article={a} />)}</div>
  </section>;
};

const Index = () => {
  const { data: featured } = useFeaturedArticles();
  const { data: latest } = useLatestArticles(10);
  const { data: trending } = useTrendingArticles();
  const { data: categories } = useCategories();
  const lead = featured?.[0] || latest?.[0];
  const secondary = (latest || []).filter(a => a.id !== lead?.id).slice(0, 4);
  const deeper = (latest || []).filter(a => a.id !== lead?.id).slice(4, 8);

  return <div className="min-h-screen bg-muted">
    <div className="paper-frame editorial-shell md:my-6">
      <SiteHeader />
      <BreakingNewsTicker />
      <main className="relative z-10 px-4 md:px-10 pb-10">
        {/* Lead story + sidebar feed */}
        <section className="py-7 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-9 lg:gap-10 items-start">
            <div className="lg:col-span-8 relative">
              {lead ? <ArticleCard article={lead} variant="featured" /> : <div className="aspect-[16/10] rounded-2xl bg-muted grid place-items-center text-xs font-extrabold uppercase tracking-[0.2em] text-muted-foreground">Stories are being prepared</div>}
              <RotatingBadge className="hidden lg:block absolute top-5 right-5 h-24 w-24 text-primary-foreground" />
            </div>
            <aside className="lg:col-span-4">
              <div className="section-kicker mb-2"><span>The latest</span><span className="text-accent">Juba</span></div>
              {secondary.map(a => <ArticleCard key={a.id} article={a} variant="compact" />)}
              <div className="mt-7 rounded-2xl bg-primary text-primary-foreground p-6">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-primary-foreground/60">Chronicle briefing</span>
                <h3 className="font-display text-2xl font-bold leading-tight mt-2">The stories that shape South Sudan, every morning.</h3>
                <div className="mt-5 flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2">
                  <Mail className="w-4 h-4 text-accent" />
                  <input placeholder="Your email address" className="flex-1 min-w-0 bg-transparent text-sm placeholder:text-primary-foreground/50 focus:outline-none" />
                </div>
                <button className="pill-accent w-full mt-3 justify-center">Subscribe<ArrowRight className="w-4 h-4" /></button>
              </div>
            </aside>
          </div>
        </section>

        {/* Ranked trending strip */}
        <section className="mt-6 border-y border-border py-9">
          <div className="section-kicker mb-6"><h2 className="font-display text-xl md:text-2xl">Most read</h2><span>Updated hourly</span></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8">
            {(trending || []).slice(0, 4).map((a, i) => (
              <Link key={a.id} to={`/article/${a.slug}`} className="group grid grid-cols-[3.25rem_1fr] gap-3 py-4 border-b border-border sm:border-b-0">
                <span className="font-display text-4xl font-black leading-none text-accent/30 group-hover:text-accent transition-colors">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-display text-[15px] font-bold leading-tight group-hover:text-accent transition-colors line-clamp-3">{a.title}</h3>
                  <span className="block mt-2 text-[9px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">{a.category_name || 'News'} • {timeAgo(a.published_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Deeper reading */}
        {deeper.length > 0 && <section className="mt-16">
          <div className="section-kicker mb-2"><h2 className="font-display text-xl md:text-2xl">More from the newsroom</h2><Link to="/search" className="text-accent">Archive</Link></div>
          {deeper.map(a => <ArticleCard key={a.id} article={a} variant="horizontal" />)}
        </section>}

        <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} className="origin-left h-1.5 rounded-full bg-accent mt-16" />

        {(categories || []).slice(0, 4).map(c => <CategorySection key={c.id} categoryId={c.id} categoryName={c.name} categorySlug={c.slug} />)}
      </main>
      <SiteFooter />
    </div>
  </div>;
};
export default Index;
