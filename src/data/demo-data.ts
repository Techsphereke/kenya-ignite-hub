export interface Author {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  role: 'admin' | 'editor' | 'author';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  categoryId: string;
  authorId: string;
  publishedAt: string;
  readingTime: number;
  tags: string[];
  isBreaking: boolean;
  isFeatured: boolean;
  views: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
}

export interface Comment {
  id: string;
  articleId: string;
  authorName: string;
  content: string;
  createdAt: string;
  parentId?: string;
}

export const authors: Author[] = [
  { id: 'a1', name: 'Amina Osei', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop', bio: 'Senior political correspondent with 12 years of experience.', role: 'editor' },
  { id: 'a2', name: 'James Mwangi', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop', bio: 'Business and economics analyst covering East African markets.', role: 'author' },
  { id: 'a3', name: 'Grace Wanjiku', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', bio: 'Technology reporter and digital innovation specialist.', role: 'author' },
  { id: 'a4', name: 'David Ochieng', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', bio: 'Sports journalist covering African and international athletics.', role: 'author' },
  { id: 'a5', name: 'Faith Njeri', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', bio: 'Health and science editor with a focus on public health policy.', role: 'editor' },
];

export const categories: Category[] = [
  { id: 'c1', name: 'Politics', slug: 'politics', color: 'primary' },
  { id: 'c2', name: 'Business', slug: 'business', color: 'secondary' },
  { id: 'c3', name: 'Technology', slug: 'technology', color: 'accent' },
  { id: 'c4', name: 'Health', slug: 'health', color: 'secondary' },
  { id: 'c5', name: 'Sports', slug: 'sports', color: 'primary' },
  { id: 'c6', name: 'Entertainment', slug: 'entertainment', color: 'accent' },
];

const articleContent = `
<p>The landscape of East African development is shifting rapidly as new initiatives take shape across the region. Leaders from multiple nations have gathered to discuss frameworks that could reshape economic cooperation and drive growth for millions.</p>

<h2>A New Chapter</h2>
<p>Experts say this marks a pivotal moment in regional cooperation. "We are seeing unprecedented levels of collaboration between governments, private sector, and civil society," said Dr. Kamau, a policy analyst at the African Development Institute.</p>

<p>The initiative is expected to create thousands of jobs and improve infrastructure across the region, with particular emphasis on digital connectivity and sustainable energy solutions.</p>

<h2>Impact on Communities</h2>
<p>Rural communities stand to benefit significantly from the proposed changes. Investment in agricultural technology and healthcare infrastructure will be prioritized in the initial phases of implementation.</p>

<p>Local leaders have expressed cautious optimism about the plans, noting that previous initiatives have sometimes failed to deliver on promises. However, the level of stakeholder engagement in this round of planning has been notably higher.</p>

<p>"This time feels different," said Margaret Auma, a community organizer in Kisumu. "The planners are actually listening to what people on the ground need."</p>
`;

export const articles: Article[] = [
  {
    id: 'art1', title: 'Kenya Launches Ambitious Digital Economy Blueprint for 2030',
    slug: 'kenya-digital-economy-blueprint-2030',
    excerpt: 'The government has unveiled a comprehensive plan to transform Kenya into Africa\'s leading digital economy hub by 2030.',
    content: articleContent, coverImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=450&fit=crop',
    categoryId: 'c3', authorId: 'a3', publishedAt: '2026-03-25T08:00:00Z', readingTime: 5,
    tags: ['digital economy', 'technology', 'Kenya'], isBreaking: true, isFeatured: true, views: 15420, status: 'approved'
  },
  {
    id: 'art2', title: 'East African Community Trade Deal Reaches Historic Milestone',
    slug: 'eac-trade-deal-milestone',
    excerpt: 'After years of negotiation, the EAC has reached a landmark agreement that could boost regional trade by 40%.',
    content: articleContent, coverImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=450&fit=crop',
    categoryId: 'c2', authorId: 'a2', publishedAt: '2026-03-25T06:30:00Z', readingTime: 7,
    tags: ['trade', 'EAC', 'economics'], isBreaking: true, isFeatured: false, views: 8930, status: 'approved'
  },
  {
    id: 'art3', title: 'Nairobi Hosts Africa Climate Action Summit with 40 Nations',
    slug: 'nairobi-africa-climate-summit',
    excerpt: 'World leaders converge in Nairobi for a groundbreaking climate summit focused on Africa\'s green energy transition.',
    content: articleContent, coverImage: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800&h=450&fit=crop',
    categoryId: 'c1', authorId: 'a1', publishedAt: '2026-03-24T14:00:00Z', readingTime: 6,
    tags: ['climate', 'summit', 'Nairobi'], isBreaking: false, isFeatured: true, views: 12100, status: 'approved'
  },
  {
    id: 'art4', title: 'Kenyan Startup Raises $50M to Expand Fintech Services Across Africa',
    slug: 'kenyan-startup-50m-fintech',
    excerpt: 'A Nairobi-based fintech company has secured one of the largest funding rounds in African tech history.',
    content: articleContent, coverImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop',
    categoryId: 'c3', authorId: 'a3', publishedAt: '2026-03-24T10:00:00Z', readingTime: 4,
    tags: ['fintech', 'startup', 'funding'], isBreaking: false, isFeatured: true, views: 9870, status: 'approved'
  },
  {
    id: 'art5', title: 'National Health Insurance Scheme Expanded to Cover 5 Million More Kenyans',
    slug: 'nhis-expansion-coverage',
    excerpt: 'The government announces a major expansion of the national health insurance program targeting underserved communities.',
    content: articleContent, coverImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=450&fit=crop',
    categoryId: 'c4', authorId: 'a5', publishedAt: '2026-03-24T07:00:00Z', readingTime: 5,
    tags: ['health', 'insurance', 'policy'], isBreaking: false, isFeatured: false, views: 6540, status: 'approved'
  },
  {
    id: 'art6', title: 'Kenya\'s Marathon Legend Breaks World Record in Tokyo',
    slug: 'kenya-marathon-world-record-tokyo',
    excerpt: 'Eliud Kipchoge\'s protégé shatters the marathon world record by over a minute in an electrifying race.',
    content: articleContent, coverImage: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=450&fit=crop',
    categoryId: 'c5', authorId: 'a4', publishedAt: '2026-03-23T16:00:00Z', readingTime: 4,
    tags: ['marathon', 'athletics', 'world record'], isBreaking: false, isFeatured: true, views: 21300, status: 'approved'
  },
  {
    id: 'art7', title: 'New Anti-Corruption Bill Passes Parliamentary Committee',
    slug: 'anti-corruption-bill-parliament',
    excerpt: 'The landmark legislation introduces tougher penalties and enhanced whistleblower protections.',
    content: articleContent, coverImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=450&fit=crop',
    categoryId: 'c1', authorId: 'a1', publishedAt: '2026-03-23T12:00:00Z', readingTime: 6,
    tags: ['corruption', 'legislation', 'parliament'], isBreaking: false, isFeatured: false, views: 7890, status: 'approved'
  },
  {
    id: 'art8', title: 'Nairobi Securities Exchange Hits All-Time High Amid Investor Confidence',
    slug: 'nse-all-time-high',
    excerpt: 'The NSE index surges past 10,000 points for the first time, driven by strong corporate earnings.',
    content: articleContent, coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop',
    categoryId: 'c2', authorId: 'a2', publishedAt: '2026-03-23T09:00:00Z', readingTime: 5,
    tags: ['NSE', 'stocks', 'investment'], isBreaking: false, isFeatured: false, views: 5430, status: 'approved'
  },
  {
    id: 'art9', title: 'Kenya Film Festival Showcases Rising African Cinema Talent',
    slug: 'kenya-film-festival-african-cinema',
    excerpt: 'The annual festival draws record attendance with powerful stories from across the continent.',
    content: articleContent, coverImage: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=450&fit=crop',
    categoryId: 'c6', authorId: 'a1', publishedAt: '2026-03-22T15:00:00Z', readingTime: 4,
    tags: ['film', 'cinema', 'culture'], isBreaking: false, isFeatured: false, views: 4560, status: 'approved'
  },
  {
    id: 'art10', title: 'Solar Energy Project to Power 2 Million Rural Homes by 2027',
    slug: 'solar-energy-rural-homes',
    excerpt: 'A landmark renewable energy initiative aims to bring electricity to off-grid communities across Kenya.',
    content: articleContent, coverImage: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=450&fit=crop',
    categoryId: 'c3', authorId: 'a3', publishedAt: '2026-03-22T11:00:00Z', readingTime: 5,
    tags: ['solar', 'renewable energy', 'rural'], isBreaking: false, isFeatured: false, views: 7120, status: 'approved'
  },
  {
    id: 'art11', title: 'Devolution Success: County Governments Show Improved Service Delivery',
    slug: 'devolution-county-service-delivery',
    excerpt: 'New report reveals significant improvements in healthcare and education at the county level.',
    content: articleContent, coverImage: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=800&h=450&fit=crop',
    categoryId: 'c1', authorId: 'a1', publishedAt: '2026-03-22T08:00:00Z', readingTime: 6,
    tags: ['devolution', 'governance', 'counties'], isBreaking: false, isFeatured: false, views: 3450, status: 'approved'
  },
  {
    id: 'art12', title: 'M-Pesa Introduces Cross-Border Payment Feature for 7 Countries',
    slug: 'mpesa-cross-border-payments',
    excerpt: 'Safaricom\'s mobile money platform expands its reach with seamless international transfers.',
    content: articleContent, coverImage: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=800&h=450&fit=crop',
    categoryId: 'c2', authorId: 'a2', publishedAt: '2026-03-21T14:00:00Z', readingTime: 4,
    tags: ['M-Pesa', 'fintech', 'mobile money'], isBreaking: false, isFeatured: false, views: 11200, status: 'approved'
  },
  {
    id: 'art13', title: 'Mental Health Awareness Campaign Reaches Record 10 Million Kenyans',
    slug: 'mental-health-awareness-campaign',
    excerpt: 'Government and NGO partnership drives unprecedented outreach for mental health support services.',
    content: articleContent, coverImage: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=450&fit=crop',
    categoryId: 'c4', authorId: 'a5', publishedAt: '2026-03-21T10:00:00Z', readingTime: 5,
    tags: ['mental health', 'awareness', 'healthcare'], isBreaking: false, isFeatured: false, views: 6780, status: 'approved'
  },
  {
    id: 'art14', title: 'Harambee Stars Qualify for Africa Cup of Nations Quarter-Finals',
    slug: 'harambee-stars-afcon-quarterfinals',
    excerpt: 'Kenya\'s national football team makes history with a stunning group-stage performance.',
    content: articleContent, coverImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=450&fit=crop',
    categoryId: 'c5', authorId: 'a4', publishedAt: '2026-03-21T07:00:00Z', readingTime: 4,
    tags: ['football', 'AFCON', 'Harambee Stars'], isBreaking: false, isFeatured: false, views: 18900, status: 'approved'
  },
  {
    id: 'art15', title: 'Kenyan Musicians Dominate Afrobeats Global Charts',
    slug: 'kenyan-musicians-afrobeats-charts',
    excerpt: 'Three Kenyan artists simultaneously chart on Billboard\'s Global 200 for the first time.',
    content: articleContent, coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=450&fit=crop',
    categoryId: 'c6', authorId: 'a1', publishedAt: '2026-03-20T16:00:00Z', readingTime: 3,
    tags: ['music', 'Afrobeats', 'entertainment'], isBreaking: false, isFeatured: false, views: 14300, status: 'approved'
  },
  {
    id: 'art16', title: 'AI Research Hub Opens in Nairobi\'s Silicon Savannah',
    slug: 'ai-research-hub-nairobi',
    excerpt: 'The new facility will train 1,000 AI engineers annually and develop solutions for African challenges.',
    content: articleContent, coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop',
    categoryId: 'c3', authorId: 'a3', publishedAt: '2026-03-20T11:00:00Z', readingTime: 5,
    tags: ['AI', 'research', 'Silicon Savannah'], isBreaking: false, isFeatured: false, views: 8900, status: 'approved'
  },
  {
    id: 'art17', title: 'Opposition and Government Reach Consensus on Electoral Reforms',
    slug: 'electoral-reforms-consensus',
    excerpt: 'Cross-party negotiations yield agreement on key reforms ahead of the next election cycle.',
    content: articleContent, coverImage: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=450&fit=crop',
    categoryId: 'c1', authorId: 'a1', publishedAt: '2026-03-20T08:00:00Z', readingTime: 7,
    tags: ['elections', 'reform', 'politics'], isBreaking: false, isFeatured: false, views: 5670, status: 'approved'
  },
  {
    id: 'art18', title: 'Tea Export Revenue Surges 25% on Strong Global Demand',
    slug: 'tea-export-revenue-surge',
    excerpt: 'Kenya maintains its position as the world\'s top tea exporter with record revenues.',
    content: articleContent, coverImage: 'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=800&h=450&fit=crop',
    categoryId: 'c2', authorId: 'a2', publishedAt: '2026-03-19T14:00:00Z', readingTime: 4,
    tags: ['tea', 'exports', 'agriculture'], isBreaking: false, isFeatured: false, views: 4230, status: 'approved'
  },
  {
    id: 'art19', title: 'Safari Rally Returns: Kenya Hosts Thrilling WRC Stage',
    slug: 'safari-rally-wrc-kenya',
    excerpt: 'The iconic Safari Rally draws global motorsport fans as Kenya showcases world-class racing infrastructure.',
    content: articleContent, coverImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=450&fit=crop',
    categoryId: 'c5', authorId: 'a4', publishedAt: '2026-03-19T10:00:00Z', readingTime: 4,
    tags: ['rally', 'WRC', 'motorsport'], isBreaking: false, isFeatured: false, views: 9100, status: 'approved'
  },
  {
    id: 'art20', title: 'New Malaria Vaccine Rollout Begins Across 15 Counties',
    slug: 'malaria-vaccine-rollout',
    excerpt: 'Kenya becomes one of the first nations to deploy the next-generation malaria vaccine at scale.',
    content: articleContent, coverImage: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&h=450&fit=crop',
    categoryId: 'c4', authorId: 'a5', publishedAt: '2026-03-19T07:00:00Z', readingTime: 5,
    tags: ['malaria', 'vaccine', 'public health'], isBreaking: false, isFeatured: false, views: 7650, status: 'approved'
  },
  {
    id: 'art21', title: 'Nairobi\'s Green City Initiative Plants 1 Million Trees',
    slug: 'nairobi-green-city-trees',
    excerpt: 'The capital celebrates a major milestone in its urban reforestation and sustainability program.',
    content: articleContent, coverImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=450&fit=crop',
    categoryId: 'c1', authorId: 'a1', publishedAt: '2026-03-18T12:00:00Z', readingTime: 4,
    tags: ['environment', 'trees', 'sustainability'], isBreaking: false, isFeatured: false, views: 5890, status: 'approved'
  },
];

export const comments: Comment[] = [
  { id: 'cm1', articleId: 'art1', authorName: 'Peter K.', content: 'This is exactly the kind of forward-thinking policy Kenya needs. Excited to see how this unfolds.', createdAt: '2026-03-25T09:15:00Z' },
  { id: 'cm2', articleId: 'art1', authorName: 'Sarah M.', content: 'I hope this actually reaches rural areas too, not just Nairobi.', createdAt: '2026-03-25T09:45:00Z' },
  { id: 'cm3', articleId: 'art1', authorName: 'John O.', content: 'Great point Sarah. Infrastructure is key.', createdAt: '2026-03-25T10:00:00Z', parentId: 'cm2' },
  { id: 'cm4', articleId: 'art2', authorName: 'Lucy W.', content: 'Free trade across EAC will benefit small businesses the most.', createdAt: '2026-03-25T07:30:00Z' },
  { id: 'cm5', articleId: 'art2', authorName: 'Moses N.', content: 'About time! This has been in negotiations for too long.', createdAt: '2026-03-25T08:00:00Z' },
  { id: 'cm6', articleId: 'art3', authorName: 'Anne T.', content: 'Kenya leading on climate action is inspiring for the whole continent.', createdAt: '2026-03-24T15:00:00Z' },
  { id: 'cm7', articleId: 'art4', authorName: 'Brian K.', content: '$50M is massive! Kenyan tech is truly going global.', createdAt: '2026-03-24T11:00:00Z' },
  { id: 'cm8', articleId: 'art6', authorName: 'Christine A.', content: 'What a race! Kenya continues to dominate long-distance running. 🇰🇪', createdAt: '2026-03-23T17:00:00Z' },
  { id: 'cm9', articleId: 'art6', authorName: 'Daniel M.', content: 'This generation of runners is incredibly talented.', createdAt: '2026-03-23T17:30:00Z' },
  { id: 'cm10', articleId: 'art14', authorName: 'Kevin O.', content: 'Harambee Stars making us proud! Let\'s go all the way!', createdAt: '2026-03-21T08:00:00Z' },
  { id: 'cm11', articleId: 'art14', authorName: 'Mercy W.', content: 'Historic moment for Kenyan football. Well deserved.', createdAt: '2026-03-21T08:30:00Z' },
  { id: 'cm12', articleId: 'art12', authorName: 'Tom N.', content: 'M-Pesa continues to revolutionize how we handle money.', createdAt: '2026-03-21T15:00:00Z' },
  { id: 'cm13', articleId: 'art15', authorName: 'Diana K.', content: 'Kenyan music is on fire right now! So proud of our artists.', createdAt: '2026-03-20T17:00:00Z' },
  { id: 'cm14', articleId: 'art16', authorName: 'Paul G.', content: 'AI in Africa will solve uniquely African problems. Love this.', createdAt: '2026-03-20T12:00:00Z' },
  { id: 'cm15', articleId: 'art20', authorName: 'Rose A.', content: 'This vaccine rollout will save so many lives. Thank you to all the healthcare workers.', createdAt: '2026-03-19T08:00:00Z' },
  { id: 'cm16', articleId: 'art20', authorName: 'Hassan M.', content: 'My county is on the list! When do we start?', createdAt: '2026-03-19T09:00:00Z', parentId: 'cm15' },
];

export function getArticlesByCategory(categoryId: string): Article[] {
  return articles.filter(a => a.categoryId === categoryId && a.status === 'approved');
}

export function getBreakingNews(): Article[] {
  return articles.filter(a => a.isBreaking && a.status === 'approved');
}

export function getFeaturedArticles(): Article[] {
  return articles.filter(a => a.isFeatured && a.status === 'approved');
}

export function getTrendingArticles(): Article[] {
  return [...articles].filter(a => a.status === 'approved').sort((a, b) => b.views - a.views).slice(0, 5);
}

export function getLatestArticles(): Article[] {
  return [...articles].filter(a => a.status === 'approved').sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find(a => a.slug === slug);
}

export function getArticleComments(articleId: string): Comment[] {
  return comments.filter(c => c.articleId === articleId);
}

export function getAuthor(id: string): Author | undefined {
  return authors.find(a => a.id === id);
}

export function getCategory(id: string): Category | undefined {
  return categories.find(c => c.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(c => c.slug === slug);
}

export function searchArticles(query: string): Article[] {
  const q = query.toLowerCase();
  return articles.filter(a =>
    a.status === 'approved' && (
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q))
    )
  );
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}
