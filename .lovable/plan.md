# Kenya Ignite Editorial Makeover

## Direction
Rebuild the site around the selected **Editorial Minimalist** concept: a Kenyan newsroom aesthetic using paper `#F5F3EE`, ink `#111111`, red `#BB1E10`, and green `#0B6B3A`, with **Archivo Black** headlines and **Hind** body copy. The result will feel graphical, image-led, sharp, and energetic rather than glassy or app-generic.

## What will change

### 1. Shared visual system
- Replace the current glass effects, soft gradients, glow styling, and rounded-card language with crisp editorial rules, flat paper surfaces, restrained shadows, and sharp or lightly rounded edges.
- Add the selected typography through the document head and map it to the existing font tokens.
- Introduce reusable editorial motion: masked image reveals, staggered text entrances, moving rules, subtle image zoom/parallax, and ticker motion with reduced-motion fallbacks.
- Preserve Kenya Ignite’s red, green, black, and paper identity consistently across public, account, author, and admin screens.

### 2. Masthead and navigation
- Turn the header into a strong publication masthead with a bold Kenya Ignite wordmark, Nairobi/date line, tagline, category rail, search, account access, and admin access.
- Restyle the breaking-news strip as a crisp newsroom ticker.
- Keep the mobile experience compact and app-like, including the fixed bottom navigation and no mobile footer.

### 3. Homepage
- Recompose the first screen as the selected magazine layout:
  - latest briefs on the left,
  - one dominant image-led lead story in the center,
  - ranked trending stories on the right.
- Use actual published article imagery and content throughout.
- Convert category sections into editorial story grids with varied image scale and stronger visual rhythm instead of repeated floating cards.
- Ensure the next section remains visible on common desktop and mobile screens.

### 4. Stories and discovery
- Redesign article cards into reusable editorial variants for lead stories, briefs, ranked stories, horizontal lists, and category grids.
- Redesign article pages with a stronger title block, large cover image, readable article column, utility rail, audio controls, tags, comments, and related stories.
- Restyle category and search pages with clear section mastheads, filters, empty states, and responsive story grids.
- Keep canonical links, sharing URLs, metadata, view tracking, comments, and audio reading behavior unchanged.

### 5. Accounts and publishing tools
- Apply the same visual language to sign-in, author dashboard, editor, and admin pages without reducing functionality.
- Improve scanability with stronger tables/lists, status treatments, image previews, and compact action controls.
- Preserve authentication, article publishing, uploads, moderation, statistics, user management, and all existing permissions.

### 6. Responsive and quality pass
- Tune layouts for desktop, tablet, and mobile so headlines never collide, images remain well framed, and controls stay usable.
- Verify key flows in the live preview: homepage, search, category, article, sign-in, author dashboard, and admin navigation.
- Check reduced-motion behavior, keyboard focus, image alt text, semantic headings, and loading/empty states.

## Technical notes
- The redesign stays within the existing React, Tailwind, and Framer Motion setup.
- Global visual tokens and animation primitives will live in the shared stylesheet and Tailwind configuration; page code will consume semantic classes.
- Existing data queries and backend behavior will not be changed unless a visual component requires a safe compatibility adjustment.
- The selected prototype controls composition and density; its sample content and off-palette styling will not replace real Kenya Ignite content or the locked palette/type choices.
