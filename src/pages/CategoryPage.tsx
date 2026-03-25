import { useParams, Link } from 'react-router-dom';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ArticleCard from '@/components/ArticleCard';
import { useCategoryBySlug, useArticlesByCategory } from '@/hooks/use-articles';
import { ArrowLeft } from 'lucide-react';

const CategoryPage = () => {
  const { slug } = useParams();
  const { data: category, isLoading: catLoading } = useCategoryBySlug(slug || '');
  const { data: articles } = useArticlesByCategory(category?.id);

  if (catLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container py-20 text-center font-body text-muted-foreground">Loading...</div>
        <SiteFooter />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-display font-bold text-foreground">Category not found</h1>
          <Link to="/" className="text-primary font-body text-sm mt-4 inline-block hover:underline">← Back to Home</Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container py-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground font-body hover:text-primary mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground flex items-center gap-2 mb-6">
          <span className="w-1.5 h-8 bg-primary rounded-full" />
          {category.name}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(articles || []).map(a => <ArticleCard key={a.id} article={a} />)}
        </div>
        {(!articles || articles.length === 0) && (
          <p className="text-center text-muted-foreground font-body py-16">No articles in this category yet.</p>
        )}
      </div>
      <SiteFooter />
    </div>
  );
};

export default CategoryPage;
