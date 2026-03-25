import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const SITE_URL = "https://kenyaignite.co.ke";
const SITE_NAME = "Kenya Ignite";
const FALLBACK_IMAGE = `${SITE_URL}/og-image.png`;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeJsonLd(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return new Response(JSON.stringify({ error: "Missing slug" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: article } = await supabase
    .from("articles")
    .select("title, excerpt, cover_image, slug, published_at, content, reading_time")
    .eq("slug", slug)
    .eq("status", "approved")
    .single();

  if (!article) {
    return new Response(JSON.stringify({ error: "Article not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Fetch author name via author_id join
  const { data: fullArticle } = await supabase
    .from("articles")
    .select("author_id")
    .eq("slug", slug)
    .single();

  let authorName = SITE_NAME;
  if (fullArticle?.author_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", fullArticle.author_id)
      .single();
    if (profile?.display_name) authorName = profile.display_name;
  }

  const articleUrl = `${SITE_URL}/article/${article.slug}`;
  const image = article.cover_image || FALLBACK_IMAGE;
  const title = escapeHtml(article.title);
  const description = escapeHtml(
    article.excerpt || "Read more on Kenya Ignite"
  );
  const publishedAt = article.published_at || new Date().toISOString();

  // Plain text excerpt for JSON-LD (strip HTML from content as fallback)
  const plainExcerpt = article.excerpt || "Read more on Kenya Ignite";

  // JSON-LD structured data
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: plainExcerpt,
    image: [image],
    datePublished: publishedAt,
    dateModified: publishedAt,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    url: articleUrl,
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title} — ${SITE_NAME}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${articleUrl}" />

  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${articleUrl}" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="article:published_time" content="${publishedAt}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:site" content="@KenyaIgnite" />

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">${jsonLd}</script>

  <meta http-equiv="refresh" content="0;url=${articleUrl}" />
</head>
<body>
  <p>Redirecting to <a href="${articleUrl}">${title}</a>...</p>
</body>
</html>`;

  return new Response(html, {
    headers: new Headers({
      ...corsHeaders,
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=600",
    }),
  });
});
