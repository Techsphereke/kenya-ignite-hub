import { useParams, Link } from 'react-router-dom';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ArticleCard from '@/components/ArticleCard';
import { getArticleBySlug, getAuthor, getCategory, getArticleComments, formatDate, getLatestArticles, Comment as CommentType } from '@/data/demo-data';
import { Clock, Share2, Facebook, Twitter, ArrowLeft, MessageCircle, Eye } from 'lucide-react';

const CommentItem = ({ comment, replies }: { comment: CommentType; replies: CommentType[] }) => (
  <div className="py-4 border-b border-border last:border-0">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-sm font-body font-semibold text-foreground">{comment.authorName}</span>
      <span className="text-xs text-muted-foreground font-body">{formatDate(comment.createdAt)}</span>
    </div>
    <p className="text-sm font-body text-foreground/80 leading-relaxed">{comment.content}</p>
    {replies.length > 0 && (
      <div className="ml-6 mt-3 border-l-2 border-border pl-4">
        {replies.map(r => <CommentItem key={r.id} comment={r} replies={[]} />)}
      </div>
    )}
  </div>
);

const ArticlePage = () => {
  const { slug } = useParams();
  const article = getArticleBySlug(slug || '');

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-display font-bold text-foreground">Article not found</h1>
          <Link to="/" className="text-primary font-body text-sm mt-4 inline-block hover:underline">← Back to Home</Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const author = getAuthor(article.authorId);
  const category = getCategory(article.categoryId);
  const allComments = getArticleComments(article.id);
  const topLevel = allComments.filter(c => !c.parentId);
  const related = getLatestArticles().filter(a => a.id !== article.id && a.categoryId === article.categoryId).slice(0, 3);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <article className="container max-w-3xl py-6 md:py-10">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground font-body hover:text-primary transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {category && <span className="text-xs font-body font-bold text-primary uppercase tracking-wider">{category.name}</span>}
        <h1 className="text-2xl md:text-4xl font-display font-bold text-foreground leading-tight mt-1">{article.title}</h1>

        <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-muted-foreground font-body">
          {author && (
            <div className="flex items-center gap-2">
              <img src={author.avatar} alt={author.name} className="w-8 h-8 rounded-full object-cover" />
              <span className="font-medium text-foreground">{author.name}</span>
            </div>
          )}
          <span>·</span>
          <span>{formatDate(article.publishedAt)}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{article.readingTime} min read</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{article.views.toLocaleString()} views</span>
        </div>

        <img src={article.coverImage} alt={article.title} className="w-full rounded-lg mt-6 object-cover max-h-[450px]" />

        {/* Share buttons */}
        <div className="flex items-center gap-3 mt-6 pb-4 border-b border-border">
          <Share2 className="w-4 h-4 text-muted-foreground" />
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"
            className="p-2 rounded-md bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
            <Facebook className="w-4 h-4" />
          </a>
          <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer"
            className="p-2 rounded-md bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
            <Twitter className="w-4 h-4" />
          </a>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none mt-6 font-body text-foreground/90 leading-relaxed
          [&_h2]:font-display [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3
          [&_p]:mb-4 [&_p]:text-base"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-8">
          {article.tags.map(tag => (
            <Link key={tag} to={`/search?q=${encodeURIComponent(tag)}`}
              className="px-3 py-1 rounded-full bg-muted text-xs font-body font-medium text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
              #{tag}
            </Link>
          ))}
        </div>

        {/* Comments */}
        <section className="mt-10">
          <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Comments ({allComments.length})
          </h2>
          <div className="mt-4">
            {topLevel.map(c => (
              <CommentItem key={c.id} comment={c} replies={allComments.filter(r => r.parentId === c.id)} />
            ))}
          </div>
        </section>
      </article>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="container max-w-3xl mb-10">
          <h2 className="text-lg font-display font-bold text-foreground mb-4">Related Stories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map(a => <ArticleCard key={a.id} article={a} />)}
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
};

export default ArticlePage;
