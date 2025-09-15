// app/api/preview/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { nanoid } from 'nanoid';

// open-graph-scraper has no perfect TS types; ignore for TS.
 // eslint-disable-next-line @typescript-eslint/ban-ts-comment
 // @ts-ignore
import ogs from 'open-graph-scraper';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = (body?.url || '').trim();
    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    // Basic URL normalization/validation
    let normalized = url;
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = 'https://' + normalized;
    }
    try {
      new URL(normalized);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Fetch OG metadata server-side
    let title = null;
    let description = null;
    let image = null;

    try {
      const { result } = await ogs({ url: normalized, timeout: 10000 });
      title = result?.ogTitle ?? result?.title ?? null;
      description = result?.ogDescription ?? null;
      // ogImage can be an object or array
      const ogImg = result?.ogImage;
      if (ogImg) {
        if (Array.isArray(ogImg) && ogImg.length) image = ogImg[0].url;
        else if (ogImg.url) image = ogImg.url;
      }
    } catch (err) {
      // If OG scraping fails, continue with nulls (we still save original URL)
      console.warn('OG fetch failed', err);
    }

    // Generate short id & insert
    const short_id = nanoid(8);
    const { data, error: dbErr } = await supabaseServer
      .from('links')
      .insert([{ short_id, original_url: normalized, title, description, image }])
      .select()
      .single();

    if (dbErr) {
      console.error('Supabase insert error', dbErr);
      return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }

    return NextResponse.json(
      {
        short: data.short_id,
        title: data.title,
        description: data.description,
        image: data.image,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
