ALTER TABLE public.articles
  ADD COLUMN seo_title text,
  ADD COLUMN meta_description text,
  ADD COLUMN focus_keyphrase text,
  ADD COLUMN canonical_url text;

COMMENT ON COLUMN public.articles.seo_title IS 'Optional search result and social preview title override.';
COMMENT ON COLUMN public.articles.meta_description IS 'Optional search result and social preview description override.';
COMMENT ON COLUMN public.articles.focus_keyphrase IS 'Optional editorial keyphrase used for SEO analysis.';
COMMENT ON COLUMN public.articles.canonical_url IS 'Optional absolute HTTPS canonical URL override.';