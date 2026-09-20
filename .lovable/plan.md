# Juba Chronicle search indexing and post SEO

## Goal
Make every public story discoverable by search engines, strengthen technical news SEO, and give authors a WordPress-style SEO panel while writing or editing posts.

## Build

### 1. Search-engine discovery
- Add a sitemap at `/sitemap.xml` for the homepage, public categories, and every approved article.
- Use each article’s real `updated_at` value for `<lastmod>`; do not invent dates.
- Add the sitemap URL to `robots.txt` while keeping public pages crawlable.
- Exclude sign-in, dashboard, admin, search-result, and missing-page screens from indexing.
- Add a concise `/llms.txt` describing Juba Chronicle and its safe public sections for AI discovery.

### 2. Optional SEO fields in the post editor
- Extend stories with optional fields for SEO title, meta description, focus keyphrase, and canonical URL.
- Add a WordPress-style **SEO** panel to Add New Post and Edit Post.
- Show a Google-style search preview, character counters, and a live status: **Good**, **Needs improvement**, or **Incomplete**.
- Score practical checks: title length, description length, focus keyphrase in title/description/body, story length, featured image, and internal categorization.
- Keep every field optional and automatically fall back to the story title, excerpt, and normal article URL.

### 3. Public article metadata
- Use the optional SEO title and description in search metadata, social previews, and NewsArticle structured data.
- Keep the visible article headline unchanged when a separate SEO title is supplied.
- Add canonical, published/modified dates, image, publisher, category, and keywords to article metadata.
- Update both the browser-rendered article page and the cPanel server-rendered crawler response so search engines and sharing platforms receive matching information in the initial HTML.

### 4. WordPress-style post overview
- Add an **SEO** column to the author’s Posts list with the same colored status and a short issue summary.
- Show the SEO status while editing without storing a stale score; it recalculates immediately from the saved fields and article content.

### 5. Validation
- Apply the database change without weakening existing article permissions.
- Verify author create/edit/save flows, article metadata, sitemap contents, crawler output, and mobile/desktop layouts.
- Re-run the SEO foundations review and mark the sitemap finding corrected after verification.

## Technical details
- Add nullable columns to `public.articles`: `seo_title`, `meta_description`, `focus_keyphrase`, and `canonical_url`.
- Keep the existing article table grants and row-level access rules; no new public write access is introduced.
- Generate sitemap output from approved articles and categories on the production domain `https://jubachronicles.com`.
- Use self-referencing article canonicals by default; accept only valid absolute `https://` custom canonicals.
- Preserve the existing cPanel social-preview path and cache behavior.

## External indexing step
The site will be technically ready for indexing, but Google controls when pages appear. After deployment, submit `https://jubachronicles.com/sitemap.xml` in Google Search Console and request indexing for the homepage and priority stories.
