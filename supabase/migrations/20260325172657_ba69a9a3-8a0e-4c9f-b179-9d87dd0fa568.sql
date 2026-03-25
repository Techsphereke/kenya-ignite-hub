
-- Create roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'author');

-- Create article status enum
CREATE TYPE public.article_status AS ENUM ('draft', 'pending', 'approved', 'rejected');

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Articles table
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  cover_image TEXT,
  category_id UUID REFERENCES public.categories(id),
  author_id UUID NOT NULL REFERENCES auth.users(id),
  status article_status NOT NULL DEFAULT 'draft',
  is_breaking BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  views INTEGER NOT NULL DEFAULT 0,
  reading_time INTEGER NOT NULL DEFAULT 1,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published articles viewable by everyone" ON public.articles FOR SELECT USING (status = 'approved' OR auth.uid() = author_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Authors can insert articles" ON public.articles FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own articles" ON public.articles FOR UPDATE USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins can delete articles" ON public.articles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert comments" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can delete comments" ON public.comments FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'author');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-generate slug function
CREATE OR REPLACE FUNCTION public.generate_article_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug := trim(both '-' from NEW.slug);
    NEW.slug := NEW.slug || '-' || substr(gen_random_uuid()::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER auto_slug_articles BEFORE INSERT ON public.articles FOR EACH ROW EXECUTE FUNCTION public.generate_article_slug();

-- Calculate reading time
CREATE OR REPLACE FUNCTION public.calculate_reading_time()
RETURNS TRIGGER AS $$
BEGIN
  NEW.reading_time := GREATEST(1, (length(NEW.content) - length(replace(NEW.content, ' ', '')) + 1) / 200);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER calc_reading_time BEFORE INSERT OR UPDATE OF content ON public.articles FOR EACH ROW EXECUTE FUNCTION public.calculate_reading_time();

-- Storage bucket for media
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

CREATE POLICY "Media publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Authenticated users can upload media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own media" ON storage.objects FOR UPDATE USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);
