"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ---------- icons ---------- */
const IconCopy = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="9" y="9" width="10" height="10" rx="2" ry="2" />
    <rect x="3" y="3" width="10" height="10" rx="2" ry="2" />
  </svg>
);
const IconOpen = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M14 3h7v7" />
    <path d="M10 14L21 3" />
    <path d="M21 21H3V3" />
  </svg>
);
const IconShare = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
    <path d="M16 6l-4-4-4 4" />
    <path d="M12 2v13" />
  </svg>
);
const IconSun = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M4.2 4.2l1.4 1.4" />
    <path d="M18.4 18.4l1.4 1.4" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M4.2 19.8l1.4-1.4" />
    <path d="M18.4 5.6l1.4-1.4" />
  </svg>
);
const IconMoon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

/* ---------- helpers (normalize + upsert) ---------- */
function normalizeUrl(u: string) {
  try {
    const url = new URL(u.trim());
    url.hash = "";
    url.search = "";
    url.pathname = url.pathname.replace(/\/$/, "");
    url.hostname = url.hostname.replace(/^www\./, "");
    return url.toString();
  } catch {
    return u.trim();
  }
}
function upsertHistoryItem(historyArr: any[], item: any, max = 500) {
  const idx = historyArr.findIndex((h) => {
    if (h.id && item.id && h.id === item.id) return true;
    if (h.short && item.short && h.short === item.short) return true;
    if (h.original && item.original && normalizeUrl(h.original) === normalizeUrl(item.original)) return true;
    return false;
  });
  const normalized = { ...item, createdAt: new Date().toISOString() };
  const newHistory = [...historyArr];
  if (idx !== -1) newHistory.splice(idx, 1);
  newHistory.unshift(normalized);
  if (newHistory.length > max) return newHistory.slice(0, max);
  return newHistory;
}

/* ---------- theme map ---------- */
const THEMES: Record<string, any> = {
  default: {
    bgStyle: "linear-gradient(180deg,#0b0710 0%,#0f0b13 100%)",
    blobA: "radial-gradient(circle,#49f6d4,#7c6bff)",
    blobB: "radial-gradient(circle,#ff89b3,#7effc7)",
    accentFrom: "#4ee6cc",
    accentTo: "#9a7dff",
  },
  neon: {
    bgStyle: "linear-gradient(180deg,#050111 0%,#001119 100%)",
    blobA: "radial-gradient(circle,#ff4dd2,#8a6bff)",
    blobB: "radial-gradient(circle,#00ffd5,#00a3ff)",
    accentFrom: "#ff5ec8",
    accentTo: "#4ddfff",
  },
  warm: {
    bgStyle: "linear-gradient(180deg,#1a0707 0%,#2b0e10 100%)",
    blobA: "radial-gradient(circle,#ffbe78,#ff8b6b)",
    blobB: "radial-gradient(circle,#ffd2a6,#ff7ea6)",
    accentFrom: "#ffb86b",
    accentTo: "#ff6b6b",
  },
};

/* ---------- Cursor reactive background component ---------- */
/* CursorBackground — place in app/page.tsx (replace previous) */
function CursorBackground({
  enabled = true,
  colorFrom = "rgba(107,70,255,0.16)",
  colorTo = "rgba(2,6,23,1)",
}: {
  enabled?: boolean;
  colorFrom?: string;
  colorTo?: string;
}) {
  const [pos, setPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (!enabled) return;
    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setPos({ x, y });
    };
    // passive for perf
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, [enabled]);

  const style: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: -58,                // <- between -60 (bg) and -55 (blobs)
    pointerEvents: "none",
    transition: "background 80ms linear",
    // layered radial + subtle darker overlay to blend with theme
    background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, ${colorFrom} 0%, transparent 18%), ${colorTo}`,
    mixBlendMode: "screen",
    opacity: 0.98,
  };

  return <div style={style} aria-hidden />;
}


/* ---------- GradientButton (reusable) ---------- */
function GradientButton({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden rounded-2xl font-semibold text-black px-5 py-3 shadow-md group ${className}`}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* animated gradient background (stretched) */}
      <span className="absolute inset-0 bg-gradient-animated -z-10" aria-hidden />
      {/* glow */}
      <span className="absolute inset-0 blur-xl opacity-30 -z-20 gradient-glow" aria-hidden />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

