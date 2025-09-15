// app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

/* ------------------------
   ICONS (compact)
   ------------------------ */
const IconCopy = ({ className = "" }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="9" y="9" width="10" height="10" rx="2" ry="2" />
    <rect x="3" y="3" width="10" height="10" rx="2" ry="2" />
  </svg>
);
const IconOpen = ({ className = "" }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M14 3h7v7" />
    <path d="M10 14L21 3" />
    <path d="M21 21H3V3" />
  </svg>
);
const IconShare = ({ className = "" }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
    <path d="M16 6l-4-4-4 4" />
    <path d="M12 2v13" />
  </svg>
);

/* ------------------------
   IconButton (neat + mobile label + pulse)
   - uses motion.button for whileTap pulse
   - shows small label under icon on small screens
   ------------------------ */
function IconButton({
  title,
  onClick,
  children,
  size = 9,
  blobLabelOnMobile = true,
  className = "",
}: {
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
  size?: number;
  blobLabelOnMobile?: boolean;
  className?: string;
}) {
  const px = size * 4;
  return (
    <div className="flex flex-col items-center">
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={onClick}
        aria-label={title}
        title={title}
        className={`group flex items-center justify-center rounded-full shadow-md transition-transform transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 bg-neutral-900/60 border border-neutral-800 ${className}`}
        style={{ width: px, height: px }}
      >
        <div className="text-neutral-100 group-hover:text-white">{children}</div>
      </motion.button>

      {/* Mobile label shown only on small screens (sm:hidden) */}
      {blobLabelOnMobile && (
        <div className="mt-2 text-xs text-neutral-300 sm:hidden text-center select-none" style={{ width: px }}>
          {title}
        </div>
      )}
    </div>
  );
}

