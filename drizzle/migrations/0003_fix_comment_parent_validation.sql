DROP POLICY IF EXISTS "Comments allowed only on published articles" ON public.comments;
CREATE POLICY "Comments allowed only on published articles"
ON public.comments FOR INSERT TO anon, authenticated
WITH CHECK (
  length(trim(author_name)) BETWEEN 1 AND 60
  AND length(trim(content)) BETWEEN 2 AND 2000
  AND author_name !~ '<|>'
  AND content !~* '<\s*(script|iframe|object|embed|style|svg)'
  AND EXISTS (
    SELECT 1 FROM public.articles a
    WHERE a.id = comments.article_id AND a.status = 'approved'
  )
  AND (
    comments.parent_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.comments c
      WHERE c.id = comments.parent_id AND c.article_id = comments.article_id
    )
  )
);