/* ---------- main component (UI polished + interactive bg + gradient button) ---------- */
export default function Page() {
  // core states
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<any | null>(null);
  const [shortLink, setShortLink] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // UI states
  const [toast, setToast] = useState<string | null>(null);
  const [theme, setTheme] = useState<keyof typeof THEMES>("default");
  const [isLight, setIsLight] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [page, setPage] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // load persisted data
  useEffect(() => {
    try {
      const raw = localStorage.getItem("lp_history");
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
    const tRaw = localStorage.getItem("lp_theme");
    if (tRaw && (tRaw === "default" || tRaw === "neon" || tRaw === "warm")) setTheme(tRaw as any);
    const lightRaw = localStorage.getItem("lp_light");
    if (lightRaw) setIsLight(lightRaw === "1");
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("lp_history", JSON.stringify(history));
    } catch {}
  }, [history]);
  useEffect(() => localStorage.setItem("lp_theme", theme), [theme]);
  useEffect(() => localStorage.setItem("lp_light", isLight ? "1" : "0"), [isLight]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1400);
    return () => clearTimeout(t);
  }, [toast]);

  // Ctrl/Cmd + K focus shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setToast("Focused input");
      }
      if (e.key === "Escape") inputRef.current?.blur();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const showToast = (t: string) => setToast(t);

  // validation helper
  function isValidHttpUrl(input: string) {
    try {
      const u = new URL(input);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

  // create short link + fetch preview from your API
  async function createShort() {
    setErr(null);
    setPreview(null);
    setShortLink(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setErr("Please enter a URL");
      return;
    }
    if (!isValidHttpUrl(trimmed)) {
      setErr("Enter a valid URL (must include http/https)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Server error");

      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const link = `${origin}/r/${json.short}`;
      const normalizedOriginal = normalizeUrl(trimmed);

      const item = { id: json.short, original: normalizedOriginal, short: link, title: json.title ?? normalizedOriginal, image: json.image ?? null };

      setPreview({ title: json.title, description: json.description, image: json.image, original: normalizedOriginal });
      setShortLink(link);
      setHistory((h) => upsertHistoryItem(h, item, 500));
      setUrl("");
      showToast("Created");
    } catch (e: any) {
      setErr(e?.message || "Unknown error");
      showToast("Failed");
    } finally {
      setLoading(false);
    }
  }

  // copying / sharing / history mgmt
  async function copyText(t?: string | null) {
    if (!t) return;
    try {
      await navigator.clipboard.writeText(t);
      showToast("Copied");
    } catch {
      showToast("Copy failed");
    }
  }
  async function shareLink() {
    if (!shortLink) return;
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({ title: preview?.title || "Link", url: shortLink });
        showToast("Shared");
      } catch {}
    } else {
      copyText(shortLink);
    }
  }
  function clearHistory() {
    setHistory([]);
    showToast("History cleared");
  }
  function exportHistory() {
    try {
      const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "link_preview_history.json";
      a.click();
      URL.revokeObjectURL(url);
      showToast("Exported");
    } catch {
      showToast("Export failed");
    }
  }
  function importHistory(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed)) throw new Error("Invalid file");
        const sanitized = parsed
          .filter(Boolean)
          .map((it: any) => ({
            id: it.id ?? Math.random().toString(36).slice(2, 9),
            original: it.original ?? it.url ?? "",
            short: it.short ?? "",
            title: it.title ?? "",
            image: it.image ?? null,
            createdAt: it.createdAt ?? new Date().toISOString(),
          }));
        let merged = [...history];
        sanitized.forEach((it: any) => {
          merged = upsertHistoryItem(merged, it, 1000);
        });
        setHistory(merged);
        showToast("Imported");
      } catch {
        showToast("Import failed");
      }
    };
    reader.readAsText(file);
  }

  // history filtering/paging
  const filtered = history.filter((h) => {
    if (!searchQ.trim()) return true;
    const q = searchQ.toLowerCase();
    const t = (h.title || "") + " " + (h.original || "") + " " + (h.short || "");
    return t.toLowerCase().includes(q);
  });
  const PAGE_SIZE = 8;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  // skeleton while loading
  const PreviewSkeleton = () => (
    <div className="mt-6 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900/30 animate-pulse p-4">
      <div className="h-40 bg-neutral-800 rounded-md mb-4" />
      <div className="h-5 bg-neutral-800 rounded w-3/4 mb-2" />
      <div className="h-4 bg-neutral-800 rounded w-5/6 mb-2" />
      <div className="h-4 bg-neutral-800 rounded w-1/2" />
    </div>
  );

  const themeObj = THEMES[theme];

  // Title style: gradient overlay
  const titleStyle: React.CSSProperties = {
    background: `linear-gradient(90deg, ${themeObj.accentFrom}, ${themeObj.accentTo})`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  return (
    <>
      {/* dynamic background and animated blobs */}
      <div style={{ background: themeObj.bgStyle, minHeight: "100vh", position: "fixed", inset: 0, zIndex: -60 }} />
      <div style={{ position: "fixed", inset: 0, zIndex: -55, pointerEvents: "none" }}>
        <motion.div
          animate={{ x: [0, -30, 30, 0], y: [0, -20, 20, 0] }}
          transition={{ repeat: Infinity, duration: 30 }}
          style={{ position: "absolute", left: "-8%", top: "-12%", width: 420, height: 420, background: themeObj.blobA, filter: "blur(34px)", mixBlendMode: "screen", opacity: 0.22 }}
        />
        <motion.div
          animate={{ x: [0, 30, -30, 0], y: [0, 20, -20, 0] }}
          transition={{ repeat: Infinity, duration: 36 }}
          style={{ position: "absolute", right: "-8%", bottom: "-12%", width: 520, height: 520, background: themeObj.blobB, filter: "blur(34px)", mixBlendMode: "screen", opacity: 0.22 }}
        />
      </div>

      {/* cursor-reactive subtle background */}
      <CursorBackground enabled={true} colorFrom="rgba(107,70,255,0.16)" colorTo="rgba(2,6,23,1)" />

      <div className={isLight ? "app-wrapper light" : "app-wrapper dark"}>
        <main className="min-h-screen py-12 px-6">
          <div className="center-max">

            {/* top product header (centered) */}
            <div className="mb-8 text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-3" style={titleStyle}>Link Preview & Shortener</h1>
              <p className="text-neutral-400">Paste a URL and instantly get a compact short link + rich preview card. Fast, private, and simple.</p>
            </div>

            {/* main control (centered big input) */}
            <div className="mb-8">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <div className="input-emboss absolute left-2 top-1/2 -translate-y-1/2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-60">
                        <path d="M21 21l-4.35-4.35" />
                        <circle cx="11" cy="11" r="6" />
                      </svg>
                    </div>
                    <input
                      aria-label="URL"
                      ref={inputRef}
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Paste a URL (https://example.com)"
                      className="w-full pl-10 pr-4 py-4 rounded-2xl shadow-lg bg-neutral-900/50 border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[#60f1d6]"
                      onKeyDown={(e) => { if (e.key === "Enter") createShort(); }}
                    />
                  </div>

                  <GradientButton onClick={createShort} className="ml-2" >
                    {loading ? "Creating..." : "Create"}
                  </GradientButton>
                </div>

                {err && <div className="mt-3 text-sm text-red-400 text-center">{err}</div>}

                {/* created short link quick bar */}
                {shortLink && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-lg bg-neutral-900/30 border border-neutral-800 flex items-center justify-between gap-4">
                    <div className="text-sm text-neutral-300 truncate break-all">
                      Short link: <a href={shortLink} className="text-[#9b67ff] underline" target="_blank" rel="noreferrer">{shortLink}</a>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => copyText(shortLink)} className="px-3 py-1 rounded-md bg-white/6 flex items-center gap-2"><IconCopy className="w-4 h-4" /> Copy</button>
                      <button onClick={() => window.open(shortLink, "_blank")} className="px-3 py-1 rounded-md bg-white/6 flex items-center gap-2"><IconOpen className="w-4 h-4" /> Open</button>
                      <button onClick={shareLink} className="px-3 py-1 rounded-md bg-white/6 flex items-center gap-2"><IconShare className="w-4 h-4" /> Share</button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* left: preview area (larger) */}
              <section className="lg:col-span-2 glass p-6 rounded-2xl border border-white/5 shadow-lg min-h-[220px]">
                {loading && <PreviewSkeleton />}

                {!preview && !loading && (
                  <div className="h-40 flex items-center justify-center text-neutral-500">
                    Paste a URL above and press Create to generate a preview and short link.
                  </div>
                )}

                {preview && !loading && (
                  <motion.article initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-2 rounded-lg overflow-hidden border border-neutral-800 bg-gradient-to-br from-black/40 to-black/20">
                    <div className="grid grid-cols-1 md:grid-cols-3">
                      <div className="md:col-span-1 p-4 flex items-center justify-center bg-neutral-900/40">
                        {preview.image ? (
                          <img src={preview.image} alt={preview.title || "preview"} className="object-cover rounded-md shadow-sm w-full h-48" onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}} />
                        ) : (
                          <div className="text-neutral-500 p-6">No image</div>
                        )}
                      </div>

                      <div className="md:col-span-2 p-6">
                        <h2 className="text-lg md:text-xl font-semibold text-[#dbeef7] truncate">{preview.title || "No title"}</h2>
                        <p className="text-neutral-300 mt-2 line-clamp-3">{preview.description || "No description available."}</p>

                        <div className="mt-4 flex flex-wrap gap-3">
                          <button onClick={() => window.open(shortLink ?? "#", "_blank")} className="rounded-md px-3 py-2 text-sm" style={{ background: `linear-gradient(90deg, ${themeObj.accentFrom}, ${themeObj.accentTo})`, color: "#000" }}>Open</button>
                          <button onClick={() => copyText(shortLink)} className="rounded-md px-3 py-2 text-sm bg-white/8">Copy short</button>
                          <button onClick={() => copyText(preview.original)} className="rounded-md px-3 py-2 text-sm bg-white/8">Copy original</button>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                )}
              </section>

              {/* right: recent & management (compact responsive grid) */}
              <aside className="glass p-4 rounded-2xl border border-white/5 shadow-md">
                <div className="flex items-center justify-between mb-3 gap-3">
                  <h3 className="text-sm text-neutral-300 font-medium">Recent</h3>

                  <div className="flex items-center gap-2">
                    <input
                      value={searchQ}
                      onChange={(e) => { setSearchQ(e.target.value); setPage(0); }}
                      placeholder="Search history..."
                      className="px-2 py-1 rounded bg-neutral-900/30 text-xs border border-neutral-800"
                    />
                    <button onClick={clearHistory} className="text-xs text-red-400 hover:underline">Clear</button>
                  </div>
                </div>

                {filtered.length === 0 ? (
                  <div className="text-neutral-500 text-sm">No recent links yet.</div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-3">
                      {pageItems.map((h) => (
                        <motion.div
                          key={h.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -4, boxShadow: "0 12px 30px rgba(0,0,0,0.35)" }}
                          transition={{ type: "spring", stiffness: 260, damping: 20 }}
                          className="flex items-center gap-3 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900/40 p-2"
                        >
                          <div className="w-20 h-14 flex-shrink-0 bg-neutral-800 rounded overflow-hidden">
                            {h.image ? (
                              <img src={h.image} alt={h.title || ""} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-neutral-800" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white font-semibold truncate">{h.title || h.original}</div>
                            <div className="text-xs text-neutral-400 mt-1">{metaLine(h)}</div>
                            <div className="text-xs text-neutral-500 truncate mt-1">{h.short}</div>
                          </div>

                          <div className="flex flex-col gap-2 ml-2">
                            <button onClick={() => window.open(h.short, "_blank")} className="px-2 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow">Open</button>
                            <button onClick={() => copyText(h.short)} className="px-2 py-1 rounded-md text-xs font-medium bg-white/6">Copy</button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {pageCount > 1 && (
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <button onClick={() => setPage((p) => Math.max(0, p - 1))} className="px-3 py-1 rounded bg-neutral-900/30 text-xs" disabled={page === 0}>Prev</button>
                        <div className="text-xs text-neutral-400">Page {page + 1} / {pageCount}</div>
                        <button onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} className="px-3 py-1 rounded bg-neutral-900/30 text-xs" disabled={page === pageCount - 1}>Next</button>
                      </div>
                    )}
                  </>
                )}

                <div className="mt-6 flex gap-2">
                  <button onClick={exportHistory} className="flex-1 px-3 py-2 rounded-md bg-white/6 text-sm">Export</button>
                  <label className="cursor-pointer px-3 py-2 rounded-md bg-white/6 text-sm">
                    Import
                    <input type="file" accept="application/json" onChange={(e) => importHistory(e.target.files?.[0] ?? null)} style={{ display: "none" }} />
                  </label>
                </div>

                <div className="mt-6 text-center text-xs text-neutral-500">Built By Sherwin <span className="text-red-400">❤</span></div>
              </aside>
            </div>
          </div>
        </main>

        {/* toast */}
        <div className="toast-wrap">
          <AnimatePresence>
            {toast && (
              <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 22 }} className="toast">
                {toast}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

/* helper metaLine */
function metaLine(item: any) {
  try {
    const urlObj = new URL(item.original);
    const hostname = urlObj.hostname.replace("www.", "");
    const ts = item.createdAt ? new Date(item.createdAt).toLocaleString() : "";
    return `${hostname} • ${ts}`;
  } catch {
    return "";
  }
}
