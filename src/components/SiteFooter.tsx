import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { useCategories } from '@/hooks/use-articles';

const SiteFooter = () => {
  const { data: categories } = useCategories();

  return (
    <footer className="bg-foreground mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-6 h-6 text-primary" />
              <span className="text-lg font-display font-bold text-background">Kenya <span className="text-primary">Ignite</span></span>
            </div>
            <p className="text-sm text-background/60 font-body leading-relaxed">
              Igniting Stories That Matter. Your trusted source for Kenyan and East African news, analysis, and insights.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-body font-semibold text-background mb-3 uppercase tracking-wider">Categories</h3>
            <div className="flex flex-col gap-1.5">
              {(categories || []).map(cat => (
                <Link key={cat.id} to={`/category/${cat.slug}`} className="text-sm text-background/60 hover:text-primary transition-colors font-body">
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-body font-semibold text-background mb-3 uppercase tracking-wider">Connect</h3>
            <div className="flex flex-col gap-1.5 text-sm text-background/60 font-body">
              <span>info@kenyaignite.co.ke</span>
              <span>Nairobi, Kenya</span>
            </div>
          </div>
        </div>
        <div className="border-t border-background/10 mt-8 pt-6 text-center">
          <p className="text-xs text-background/40 font-body">© {new Date().getFullYear()} Kenya Ignite. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
