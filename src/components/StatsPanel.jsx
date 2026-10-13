import { useEffect, useMemo, useState, useRef } from "react";
import html2canvas from "html2canvas";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api.js";

// ---- date helpers ----
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const monthsAgo = (n) => { const d = new Date(); d.setMonth(d.getMonth() - n); return d; };

const HISTORY_PRESETS = [
  { id: "all", label: "All time", range: () => ({}) },
  { id: "7d", label: "Last 7 days", range: () => ({ from: iso(daysAgo(6)), to: iso(new Date()) }) },
  { id: "30d", label: "Last 30 days", range: () => ({ from: iso(daysAgo(29)), to: iso(new Date()) }) },
  { id: "6m", label: "Last 6 months", range: () => ({ from: iso(monthsAgo(6)), to: iso(new Date()) }) },
  { id: "12m", label: "Last 12 months", range: () => ({ from: iso(monthsAgo(12)), to: iso(new Date()) }) },
];

const LIVE_PERIODS = [["short_term", "Last 4 weeks"], ["medium_term", "Last 6 months"], ["long_term", "Last 12 months"]];

const TABS = [["artists", "Artists"], ["tracks", "Songs"], ["albums", "Albums"]];

function Chip({ active, onClick, children }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      type="button"
      onClick={onClick}
      aria-pressed={active}
      // Replaced border-snow and bg-snow with the custom green hex
      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
        active ? "border-[#1ed760] bg-[#1ed760] text-[#121212] font-bold" : "border-line font-medium text-snow/80 hover:border-snow/60"}`}
    >
      {children}
    </motion.button>
  );
}

// Smart Lazy-Loading Image Component
function CoverImage({ type, name, artist, isCircle }) {
  const [src, setSrc] = useState("/logo-mark.png");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSrc("/logo-mark.png");

    api.getImage(type, name, artist)
      .then(res => {
        if (!cancelled && res.url) {
          setSrc(res.url);
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [type, name, artist]);

  return (
    <img
      src={src}
      alt={name}
      onLoad={() => setLoaded(true)}
      className={`h-12 w-12 sm:h-14 sm:w-14 shrink-0 bg-night object-cover shadow-sm transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-60'} ${isCircle ? "rounded-full" : "rounded-md"}`}
      onError={(e) => { e.target.src = '/logo-mark.png'; }}
    />
  );
}

// Framer Motion Variants for Staggered List
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 25 }
  }
};

