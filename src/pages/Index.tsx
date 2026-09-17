import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import BreakingNewsTicker from '@/components/BreakingNewsTicker';
import ArticleCard from '@/components/ArticleCard';
import { useFeaturedArticles,useLatestArticles,useTrendingArticles,useCategories,useArticlesByCategory } from '@/hooks/use-articles';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CategorySection=({categoryId,categoryName,categorySlug}:{categoryId:string;categoryName:string;categorySlug:string})=>{const {data:articles}=useArticlesByCategory(categoryId);if(!articles?.length)return null;return <section className="container mt-16 md:mt-24"><div className="section-kicker mb-6"><h2>{categoryName}</h2><Link to={`/category/${categorySlug}`} className="flex items-center gap-1 hover:text-primary">View all <ArrowRight className="w-3 h-3"/></Link></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">{articles.slice(0,3).map(a=><ArticleCard key={a.id} article={a}/>)}</div></section>};
const Index=()=>{const {data:featured}=useFeaturedArticles();const {data:latest}=useLatestArticles(8);const {data:trending}=useTrendingArticles();const {data:categories}=useCategories();const lead=featured?.[0]||latest?.[0];const briefs=(latest||[]).filter(a=>a.id!==lead?.id).slice(0,4);return <div className="min-h-screen editorial-shell pb-20 md:pb-0"><SiteHeader/><BreakingNewsTicker/><main className="relative z-10">
  <section className="container py-7 md:py-12"><div className="grid grid-cols-1 lg:grid-cols-12 gap-9 lg:gap-8 items-start">
    <aside className="order-2 lg:order-1 lg:col-span-3"><div className="section-kicker mb-1"><span>The latest</span><span>EAT</span></div>{briefs.map(a=><ArticleCard key={a.id} article={a} variant="compact"/>)}</aside>
    <div className="order-1 lg:order-2 lg:col-span-6 lg:px-3 max-w-xl mx-auto w-full">{lead?<ArticleCard article={lead} variant="featured"/>:<div className="aspect-[4/5] border border-foreground flex items-center justify-center font-mono text-xs uppercase">Stories are being prepared</div>}</div>
    <aside className="order-3 lg:col-span-3"><div className="section-kicker mb-1"><span>Trending</span><span>Now</span></div>{(trending||[]).slice(0,5).map((a,i)=><Link key={a.id} to={`/article/${a.slug}`} className="group grid grid-cols-[3rem_1fr] gap-3 py-4 border-b border-foreground/15"><span className="font-display text-4xl leading-none text-primary/25 group-hover:text-primary transition-colors">{String(i+1).padStart(2,'0')}</span><div><h3 className="font-display text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">{a.title}</h3><span className="font-mono text-[9px] uppercase text-muted-foreground mt-2 block">{a.category_name||'News'} • {a.views||0} views</span></div></Link>)}</aside>
  </div></section>
  <motion.section initial={{scaleX:0}} whileInView={{scaleX:1}} viewport={{once:true}} className="origin-left h-2 bg-gradient-to-r from-kenya-black via-kenya-red to-kenya-green mt-8"/>
  {(categories||[]).slice(0,4).map(c=><CategorySection key={c.id} categoryId={c.id} categoryName={c.name} categorySlug={c.slug}/>) }
</main><SiteFooter/></div>};
export default Index;
