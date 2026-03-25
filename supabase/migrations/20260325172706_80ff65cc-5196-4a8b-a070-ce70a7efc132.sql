
-- Replace the overly permissive comments INSERT policy with a more restrictive one
DROP POLICY "Anyone can insert comments" ON public.comments;
CREATE POLICY "Authenticated or anonymous can insert comments with validation" ON public.comments FOR INSERT WITH CHECK (
  length(trim(author_name)) > 0 AND length(trim(content)) > 0
);