export default function StatsPanel({ hasHistory, spotifyConnected, refreshKey, userName = "Listener" }) {
  const [source, setSource] = useState(hasHistory ? "history" : "live");
  const [range, setRange] = useState("all");
  const [custom, setCustom] = useState({ from: "", to: "" });
  const [period, setPeriod] = useState("medium_term");
  const [tab, setTab] = useState("artists");
  const [limit, setLimit] = useState(10);

  const [data, setData] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => { if (hasHistory) setSource("history"); }, [hasHistory, refreshKey]);
  useEffect(() => { if (!hasHistory && spotifyConnected) setSource("live"); }, [hasHistory, spotifyConnected]);

  const { from, to } = useMemo(() => {
    if (range === "custom") return custom;
    if (range.startsWith("y:")) { const y = range.slice(2); return { from: `${y}-01-01`, to: `${y}-12-31` }; }
    return (HISTORY_PRESETS.find((p) => p.id === range) ?? HISTORY_PRESETS[0]).range();
  }, [range, custom]);

  const customReady = range !== "custom" || (custom.from && custom.to && custom.from <= custom.to);
  const customInvalid = range === "custom" && custom.from && custom.to && custom.from > custom.to;

  useEffect(() => {
    let cancelled = false;
    if (source === "history" && !hasHistory) return;
    if (source === "history" && !customReady) return;
    if (source === "live" && !spotifyConnected) return;

    setLoading(true); setError("");
    const job = source === "history" ? api.stats({ from, to, sort: "minutes", limit }) : api.liveTop(period, limit);
    job.then((res) => {
      if (cancelled) return;
      setData(res);
      if (source === "history" && res.bounds) setBounds(res.bounds);
    }).catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [source, from, to, limit, period, hasHistory, spotifyConnected, customReady, refreshKey]);

  const years = useMemo(() => {
    if (!bounds?.first || !bounds?.last) return [];
    const first = +bounds.first.slice(0, 4), last = +bounds.last.slice(0, 4);
    const out = [];
    for (let y = last; y >= first; y--) out.push(y);
    return out;
  }, [bounds]);

  const handleDownload = async () => {
    if (!exportRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(exportRef.current, { backgroundColor: "#0F0F0F", scale: 2 });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png", 1.0);
      link.download = `MusiTrack-${tab}-Wrapped.png`;
      link.click();
    } catch (err) {
      alert("Failed to download image. Please try again.");
    }
    setDownloading(false);
  };

  if (!hasHistory && !spotifyConnected) {
    return (
      <section className="rounded-3xl border border-line bg-surface p-4 sm:p-6">
        <h2 className="text-xl font-semibold">Your stats</h2>
        <p className="mt-1 text-sm text-snow/70">Upload your Spotify history below to see your top artists, songs and albums.</p>
      </section>
    );
  }

  const isHistory = source === "history";
  const items = data ? (isHistory ? data[`top_${tab}`] : data[tab]) ?? [] : [];
  const noAlbumInfo = isHistory && tab === "albums" && !items.length && (data?.top_artists?.length ?? 0) > 0;

  const rangeLabel = useMemo(() => {
    if (!isHistory) return LIVE_PERIODS.find(p => p[0] === period)?.[1] || "Live";
    if (range.startsWith("y:")) return range.slice(2);
    if (range === "custom") return customReady ? `${custom.from} to ${custom.to}` : "Custom";
    return HISTORY_PRESETS.find(p => p.id === range)?.label || "All Time";
  }, [range, isHistory, period, custom, customReady]);

  return (
    <section className="rounded-2xl sm:rounded-3xl border border-line bg-surface p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-3">
        <h2 className="text-xl font-semibold">Your Top 10</h2>
        {hasHistory && spotifyConnected && (
          <div className="flex flex-wrap gap-2">
            <Chip active={isHistory} onClick={() => setSource("history")}>Spotify history</Chip>
            <Chip active={!isHistory} onClick={() => setSource("live")}>Live tracking</Chip>
          </div>
        )}
      </div>

      {/* Controls: Time frame & Tabs */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div role="tablist" className="flex flex-wrap gap-1 rounded-full border border-line p-1 w-max">
          {TABS.map(([id, label]) => (
            <motion.button
              whileTap={{ scale: 0.95 }}
              key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
              // Replaced bg-snow with green for active tab
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${tab === id ? "bg-[#1ed760] text-[#121212] font-bold" : "font-medium text-snow/75"}`}
            >
              {label}
            </motion.button>
          ))}
        </div>

        {isHistory ? (
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="w-full sm:w-auto cursor-pointer rounded-xl border border-line bg-night px-4 py-2 text-sm font-medium text-snow outline-none transition hover:border-snow/50"
          >
            {years.length > 0 && (
              <optgroup label="By Year">
                {years.map(y => <option key={y} value={`y:${y}`}>{y}</option>)}
              </optgroup>
            )}
            <optgroup label="Presets">
              {HISTORY_PRESETS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </optgroup>
            <option value="custom">Custom Range...</option>
          </select>
        ) : (
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full sm:w-auto cursor-pointer rounded-xl border border-line bg-night px-4 py-2 text-sm font-medium text-snow outline-none transition hover:border-snow/50"
          >
            {LIVE_PERIODS.map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        )}
      </div>

      {/* Custom Date Picker */}
      {isHistory && range === "custom" && (
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-sm flex-1 sm:flex-none">
            <span className="mb-1 block text-snow/70">From</span>
            <input type="date" value={custom.from} max={custom.to || undefined}
              onChange={(e) => setCustom({ ...custom, from: e.target.value })}
              className="w-full rounded-xl border border-line bg-night px-3 py-2 text-snow [color-scheme:dark]" />
          </label>
          <label className="text-sm flex-1 sm:flex-none">
            <span className="mb-1 block text-snow/70">To</span>
            <input type="date" value={custom.to} min={custom.from || undefined}
              onChange={(e) => setCustom({ ...custom, to: e.target.value })}
              className="w-full rounded-xl border border-line bg-night px-3 py-2 text-snow [color-scheme:dark]" />
          </label>
          {customInvalid && <p className="w-full text-sm font-medium text-red-400">Start date must be before end date.</p>}
        </div>
      )}

      {error && <p className="mt-4 font-medium text-red-400">{error}</p>}

      <div className={`mt-6 sm:mt-8 ${loading ? "opacity-60" : ""}`}>
        {noAlbumInfo ? (
          <p className="text-sm text-snow/70">Album names aren't in this export. Request Extended streaming history.</p>
        ) : items.length ? (
          <>
            {/* ---------------- INFOGRAPHIC CONTAINER ---------------- */}
            <div
              ref={exportRef}
              className="rounded-2xl sm:rounded-3xl border border-line bg-surface p-5 sm:p-8 overflow-hidden"
              style={{ backgroundColor: "#0F0F0F" }}
            >
              {/* Infographic Header */}
              <div className="mb-6 sm:mb-10 flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-0">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-snow">{userName}</h2>
                  {/* Dynamic Timeframe Totals */}
                  {isHistory && data?.totals && (
                    <p className="mt-1 sm:mt-2 text-lg sm:text-2xl font-bold text-snow/85">
                      {Math.round(data.totals.ms / 60000).toLocaleString()} mins • {Number(data.totals.plays).toLocaleString()} streams
                    </p>
                  )}
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xl sm:text-2xl font-bold text-snow">{rangeLabel}</p>
                  <p className="text-base sm:text-lg font-medium capitalize text-snow/60">{tab}</p>
                </div>
              </div>

              {/* Animated List Container */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${tab}-${range}-${period}`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-5 sm:space-y-6"
                >
                  {items.slice(0, limit).map((item, i) => (
                    <motion.div variants={itemVariants} key={i} className="flex items-center gap-3 sm:gap-5">
                      <div className="w-8 sm:w-10 text-right text-2xl sm:text-3xl font-black text-snow shrink-0">#{i + 1}</div>

                      <CoverImage
                        type={tab}
                        name={item.name}
                        artist={item.artist || ""}
                        isCircle={tab === "artists"}
                      />

                      <div className="flex-1 min-w-0">
                        <p className="text-lg sm:text-xl font-bold tracking-wide text-snow truncate">
                          {item.name}
                        </p>
                        {(isHistory || item.artist) && (
                          <p className="mt-0.5 text-xs sm:text-sm font-medium text-snow/60 truncate">
                            {isHistory
                              ? `${Math.round(item.ms / 60000).toLocaleString()} mins • ${Number(item.plays).toLocaleString()} streams`
                              : item.artist}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Footer / Watermark */}
              <div className="mt-8 sm:mt-12 flex items-center justify-between opacity-50">
                <img src="/logo-full.png" alt="MusiTrack" className="h-5 sm:h-6" />
                <p className="text-xs sm:text-sm font-medium text-snow">MusiTrack Insights</p>
              </div>
            </div>

            {/* Download Button - Replaced bg-snow with Spotify green */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleDownload}
              disabled={downloading}
              className="mt-6 w-full rounded-xl bg-[#1ed760] py-3 sm:py-3.5 font-bold text-[#121212] transition hover:brightness-110 disabled:opacity-60"
            >
              {downloading ? "Generating..." : "Download as Infographic"}
            </motion.button>
          </>
        ) : !loading && data && customReady ? (
          <p className="text-sm text-snow/70">Nothing listened to in this period.</p>
        ) : loading ? (
          <p className="text-sm text-snow/70">Loading your stats…</p>
        ) : null}
      </div>

      {items.length >= limit && limit < 25 && (
        <button type="button" onClick={() => setLimit(25)} className="mt-6 text-sm font-medium underline underline-offset-4 hover:text-snow/80">
          Show top 25
        </button>
      )}
    </section>
  );
}