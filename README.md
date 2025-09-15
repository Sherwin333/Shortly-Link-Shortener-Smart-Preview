# Shortly — Link Shortener + Smart Preview

A simple link shortener with smart preview support (title, description, image).

---

## Tech Stack
- Next.js 15 (App Router + Turbopack)
- Tailwind CSS
- Supabase (Postgres)
- nanoid (for unique short IDs)
- open-graph-scraper (for metadata parsing)

---

## Features
- Shorten any valid URL
- Fetch and display Open Graph previews
- Responsive UI with Tailwind
- Supabase backend for storage
- Serverless API routes for shorten & preview
- Preview pages at `/r/[id]`

---

## Getting Started (Local Development)

1. Clone & install
   ```bash
   git clone https://github.com/<your-username>/shortly.git
   cd shortly
   npm install

2. Create .env.local file

    NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
    SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
    BASE_URL=http://localhost:3000


Note: SUPABASE_SERVICE_ROLE_KEY is secret and must only be used on the server.

3. Run development server

    npm run dev


4. Open in browser

    http://localhost:3000

##  Project Structure

src/
 ├─ app/
 │   ├─ page.tsx             # Landing page
 │   ├─ r/[id]/page.tsx      # Preview page for shortened link
 │   ├─ api/
 │   │   ├─ shorten/route.ts # API: shorten + metadata
 │   │   └─ preview/route.ts # API: fetch OG preview
 │
 ├─ lib/
 │   ├─ supabaseClient.ts    # Client-side Supabase instance
 │   └─ supabaseServer.ts    # Server-side Supabase instance
 │
 └─ styles/                  # Tailwind + global styles