/* ------------------------
   Helpers: normalize + upsert history
   ------------------------ */
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
function upsertHistoryItem(historyArr: any[], item: any, max = 60) {
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

/* ------------------------
   THEME MAPS (background + blob colors)
   ------------------------ */
const THEMES: Record<
  string,
  { bgStyle: string; blobA: string; blobB: string; accentFrom: string; accentTo: string }
> = {
  default: {
    bgStyle: "linear-gradient(180deg,#020617 0%,#071028 100%)",
    blobA: "radial-gradient(circle,#00f0d1,#5b6bff)",
    blobB: "radial-gradient(circle,#ff6ad5,#7effc7)",
    accentFrom: "#60f1d6",
    accentTo: "#8a7bff",
  },
  neon: {
    bgStyle: "linear-gradient(180deg,#050111 0%,#001119 100%)",
    blobA: "radial-gradient(circle,#ff0099,#7c4dff)",
    blobB: "radial-gradient(circle,#00ffd5,#00a3ff)",
    accentFrom: "#ff4dd2",
    accentTo: "#4ddfff",
  },
  warm: {
    bgStyle: "linear-gradient(180deg,#10040a 0%,#241017 100%)",
    blobA: "radial-gradient(circle,#ffb86b,#ff6b6b)",
    blobB: "radial-gradient(circle,#ffd2a6,#ff7ea6)",
    accentFrom: "#ffb86b",
    accentTo: "#ff6b6b",
  },
};

/* ------------------------
   MAIN PAGE
   ------------------------ */
export default function Page() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [shortLink, setShortLink] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [theme, setTheme] = useState<keyof typeof THEMES>("default");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("lp_history");
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem("lp_history", JSON.stringify(history));
  }, [history]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1300);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (t: string) => setToast(t);

  async function createShort() {
    setErr(null);
    setPreview(null);
    setShortLink(null);

    if (!url.trim()) {
      setErr("Please enter a URL");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Server error");

      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const link = `${origin}/r/${json.short}`;
      const normalizedOriginal = normalizeUrl(url);

      const item = { id: json.short, original: normalizedOriginal, short: link, title: json.title, image: json.image ?? null };

      setPreview({ title: json.title, description: json.description, image: json.image, original: normalizedOriginal });
      setShortLink(link);
      setHistory((h) => upsertHistoryItem(h, item, 60));
      showToast("Created");
    } catch (e: any) {
      setErr(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

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
      } catch {
        // ignore
      }
    } else {
      copyText(shortLink);
    }
  }

  function clearHistory() {
    setHistory([]);
    showToast("History cleared");
  }

  // Recent excluding current preview
  const recentToShow = history.filter((h) => h.short !== shortLink);

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

  // theme styles
  const themeObj = THEMES[theme];

  return (
    <>
      {/* background container with dynamic inline gradient and blobs */}
      <div style={{ background: themeObj.bgStyle, minHeight: "100vh", position: "fixed", inset: 0, zIndex: -60 }} />
      <div style={{ position: "fixed", inset: 0, zIndex: -55, pointerEvents: "none" }}>
        <div style={{ position: "absolute", left: "-8%", top: "-12%", width: 420, height: 420, background: themeObj.blobA, filter: "blur(34px)", mixBlendMode: "screen", opacity: 0.22 }} />
        <div style={{ position: "absolute", right: "-8%", bottom: "-12%", width: 520, height: 520, background: themeObj.blobB, filter: "blur(34px)", mixBlendMode: "screen", opacity: 0.22 }} />
      </div>

      <main className="min-h-screen py-12 px-6">
        <div className="center-max">
          <header className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent" style={{ background: `linear-gradient(90deg, ${themeObj.accentFrom}, ${themeObj.accentTo})` }}>
                Link Preview & Shortener
              </h1>
              <p className="text-neutral-400 mt-2 max-w-xl">Paste a URL and get a short link & preview. Compact actions, mobile labels, click animations.</p>
            </div>

            {/* Theme picker */}
            <div className="flex gap-2 items-center">
              <div className="text-xs text-neutral-400 mr-2 hidden sm:block">Theme</div>
              <div className="flex gap-2">
                {(["default", "neon", "warm"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`px-3 py-1 rounded-md text-sm font-medium border ${theme === t ? "bg-white/10 border-white/20" : "bg-neutral-900/40 border-neutral-800"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* left: input + preview */}
            <section className="lg:col-span-2 glass p-5 rounded-2xl border border-white/5 shadow-lg">
              <div className="flex gap-3 items-start">
                <input
                  aria-label="URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste a URL (https://example.com)"
                  className="flex-1 px-4 py-3 rounded-lg bg-neutral-900/40 border border-neutral-800 focus:ring-2 focus:ring-[#60f1d6] outline-none"
                  onKeyDown={(e) => { if (e.key === "Enter") createShort(); }}
                />
                <button
                  onClick={createShort}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition ${loading ? "opacity-70 bg-neutral-700" : "text-black"}`}
                  style={{ background: `linear-gradient(90deg, ${themeObj.accentFrom}, ${themeObj.accentTo})` }}
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>

              {err && <div className="mt-3 text-sm text-red-400">{err}</div>}

              {/* short link bar */}
              {shortLink && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-md bg-neutral-900/30 border border-neutral-800 flex items-center justify-between">
                  <div className="text-sm text-neutral-300 break-all">
                    Short link: <a href={shortLink} className="text-[#9b67ff] underline" target="_blank" rel="noreferrer">{shortLink}</a>
                  </div>

                  {/* ICON TOOLBAR */}
                  <div className="flex items-center gap-3">
                    <IconButton onClick={() => copyText(shortLink)} title="Copy" size={9}>
                      <IconCopy />
                    </IconButton>

                    <IconButton onClick={() => window.open(shortLink, "_blank")} title="Open" size={9}>
                      <IconOpen />
                    </IconButton>

                    <IconButton onClick={shareLink} title="Share" size={9}>
                      <IconShare />
                    </IconButton>
                  </div>
                </motion.div>
              )}

              {/* preview card */}
              {preview && (
                <motion.article initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-lg overflow-hidden border border-neutral-800 bg-gradient-to-br from-black/40 to-black/20">
                  <div className="grid grid-cols-1 md:grid-cols-3">
                    <div className="md:col-span-1 p-4 flex items-center justify-center bg-neutral-900/40">
                      {preview.image ? (
                        <img
                          src={preview.image}
                          alt={preview.title || "preview"}
                          className="object-contain rounded-md shadow-sm max-h-[300px] w-full"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <div className="text-neutral-500 p-6">No image</div>
                      )}
                    </div>

                    <div className="md:col-span-2 p-6">
                      <h2 className="text-xl md:text-2xl font-semibold text-[#dbeef7]">{preview.title || "No title"}</h2>
                      <p className="text-neutral-300 mt-2">{preview.description || "No description available."}</p>

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

            {/* right: recent */}
            <aside className="glass p-4 rounded-2xl border border-white/5 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm text-neutral-300 font-medium">Recent</h3>
                <button onClick={clearHistory} className="text-xs text-red-400 hover:underline">Clear</button>
              </div>

              {recentToShow.length === 0 ? (
                <div className="text-neutral-500 text-sm">No recent links yet.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentToShow.map((h) => (
                    <motion.div key={h.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-3 bg-neutral-900/30 p-3 rounded-md border border-neutral-800">
                      <div className="flex gap-3 items-start truncate">
                        <div className="w-16 h-10 bg-neutral-800 rounded-sm overflow-hidden flex-shrink-0">
                          {h.image ? <img src={h.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-neutral-800" />}
                        </div>
                        <div className="truncate">
                          <div className="text-sm text-white font-medium truncate">{h.title || h.original}</div>
                          <div className="text-xs text-neutral-400">{metaLine(h)}</div>
                          <div className="text-xs text-neutral-400 truncate mt-1">{h.short}</div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button onClick={() => window.open(h.short, "_blank")} className="px-3 py-1 rounded bg-white/8 text-xs">Open</button>
                        <button onClick={() => copyText(h.short)} className="px-3 py-1 rounded bg-white/8 text-xs">Copy</button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="mt-6 text-center text-xs text-neutral-500">Built with <span className="text-red-400">❤</span></div>
            </aside>
          </div>
        </div>
      </main>

      {/* toast */}
      <div className="toast-wrap">
        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}

/* helper metaLine at file end */
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
