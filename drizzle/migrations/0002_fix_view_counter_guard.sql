CREATE OR REPLACE FUNCTION public.increment_article_views(article_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('app.view_counter', 'on', true);
  UPDATE public.articles
  SET views = views + 1
  WHERE slug = article_slug AND status = 'approved';
  PERFORM set_config('app.view_counter', 'off', true);
END;
$$;

REVOKE ALL ON FUNCTION public.increment_article_views(text) FROM public;
GRANT EXECUTE ON FUNCTION public.increment_article_views(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.guard_article_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_staff boolean;
BEGIN
  IF coalesce(current_setting('app.view_counter', true), 'off') = 'on' THEN
    RETURN NEW;
  END IF;

  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  is_staff := public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor');

  IF TG_OP = 'INSERT' THEN
    IF NOT is_staff THEN
      NEW.author_id := auth.uid();
      NEW.is_breaking := false;
      NEW.is_featured := false;
      NEW.views := 0;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NOT is_staff THEN
      NEW.author_id := OLD.author_id;
      NEW.is_breaking := OLD.is_breaking;
      NEW.is_featured := OLD.is_featured;
      NEW.views := OLD.views;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_article_changes() FROM anon, authenticated;