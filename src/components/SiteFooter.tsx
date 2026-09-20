import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useCategories } from '@/hooks/use-articles';

const SiteFooter = () => {
  const { data: categories } = useCategories();
  return <footer className="relative z-10 mt-24 bg-primary text-primary-foreground">
    <div className="h-1.5 bg-accent" />
    <div className="container py-14">
      <div className="grid md:grid-cols-12 gap-10">
        <div className="md:col-span-6">
          <span className="font-display text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none">Juba<span className="text-accent">.</span>Chronicle</span>
          <p className="max-w-md mt-5 text-primary-foreground/70">Independent journalism from Juba. Reporting the stories shaping South Sudan and the region.</p>
        </div>
        <div className="md:col-span-3">
          <h3 className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-primary-foreground/50 mb-4">Sections</h3>
          <div className="grid grid-cols-2 gap-2">
            {(categories || []).map(c => <Link key={c.id} to={`/category/${c.slug}`} className="text-sm hover:text-accent transition-colors">{c.name}</Link>)}
          </div>
        </div>
        <div className="md:col-span-3">
          <h3 className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-primary-foreground/50 mb-4">Contact us</h3>
          <a href="mailto:jubachronicle643@gmail.com" className="flex items-center gap-2 text-sm hover:text-accent transition-colors">jubachronicle643@gmail.com <ArrowUpRight className="w-4 h-4 shrink-0" /></a>
          <p className="text-sm text-primary-foreground/60 mt-2">Juba, South Sudan</p>
        </div>
      </div>
      <div className="border-t border-primary-foreground/20 mt-12 pt-5 flex justify-between text-[9px] font-extrabold uppercase tracking-[0.24em] text-primary-foreground/50">
        <span>© {new Date().getFullYear()} Juba Chronicle</span>
        <span>The pulse of the nation</span>
      </div>
    </div>
  </footer>;
};
export default SiteFooter;
