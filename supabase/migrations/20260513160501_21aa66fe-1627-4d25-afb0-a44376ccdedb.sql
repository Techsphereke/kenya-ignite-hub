CREATE OR REPLACE FUNCTION public.increment_article_views(article_slug text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.articles
  SET views = views + 1
  WHERE slug = article_slug AND status = 'approved';
$$;

GRANT EXECUTE ON FUNCTION public.increment_article_views(text) TO anon, authenticated;