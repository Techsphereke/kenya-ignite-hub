import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const SITE_URL = "https://kenyaignite.co.ke";
const SITE_NAME = "Kenya Ignite";
const FALLBACK_IMAGE = `${SITE_URL}/og-image.png`;
const FAVICON_URL = `${SITE_URL}/favicon.png`;
const FALLBACK_DESCRIPTION = "Kenya Ignite brings you breaking news, politics, business, technology, sports, and entertainment from Kenya and East Africa.";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function stripHtml(text: string | null | undefined): string {
  return (text ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return FALLBACK_IMAGE;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return FALLBACK_IMAGE;
    if (parsed.searchParams.has("token") || parsed.searchParams.has("signature")) return FALLBACK_IMAGE;

    const publicStoragePrefix = "/storage/v1/object/public/";
    if (parsed.hostname.endsWith("supabase.co") && parsed.pathname.includes(publicStoragePrefix)) {
      const objectPath = parsed.pathname.split(publicStoragePrefix)[1];
      if (!objectPath) return FALLBACK_IMAGE;

      return `${parsed.origin}/storage/v1/render/image/public/${objectPath}?width=1200&height=630&resize=cover`;
    }

    return parsed.toString();
  } catch {
    return FALLBACK_IMAGE;
  }
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
    .select("title, excerpt, content, cover_image, slug, published_at, author_id, reading_time")
    .eq("slug", slug)
    .eq("status", "approved")
    .single();

  if (!article) {
    // Redirect to homepage if article not found
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, Location: SITE_URL },
    });
  }

  let authorName = SITE_NAME;
  if (article.author_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", article.author_id)
      .single();
    if (profile?.display_name) authorName = profile.display_name;
  }

  const articleUrl = `${SITE_URL}/article/${article.slug}`;
  const normalizedExcerpt = truncate(
    stripHtml(article.excerpt) || stripHtml(article.content) || FALLBACK_DESCRIPTION,
    220,
  );
  const image = normalizeImageUrl(article.cover_image);
  const title = escapeHtml(article.title);
  const description = escapeHtml(normalizedExcerpt);
  const publishedAt = article.published_at || new Date().toISOString();
  const plainExcerpt = normalizedExcerpt;

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: plainExcerpt,
    image: [image],
    datePublished: publishedAt,
    dateModified: publishedAt,
    author: { "@type": "Person", name: authorName },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: FAVICON_URL },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    url: articleUrl,
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title} — ${SITE_NAME}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${articleUrl}" />
  <link rel="icon" href="${FAVICON_URL}" type="image/png" />

  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:secure_url" content="${image}" />
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

  <!-- JSON-LD -->
  <script type="application/ld+json">${jsonLd}</script>

  <meta http-equiv="refresh" content="0;url=${articleUrl}" />
</head>
<body>
  <script>location.replace(${JSON.stringify(articleUrl)});</script>
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
