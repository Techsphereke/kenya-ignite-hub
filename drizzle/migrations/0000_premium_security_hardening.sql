-- 1. Profiles: no longer world-readable (bylines are anonymous anyway)
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
CREATE POLICY "Users can view own profile, staff can view all"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
REVOKE SELECT ON public.profiles FROM anon;

-- 2. Comments: only on published stories, with length limits
DROP POLICY IF EXISTS "Authenticated or anonymous can insert comments with validation" ON public.comments;
CREATE POLICY "Comments allowed only on published articles"
ON public.comments FOR INSERT TO anon, authenticated
WITH CHECK (
  length(trim(author_name)) BETWEEN 1 AND 60
  AND length(trim(content)) BETWEEN 2 AND 2000
  AND author_name !~ '<|>'
  AND content !~* '<\s*(script|iframe|object|embed|style|svg)'
  AND EXISTS (
    SELECT 1 FROM public.articles a
    WHERE a.id = article_id AND a.status = 'approved'
  )
  AND (
    parent_id IS NULL
    OR EXISTS (SELECT 1 FROM public.comments c WHERE c.id = parent_id AND c.article_id = comments.article_id)
  )
);

-- 3. Lock down helper/trigger functions from the public API
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.calculate_reading_time() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_article_slug() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_article_views(text) TO anon, authenticated;

-- 4. Storage: uploads and edits confined to the user's own folder
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own media" ON storage.objects;
CREATE POLICY "Users upload into own media folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users update own media only"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own media, admins delete any"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'media' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin')));