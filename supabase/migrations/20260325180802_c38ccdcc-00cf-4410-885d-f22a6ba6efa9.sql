-- Fix existing articles with empty slugs
UPDATE articles 
SET slug = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(gen_random_uuid()::text, 1, 8)
WHERE slug IS NULL OR slug = '';

-- Also make the trigger fire on UPDATE to catch future cases
CREATE OR REPLACE FUNCTION public.generate_article_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug := trim(both '-' from NEW.slug);
    NEW.slug := NEW.slug || '-' || substr(gen_random_uuid()::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$function$;

-- Ensure trigger fires on both INSERT and UPDATE
DROP TRIGGER IF EXISTS auto_slug_articles ON articles;
CREATE TRIGGER auto_slug_articles
  BEFORE INSERT OR UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION generate_article_slug();