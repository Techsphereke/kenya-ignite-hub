import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { useCategories } from '@/hooks/use-articles';

const SiteFooter = () => {
  const { data: categories } = useCategories();

  return (
    <footer className="relative mt-16 border-t border-border/30">
      {/* Gradient top edge */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="relative bg-gradient-to-b from-card/80 to-background">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-6 h-6 text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.4)]" />
                <span className="text-lg font-display font-bold text-foreground">Kenya <span className="gradient-text">Ignite</span></span>
              </div>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                Igniting Stories That Matter. Your trusted source for Kenyan and East African news, analysis, and insights.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-body font-semibold text-foreground mb-3 uppercase tracking-wider">Categories</h3>
              <div className="flex flex-col gap-1.5">
                {(categories || []).map(cat => (
                  <Link key={cat.id} to={`/category/${cat.slug}`} className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 font-body animated-underline w-fit">
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-body font-semibold text-foreground mb-3 uppercase tracking-wider">Connect</h3>
              <div className="flex flex-col gap-1.5 text-sm text-muted-foreground font-body">
                <span>info@kenyaignite.co.ke</span>
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>
          <div className="border-t border-border/30 mt-8 pt-6 text-center">
            <p className="text-xs text-muted-foreground/60 font-body">© {new Date().getFullYear()} Kenya Ignite. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
