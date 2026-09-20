export type SeoStatus = 'good' | 'needs-improvement' | 'incomplete';

export type SeoArticle = {
  title?: string | null;
  seo_title?: string | null;
  excerpt?: string | null;
  meta_description?: string | null;
  focus_keyphrase?: string | null;
  canonical_url?: string | null;
  content?: string | null;
  cover_image?: string | null;
  category_id?: string | null;
};

export type SeoAnalysis = {
  status: SeoStatus;
  score: number;
  passed: number;
  checks: { label: string; passed: boolean }[];
};

export const stripHtml = (value = '') => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export const getSeoTitle = (article: SeoArticle) => article.seo_title?.trim() || article.title?.trim() || '';
export const getSeoDescription = (article: SeoArticle) => article.meta_description?.trim() || article.excerpt?.trim() || stripHtml(article.content || '').slice(0, 155);

export const getCanonicalUrl = (canonicalUrl: string | null | undefined, slug: string) => {
  const fallback = `https://jubachronicles.com/article/${slug}`;
  if (!canonicalUrl?.trim()) return fallback;
  try {
    const value = new URL(canonicalUrl.trim());
    return value.protocol === 'https:' ? value.toString() : fallback;
  } catch {
    return fallback;
  }
};

export const analyzeArticleSeo = (article: SeoArticle): SeoAnalysis => {
  const title = getSeoTitle(article);
  const description = getSeoDescription(article);
  const keyphrase = article.focus_keyphrase?.trim().toLowerCase() || '';
  const body = stripHtml(article.content || '').toLowerCase();
  const searchableTitle = title.toLowerCase();
  const searchableDescription = description.toLowerCase();
  const wordCount = body ? body.split(/\s+/).length : 0;
  const checks = [
    { label: 'SEO title is 30–60 characters', passed: title.length >= 30 && title.length <= 60 },
    { label: 'Meta description is 120–160 characters', passed: description.length >= 120 && description.length <= 160 },
    { label: 'Focus keyphrase is set', passed: keyphrase.length >= 2 },
    { label: 'Keyphrase appears in the SEO title', passed: !!keyphrase && searchableTitle.includes(keyphrase) },
    { label: 'Keyphrase appears in the description', passed: !!keyphrase && searchableDescription.includes(keyphrase) },
    { label: 'Keyphrase appears in the story', passed: !!keyphrase && body.includes(keyphrase) },
    { label: 'Story has at least 300 words', passed: wordCount >= 300 },
    { label: 'Featured image is set', passed: !!article.cover_image },
    { label: 'Category is selected', passed: !!article.category_id },
  ];
  const passed = checks.filter(check => check.passed).length;
  const score = Math.round((passed / checks.length) * 100);
  return { status: passed >= 8 ? 'good' : passed >= 5 ? 'needs-improvement' : 'incomplete', score, passed, checks };
};

export const seoStatusLabel: Record<SeoStatus, string> = {
  good: 'Good',
  'needs-improvement': 'Needs improvement',
  incomplete: 'Incomplete',
};

export const seoStatusClass: Record<SeoStatus, string> = {
  good: 'text-newsroom-success',
  'needs-improvement': 'text-newsroom-warning',
  incomplete: 'text-newsroom-danger',
};