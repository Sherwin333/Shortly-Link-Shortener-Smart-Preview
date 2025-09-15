# Shortly — Link Shortener + Smart Preview

Tech: Next.js, Tailwind CSS, Supabase (Postgres), open-graph-scraper, nanoid

Run:
1. `npm install`
2. Create `.env.local` with NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BASE_URL
3. `npm run dev`

Deployed: Vercel (set env variables in project settings)

Notes:
- Server-side OG scraping in `/api/shorten`
- Preview pages at `/preview/[short_id]`
- Important: validate URLs to prevent SSRF and add rate-limiting for production.
