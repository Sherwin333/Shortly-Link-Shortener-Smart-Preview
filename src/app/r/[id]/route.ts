// src/app/r/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const short_id = params.id;
  if (!short_id) return NextResponse.redirect("/", 302);

  const supabase = getSupabaseServer();

  // lookup original URL
  const { data, error } = await supabase
    .from("links")
    .select("id, original_url")
    .eq("short_id", short_id)
    .limit(1)
    .single();

  if (error || !data || !data.original_url) {
    // not found → redirect to homepage or 404
    return NextResponse.redirect("/", 302);
  }

  const original = data.original_url as string;

  // OPTIONAL: record a click (non-blocking) — ignore result
  void supabase.from("clicks").insert([{ link_id: data.id }]);

  // perform the redirect
  return NextResponse.redirect(original, 307);
}
