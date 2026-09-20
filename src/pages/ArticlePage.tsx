import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ArticleCard from '@/components/ArticleCard';
import { useArticleBySlug, useArticleComments, useLatestArticles, formatDate, DbComment } from '@/hooks/use-articles';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Share2, Facebook, Twitter, ArrowLeft, MessageCircle, Eye, Copy, Check, Newspaper, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const CommentItem = ({ comment, replies }: { comment: DbComment; replies: DbComment[] }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-4 border-b border-border/30 last:border-0">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-body font-bold text-primary">
        {comment.author_name[0]?.toUpperCase()}
      </div>
      <span className="text-sm font-body font-semibold text-foreground">{comment.author_name}</span>
      <span className="text-xs text-muted-foreground font-body">{formatDate(comment.created_at)}</span>
    </div>
    <p className="text-sm font-body text-foreground/80 leading-relaxed ml-9">{comment.content}</p>
    {replies.length > 0 && (
      <div className="ml-9 mt-3 border-l-2 border-primary/20 pl-4">
        {replies.map(r => <CommentItem key={r.id} comment={r} replies={[]} />)}
      </div>
    )}
  </motion.div>
);

const ArticlePage = () => {
  const { slug } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (slug) {
      // Fire-and-forget view increment (deduped per session)
      const key = `viewed:${slug}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        supabase.rpc('increment_article_views', { article_slug: slug }).then(() => {});
      }
    }
  }, [slug]);
  const { data: article, isLoading } = useArticleBySlug(slug || '');
  const { data: comments, refetch: refetchComments } = useArticleComments(article?.id);
  const { data: allLatest } = useLatestArticles(10);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const related = (allLatest || []).filter(a => a.id !== article?.id && a.category_id === article?.category_id).slice(0, 3);
  const sidebarArticles = (allLatest || []).filter(a => a.id !== article?.id).slice(0, 6);
  const topLevel = (comments || []).filter(c => !c.parent_id);
  const shareUrl = article ? `https://jubachronicles.com/article/${article.slug}` : '';

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim() || !article) return;
    setSubmitting(true);
    const { error } = await supabase.from('comments').insert({
      article_id: article.id,
      author_name: commentName.trim(),
      content: commentText.trim(),
    });
    if (error) toast.error('Failed to post comment');
    else {
      toast.success('Comment posted!');
      setCommentName('');
      setCommentText('');
      refetchComments();
    }
    setSubmitting(false);
  };

  if (isLoading) {

  return (
    <div className="min-h-screen bg-background editorial-shell">
      <SiteHeader />
        <div className="container py-20 text-center font-body text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background editorial-shell">
        <SiteHeader />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-display font-bold text-foreground">Article not found</h1>
          <Link to="/" className="text-primary font-body text-sm mt-4 inline-block hover:underline">← Back to Home</Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background editorial-shell">
      <Helmet>
        <title>{`${article.title} — Juba Chronicle`}</title>
        <meta name="description" content={article.excerpt || 'Read more on Juba Chronicle'} />
        <link rel="canonical" href={shareUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt || 'Read more on Juba Chronicle'} />
        <meta property="og:image" content={article.cover_image || 'https://jubachronicles.com/og-image.png'} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:site_name" content="Juba Chronicle" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt || 'Read more on Juba Chronicle'} />
        <meta name="twitter:image" content={article.cover_image || 'https://jubachronicles.com/og-image.png'} />
      </Helmet>
      <SiteHeader />

      <main className="container max-w-7xl py-8 md:py-14 relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-14">
          <article className="min-w-0">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {article.category_name && <span className="font-mono text-[10px] font-bold text-primary uppercase tracking-widest">{article.category_name}</span>}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display text-foreground leading-[1.02] mt-3 headline-reveal">{article.title}</h1>

              <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-foreground text-xs text-muted-foreground font-mono uppercase">
                <span className="font-medium text-foreground">{article.author_name}</span>
                <span className="text-primary/30">·</span>
                <span>{formatDate(article.published_at)}</span>
                <span className="text-primary/30">·</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{article.reading_time} min read</span>
                <span className="text-primary/30">·</span>
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{article.views.toLocaleString()} views</span>
              </div>
            </motion.div>

            {article.cover_image && (
              <motion.img initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
                src={article.cover_image} alt={article.title} className="w-full mt-8 object-cover max-h-[640px] border-y-4 border-foreground image-reveal" />
            )}

            <div className="flex items-center gap-2 mt-6 pb-5 border-b border-foreground/20">
              <Share2 className="w-4 h-4 text-muted-foreground" />
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"
                className="p-2 border border-foreground/30 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer"
                className="p-2 border border-foreground/30 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + '\n\n' + shareUrl)}`} target="_blank" rel="noopener noreferrer"
                className="p-2 border border-foreground/30 hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
              <button onClick={() => {
                navigator.clipboard.writeText(shareUrl).then(() => {
                  setCopied(true);
                  toast.success('Link copied!');
                  setTimeout(() => setCopied(false), 2000);
                });
              }}
                className="p-2 border border-foreground/30 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                aria-label="Copy link">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}
              className="prose prose-lg max-w-none mt-10 font-body text-foreground/90 leading-relaxed
              [&_h2]:font-display [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3
              [&_p]:mb-4 [&_p]:text-base"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8">
                {article.tags.map(tag => (
                  <Link key={tag} to={`/search?q=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 border border-foreground/30 text-xs font-body font-medium text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:shadow-[0_0_10px_hsl(var(--primary)/0.3)]">
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            <section className="mt-14">
              <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Comments ({(comments || []).length})
              </h2>

              <form onSubmit={handleComment} className="mt-5 space-y-3 p-5 bg-card border-2 border-foreground">
                <input type="text" placeholder="Your name" value={commentName} onChange={e => setCommentName(e.target.value)}
                  required maxLength={100}
                  className="w-full px-3 py-2.5 rounded-sm bg-background border border-foreground/30 text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                <textarea placeholder="Write a comment..." value={commentText} onChange={e => setCommentText(e.target.value)}
                  required rows={3} maxLength={1000}
                  className="w-full px-3 py-2.5 rounded-sm bg-background border border-foreground/30 text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none" />
                <button type="submit" disabled={submitting}
                  className="px-5 py-2.5 bg-primary text-primary-foreground font-mono text-xs font-bold uppercase hover:bg-foreground transition-colors disabled:opacity-50">
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </form>

              <div className="mt-4">
                {topLevel.map(c => (
                  <CommentItem key={c.id} comment={c} replies={(comments || []).filter(r => r.parent_id === c.id)} />
                ))}
              </div>
            </section>
          </article>

          <aside className="lg:sticky lg:top-6 self-start space-y-6">
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="font-display text-xl font-black text-primary">Latest News</h2>
                <Newspaper className="h-5 w-5 text-secondary" />
              </div>
              <div className="divide-y divide-border">
                {sidebarArticles.map((item, index) => (
                  <Link key={item.id} to={`/article/${item.slug}`} className="group grid grid-cols-[86px_minmax(0,1fr)] gap-3 py-4">
                    {item.cover_image ? (
                      <img src={item.cover_image} alt={item.title} loading="lazy" className="h-20 w-full rounded-xl object-cover" />
                    ) : (
                      <div className="h-20 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-display text-lg font-black">JC.</div>
                    )}
                    <div className="min-w-0">
                      <span className="font-mono text-[10px] uppercase text-secondary">{item.category_name || `Update ${index + 1}`}</span>
                      <h3 className="mt-1 line-clamp-3 font-display text-sm font-black leading-tight text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                      <p className="mt-2 flex items-center gap-1 font-mono text-[10px] uppercase text-muted-foreground"><Eye className="h-3 w-3" /> {item.views.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-primary p-5 text-primary-foreground">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-primary-foreground/70">
                <TrendingUp className="h-4 w-4 text-secondary" /> Chronicle Desk
              </div>
              <h2 className="mt-3 font-display text-2xl font-black leading-tight">More stories from Juba Chronicle</h2>
              <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80">Follow the latest reporting, analysis and public-interest updates across the region.</p>
              <Link to="/search?explore=1" className="mt-5 inline-flex rounded-full bg-secondary px-4 py-2 font-mono text-[10px] font-bold uppercase text-secondary-foreground hover:bg-background hover:text-foreground transition-colors">
                Explore News
              </Link>
            </section>
          </aside>
          </div>
      </main>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="container max-w-7xl mb-14 relative z-10">
          <h2 className="section-kicker mb-6">Related Stories</h2>
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
