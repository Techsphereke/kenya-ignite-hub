<?php
/**
 * Juba Chronicle — server-rendered social share metadata for /article/{slug}.
 *
 * Social crawlers (WhatsApp, Facebook, Twitter/X, LinkedIn, Telegram) do not run
 * JavaScript, so they are routed here by .htaccess. This file returns real HTML
 * (Content-Type: text/html) with Open Graph / Twitter Card tags built from the
 * live article data. Humans are redirected to the normal app URL by JS.
 */

const SITE_URL   = 'https://kenyaignite.co.ke';
const SITE_NAME  = 'Juba Chronicle';
const API_BASE   = 'https://fxnlvjbuyxzjpmlvjfmh.supabase.co';
const ANON_KEY   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4bmx2amJ1eXh6anBtbHZqZm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NTgxMzcsImV4cCI6MjA5MDAzNDEzN30.57JXv70WATpjAi-c-z6GB5IeIYJrQpYz8_dSSAwq8Ak';
const FALLBACK_IMAGE = SITE_URL . '/og-image.png';
const FALLBACK_DESC  = 'Juba Chronicle brings you breaking news, politics, business, technology, sports, and culture from South Sudan and the region.';

function e(string $v): string {
  return htmlspecialchars($v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function excerpt(string $html, int $max = 200): string {
  $text = trim(preg_replace('/\s+/u', ' ', strip_tags($html)));
  if ($text === '') return FALLBACK_DESC;
  if (mb_strlen($text) <= $max) return $text;
  return rtrim(mb_substr($text, 0, $max - 1)) . '…';
}

function share_image(?string $url): string {
  if (!$url) return FALLBACK_IMAGE;
  $parts = parse_url($url);
  if (!$parts || ($parts['scheme'] ?? '') !== 'https') return FALLBACK_IMAGE;
  if (isset($parts['query']) && preg_match('/(^|&)(token|signature)=/', $parts['query'])) return FALLBACK_IMAGE;

  $marker = '/storage/v1/object/public/';
  if (isset($parts['path']) && strpos($parts['path'], $marker) !== false) {
    $objectPath = explode($marker, $parts['path'], 2)[1] ?? '';
    if ($objectPath !== '') {
      return 'https://' . $parts['host'] . '/storage/v1/render/image/public/' . $objectPath
        . '?width=1200&height=630&resize=cover';
    }
  }
  return $url;
}

$slug = isset($_GET['slug']) ? preg_replace('/[^a-zA-Z0-9\-_]/', '', $_GET['slug']) : '';
$article = null;

if ($slug !== '') {
  $endpoint = API_BASE . '/rest/v1/articles?select=title,slug,excerpt,content,cover_image,published_at'
    . '&status=eq.approved&slug=eq.' . rawurlencode($slug) . '&limit=1';
  $ctx = stream_context_create([
    'http' => [
      'method'  => 'GET',
      'header'  => "apikey: " . ANON_KEY . "\r\nAuthorization: Bearer " . ANON_KEY . "\r\nAccept: application/json\r\n",
      'timeout' => 6,
      'ignore_errors' => true,
    ],
  ]);
  $raw = @file_get_contents($endpoint, false, $ctx);
  if ($raw !== false) {
    $rows = json_decode($raw, true);
    if (is_array($rows) && isset($rows[0])) $article = $rows[0];
  }
}

$articleUrl = SITE_URL . '/article/' . $slug;

if ($article) {
  $title = $article['title'] ?: SITE_NAME;
  $desc  = !empty($article['excerpt']) ? excerpt($article['excerpt']) : excerpt((string) ($article['content'] ?? ''));
  $image = share_image($article['cover_image'] ?? null);
} else {
  $title = SITE_NAME . ' — Igniting Stories That Matter';
  $desc  = FALLBACK_DESC;
  $image = FALLBACK_IMAGE;
  $articleUrl = $slug !== '' ? $articleUrl : SITE_URL;
}

$jsonLd = json_encode([
  '@context' => 'https://schema.org',
  '@type'    => 'NewsArticle',
  'headline' => $title,
  'description' => $desc,
  'image'    => [$image],
  'url'      => $articleUrl,
  'mainEntityOfPage' => ['@type' => 'WebPage', '@id' => $articleUrl],
  'datePublished' => $article['published_at'] ?? null,
  'author'   => ['@type' => 'Person', 'name' => SITE_NAME],
  'publisher' => [
    '@type' => 'Organization',
    'name'  => SITE_NAME,
    'logo'  => ['@type' => 'ImageObject', 'url' => SITE_URL . '/favicon.png'],
  ],
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: public, max-age=300, s-maxage=600');
header('X-Robots-Tag: all');
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title><?= e($title) ?> | <?= SITE_NAME ?></title>
<meta name="description" content="<?= e($desc) ?>" />
<link rel="canonical" href="<?= e($articleUrl) ?>" />
<link rel="icon" href="<?= SITE_URL ?>/favicon.png" type="image/png" />

<meta property="og:type" content="article" />
<meta property="og:site_name" content="<?= SITE_NAME ?>" />
<meta property="og:title" content="<?= e($title) ?>" />
<meta property="og:description" content="<?= e($desc) ?>" />
<meta property="og:url" content="<?= e($articleUrl) ?>" />
<meta property="og:image" content="<?= e($image) ?>" />
<meta property="og:image:secure_url" content="<?= e($image) ?>" />
<meta property="og:image:type" content="image/jpeg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="<?= e($title) ?>" />
<meta property="og:locale" content="en_KE" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@JubaChronicle" />
<meta name="twitter:title" content="<?= e($title) ?>" />
<meta name="twitter:description" content="<?= e($desc) ?>" />
<meta name="twitter:image" content="<?= e($image) ?>" />
<meta name="twitter:image:alt" content="<?= e($title) ?>" />

<script type="application/ld+json"><?= $jsonLd ?></script>
</head>
<body>
<script>location.replace(<?= json_encode($articleUrl) ?>);</script>
<h1><?= e($title) ?></h1>
<p><?= e($desc) ?></p>
<p><a href="<?= e($articleUrl) ?>">Continue to <?= SITE_NAME ?></a></p>
</body>
</html>
