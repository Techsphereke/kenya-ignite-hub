import { useParams, Link } from 'react-router-dom';
import { useState, useRef, useCallback, useEffect } from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ArticleCard from '@/components/ArticleCard';
import { useArticleBySlug, useArticleComments, useLatestArticles, formatDate, DbComment } from '@/hooks/use-articles';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Share2, Facebook, Twitter, ArrowLeft, MessageCircle, Eye, Volume2, Pause, Play, Square, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

function useTextToSpeech(text: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [supported, setSupported] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);
  const [rate, setRate] = useState(1);
  const totalCharsRef = useRef(0);

  useEffect(() => {
    if (!('speechSynthesis' in window)) { setSupported(false); return; }
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices().filter(voice => voice.lang.startsWith('en'));
      if (v.length > 0) {
        setVoices(v);
        // Prefer a voice with "Kenya", "Africa", "Female", or "Google" in the name
        const preferred = v.findIndex(voice =>
          /kenya|swahili|africa/i.test(voice.name)
        );
        const googleFemale = v.findIndex(voice =>
          /google.*female|female.*english/i.test(voice.name)
        );
        setSelectedVoiceIndex(preferred >= 0 ? preferred : googleFemale >= 0 ? googleFemale : 0);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  const play = useCallback(() => {
    if (!text || !supported) return;
    window.speechSynthesis.cancel();
    const plainText = stripHtml(text);
    totalCharsRef.current = plainText.length;
    const utt = new SpeechSynthesisUtterance(plainText);
    utt.rate = rate;
    utt.pitch = 1;
    if (voices[selectedVoiceIndex]) utt.voice = voices[selectedVoiceIndex];
    utt.onboundary = (e) => {
      if (e.charIndex && totalCharsRef.current) setProgress(Math.round((e.charIndex / totalCharsRef.current) * 100));
    };
    utt.onend = () => { setIsPlaying(false); setIsPaused(false); setProgress(100); };
    utt.onerror = () => { setIsPlaying(false); setIsPaused(false); setProgress(0); };
    window.speechSynthesis.speak(utt);
    setIsPlaying(true);
    setIsPaused(false);
  }, [text, supported, rate, voices, selectedVoiceIndex]);

  const pause = useCallback(() => { window.speechSynthesis.pause(); setIsPaused(true); }, []);
  const resume = useCallback(() => { window.speechSynthesis.resume(); setIsPaused(false); }, []);
  const stop = useCallback(() => { window.speechSynthesis.cancel(); setIsPlaying(false); setIsPaused(false); setProgress(0); }, []);

  return { isPlaying, isPaused, progress, supported, voices, selectedVoiceIndex, setSelectedVoiceIndex, rate, setRate, play, pause, resume, stop };
}

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
  }, [slug]);
  const { data: article, isLoading } = useArticleBySlug(slug || '');
  const { data: comments, refetch: refetchComments } = useArticleComments(article?.id);
  const { data: allLatest } = useLatestArticles(10);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const tts = useTextToSpeech(article?.content || '');

  const related = (allLatest || []).filter(a => a.id !== article?.id && a.category_id === article?.category_id).slice(0, 3);
  const topLevel = (comments || []).filter(c => !c.parent_id);
  const ogShareUrl = article ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/og-article?slug=${article.slug}` : '';
  const shareUrl = article ? `https://kenyaignite.co.ke/article/${article.slug}` : '';

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
    <div className="min-h-screen bg-background animated-bg noise-overlay">
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
      <div className="min-h-screen bg-background animated-bg noise-overlay">
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
    <div className="min-h-screen bg-background animated-bg noise-overlay">
      <SiteHeader />

      <article className="container max-w-3xl py-6 md:py-10 relative z-10">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground font-body hover:text-primary transition-colors duration-300 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {article.category_name && <span className="text-xs font-body font-bold text-primary uppercase tracking-wider">{article.category_name}</span>}
          <h1 className="text-2xl md:text-4xl font-display font-bold text-foreground leading-tight mt-1">{article.title}</h1>

          <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-muted-foreground font-body">
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
            src={article.cover_image} alt={article.title} className="w-full rounded-xl mt-6 object-cover max-h-[450px] glow-border" />
        )}

        {/* Share buttons */}
        <div className="flex items-center gap-3 mt-6 pb-4 border-b border-border/30">
          <Share2 className="w-4 h-4 text-muted-foreground" />
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"
            className="p-2 rounded-lg bg-muted/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)]">
            <Facebook className="w-4 h-4" />
          </a>
          <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer"
            className="p-2 rounded-lg bg-muted/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)]">
            <Twitter className="w-4 h-4" />
          </a>
        </div>

        {/* Audio Reader */}
        {tts.supported && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-4 glass-card rounded-xl p-4 glow-border">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-sm font-body font-semibold text-foreground">Listen to this article</span>
              <div className="flex items-center gap-1.5 ml-auto">
                {!tts.isPlaying ? (
                  <button onClick={tts.play}
                    className="p-2 rounded-lg bg-primary text-primary-foreground hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all duration-300"
                    aria-label="Play article">
                    <Play className="w-4 h-4" />
                  </button>
                ) : (
                  <>
                    <button onClick={tts.isPaused ? tts.resume : tts.pause}
                      className="p-2 rounded-lg bg-primary text-primary-foreground hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all duration-300"
                      aria-label={tts.isPaused ? 'Resume' : 'Pause'}>
                      {tts.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    </button>
                    <button onClick={tts.stop}
                      className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-all duration-300"
                      aria-label="Stop">
                      <Square className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Voice & Speed controls */}
            <div className="flex flex-col sm:flex-row gap-3 mt-3">
              {tts.voices.length > 1 && (
                <div className="flex-1 relative">
                  <label className="text-xs font-body text-muted-foreground mb-1 block">Voice</label>
                  <select
                    value={tts.selectedVoiceIndex}
                    onChange={(e) => { tts.setSelectedVoiceIndex(Number(e.target.value)); if (tts.isPlaying) { tts.stop(); } }}
                    className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-foreground font-body text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none pr-8"
                  >
                    {tts.voices.map((v, i) => (
                      <option key={`${v.name}-${i}`} value={i}>
                        {v.name.replace(/^(Microsoft |Google |Apple )/, '')} ({v.lang})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-[1.85rem] pointer-events-none" />
                </div>
              )}
              <div className="w-full sm:w-36">
                <label className="text-xs font-body text-muted-foreground mb-1 block">Speed: {tts.rate}x</label>
                <div className="flex items-center gap-1.5">
                  {[0.75, 1, 1.25, 1.5].map(s => (
                    <button key={s} onClick={() => { tts.setRate(s); if (tts.isPlaying) { tts.stop(); } }}
                      className={`flex-1 px-1.5 py-1.5 rounded-md text-xs font-body font-medium transition-all duration-200 ${
                        tts.rate === s
                          ? 'bg-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--primary)/0.3)]'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}>
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {tts.isPlaying && (
              <div className="mt-3">
                <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${tts.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground font-body mt-1.5">
                  {tts.isPaused ? 'Paused' : 'Playing...'} · {tts.progress}%
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Content */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}
          className="prose prose-lg max-w-none mt-6 font-body text-foreground/90 leading-relaxed
          [&_h2]:font-display [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3
          [&_p]:mb-4 [&_p]:text-base"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8">
            {article.tags.map(tag => (
              <Link key={tag} to={`/search?q=${encodeURIComponent(tag)}`}
                className="px-3 py-1 rounded-full bg-muted/50 text-xs font-body font-medium text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:shadow-[0_0_10px_hsl(var(--primary)/0.3)]">
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Comments */}
        <section className="mt-10">
          <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Comments ({(comments || []).length})
          </h2>

          <form onSubmit={handleComment} className="mt-4 space-y-3 p-4 glass-card rounded-xl">
            <input type="text" placeholder="Your name" value={commentName} onChange={e => setCommentName(e.target.value)}
              required maxLength={100}
              className="w-full px-3 py-2.5 rounded-lg bg-muted/50 border border-border/50 text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
            <textarea placeholder="Write a comment..." value={commentText} onChange={e => setCommentText(e.target.value)}
              required rows={3} maxLength={1000}
              className="w-full px-3 py-2.5 rounded-lg bg-muted/50 border border-border/50 text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none" />
            <button type="submit" disabled={submitting}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-body text-sm font-medium hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all duration-300 disabled:opacity-50">
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

      {/* Related articles */}
      {related.length > 0 && (
        <section className="container max-w-3xl mb-10 relative z-10">
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
