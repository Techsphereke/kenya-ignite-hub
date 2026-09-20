# Juba Chronicle makeover roadmap
- [x] Lock editorial palette, type, and layout direction
- [x] Rebuild shared visual tokens, masthead, ticker, footer, and mobile navigation
- [x] Recompose homepage and article card system
- [x] Restyle article, category, search, and sign-in pages
- [x] Restyle author and admin work areas
- [x] Verify public desktop and mobile previews and correct visual/runtime issues

## Pending (needs your action)
- [ ] Upload public/.htaccess, public/og.php and public/og-image.png to the jubachronicles.com hosting, then re-run Facebook Sharing Debugger + Twitter Card Validator (use "Scrape Again").

## Article share previews
- [x] Match WhatsApp-style previews with story image, headline, excerpt, and Juba Chronicle domain
- [x] Keep contributor identity private as “Our Correspondent” in article metadata
- [x] Support article URLs with or without a trailing slash

## WordPress-style newsroom workspace
- [x] Redesign the author posts list and post editor
- [x] Redesign the admin navigation and overview dashboard
- [x] Align article, user, and comment management screens
- [x] Connect author dashboard, media library, comments, and profile views
- [x] Add visible admin-panel access for administrators and editors
- [ ] Verify authenticated author and admin flows after session refresh

## Security hardening
- [x] Writer profiles made private (public bylines stay "Our Correspondent")
- [x] Comments limited to published stories, with length and markup checks
- [x] Database helper functions closed to the public API
- [x] Uploads confined to each user own folder, 10MB cap
- [x] Leaked-password protection and current-password requirement enabled
- [x] Security headers, no directory listing, blocked source files in .htaccess
- [ ] Enable HTTPS redirect + HSTS in .htaccess once SSL is active on jubachronicles.com
