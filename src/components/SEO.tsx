import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  articleData?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
    section?: string;
  };
  noindex?: boolean;
}

const SEO = ({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage = 'https://jubachronicles.com/og-image.png',
  twitterCard = 'summary_large_image',
  articleData,
  noindex = false
}: SEOProps) => {
  const siteName = 'Juba Chronicle';
  const fullTitle = title ? `${title} — ${siteName}` : `${siteName} — The Pulse of the Nation`;
  const defaultDescription = 'Juba Chronicle delivers breaking news, politics, business, technology, sports, and culture from Juba, South Sudan and the wider region.';
  const metaDescription = description || defaultDescription;
  const url = canonical || 'https://jubachronicles.com';

  // Structured Data
  const structuredData = ogType === 'article' && articleData ? {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": title,
    "description": metaDescription,
    "image": [ogImage],
    "datePublished": articleData.publishedTime,
    "dateModified": articleData.modifiedTime || articleData.publishedTime,
    "articleSection": articleData.section,
    "keywords": articleData.tags || [],
    "author": [{
      "@type": "Person",
      "name": articleData.author || "Juba Chronicle Correspondent",
      "url": "https://jubachronicles.com"
    }],
    "publisher": {
      "@type": "Organization",
      "name": siteName,
      "logo": { "@type": "ImageObject", "url": "https://jubachronicles.com/favicon.png" }
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": url },
    "url": url
  } : {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteName,
    "alternateName": "JC",
    "url": "https://jubachronicles.com"
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {noindex && <meta name="robots" content="noindex, follow" />}
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title || siteName} />
      <meta property="og:locale" content="en_SS" />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title || siteName} />
      <meta name="twitter:site" content="@JubaChronicle" />

      {/* Article Specific */}
      {ogType === 'article' && articleData?.publishedTime && (
        <meta property="article:published_time" content={articleData.publishedTime} />
      )}
      {ogType === 'article' && articleData?.modifiedTime && (
        <meta property="article:modified_time" content={articleData.modifiedTime} />
      )}
      {ogType === 'article' && articleData?.section && (
        <meta property="article:section" content={articleData.section} />
      )}
      {ogType === 'article' && articleData?.author && (
        <meta property="article:author" content={articleData.author} />
      )}
      {ogType === 'article' && articleData?.tags?.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;
