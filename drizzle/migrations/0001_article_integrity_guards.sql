CREATE OR REPLACE FUNCTION public.guard_article_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_staff boolean := public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor');
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

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

DROP TRIGGER IF EXISTS guard_article_changes_ins ON public.articles;
CREATE TRIGGER guard_article_changes_ins
BEFORE INSERT ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.guard_article_changes();

DROP TRIGGER IF EXISTS guard_article_changes_upd ON public.articles;
CREATE TRIGGER guard_article_changes_upd
BEFORE UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.guard_article_changes();