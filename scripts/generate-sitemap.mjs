import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SITE_URL = 'https://jubachronicles.com';

function readLocalEnv() {
  try {
    return Object.fromEntries(readFileSync(resolve('.env'), 'utf8').split(/\r?\n/).filter(Boolean).map(line => {
      const separator = line.indexOf('=');
      return separator < 0 ? [line, ''] : [line.slice(0, separator), line.slice(separator + 1).replace(/^['"]|['"]$/g, '')];
    }));
  } catch {
    return {};
  }
}

const localEnv = readLocalEnv();
const apiUrl = process.env.VITE_SUPABASE_URL || localEnv.VITE_SUPABASE_URL;
const apiKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || localEnv.VITE_SUPABASE_PUBLISHABLE_KEY;

const escapeXml = value => String(value).replace(/[<>&'"']/g, character => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character]);

async function fetchRows(resource, query) {
  if (!apiUrl || !apiKey) return [];
  try {
    const response = await fetch(`${apiUrl}/rest/v1/${resource}?${query}`, { headers: { apikey: apiKey, Authorization: `Bearer ${apiKey}` } });
    return response.ok ? await response.json() : [];
  } catch {
    return [];
  }
}

const [articles, categories] = await Promise.all([
  fetchRows('articles', 'select=slug,updated_at&status=eq.approved&order=published_at.desc'),
  fetchRows('categories', 'select=slug&order=name.asc'),
]);

const entries = [
  { path: '/', changefreq: 'hourly', priority: '1.0' },
  ...categories.map(category => ({ path: `/category/${category.slug}`, changefreq: 'daily', priority: '0.8' })),
  ...articles.map(article => ({ path: `/article/${article.slug}`, lastmod: article.updated_at, changefreq: 'weekly', priority: '0.7' })),
];

const urls = entries.map(entry => [
  '  <url>',
  `    <loc>${escapeXml(`${SITE_URL}${entry.path}`)}</loc>`,
  entry.lastmod ? `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : null,
  `    <changefreq>${entry.changefreq}</changefreq>`,
  `    <priority>${entry.priority}</priority>`,
  '  </url>',
].filter(Boolean).join('\n'));

writeFileSync(resolve('public/sitemap.xml'), [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls,
  '</urlset>',
  '',
].join('\n'));

console.log(`sitemap.xml written (${entries.length} entries)`);