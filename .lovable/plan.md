# Article link preview matching the reference

## Goal
Make each shared article URL render a WhatsApp-style preview with the story cover photo, headline, short excerpt, and `jubachronicles.com` domain, matching the attached example.

## Changes
- Keep the public shared URL as `https://jubachronicles.com/article/{slug}`.
- Strengthen the server-rendered article metadata so WhatsApp, Facebook, X, Telegram, and similar crawlers receive the story title, excerpt, and a 1200×630 cover image in the initial HTML.
- Use the Juba Chronicle fallback card only when a story has no valid cover photo.
- Add complete image metadata and article publishing metadata while keeping the public author label as “Our Correspondent”.
- Ensure crawler routing catches article links consistently, including trailing slashes.
- Keep browser visitors on the normal article page and avoid exposing backend function URLs in shared links.

## Verification
- Inspect the generated HTML with WhatsApp/Facebook and X crawler user agents.
- Confirm the canonical URL and preview URL stay on `jubachronicles.com`.
- Confirm an article with a cover uses its image, while an article without one uses the branded fallback.

## Hosting step
The updated `.htaccess`, `og.php`, and fallback image must be included when the built site is uploaded to cPanel. Existing WhatsApp/Facebook previews may require “Scrape Again” because those services cache older cards.
