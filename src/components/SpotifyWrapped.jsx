import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import { api } from "../lib/api.js";

const loadingPhrases = [
  "Pulling your top artists...",
  "Retrieving your most-played tracks...",
  "Crunching the genre numbers...",
  "Assembling your musical identity...",
  "Finalizing your Wrapped recap..."
];

function DynamicLoader() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => {
        if (prevIndex === loadingPhrases.length - 1) return prevIndex;
        return prevIndex + 1;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="w-6 h-6 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
      <p className="text-snow/80 font-medium text-sm animate-pulse text-center">
        {loadingPhrases[index]}
      </p>
    </div>
  );
}

const THEMES = {
  meltingGradients: {
    name: "Lava Melt",
    fallback: "bg-gradient-to-br from-orange-600 via-purple-700 to-black",
    overlay: "bg-black/30",
    text: "text-white",
    accent: "text-[#1ed760]/90",
    border: "border-white/20",
    getPrompt: (genre, artist) =>
      `vibrant liquid lava abstract gradient background, colors melting into one another, inspired by ${genre} and ${artist}, no text, no lettering`
  },
  retroHalftone: {
    name: "Retro Zine",
    fallback: "bg-gradient-to-tr from-yellow-800 via-red-900 to-black",
    overlay: "bg-black/40",
    text: "text-amber-50",
    accent: "text-amber-400",
    border: "border-amber-200/20",
    getPrompt: (genre, artist) =>
      `retro screen-printed band poster artwork, tiny half-tone dots, grimy vintage music zine aesthetic, inspired by ${artist} and ${genre}, no text, no lettering`
  },
  minimalistSplit: {
    name: "Split Grid",
    fallback: "bg-gradient-to-b from-gray-700 to-black",
    overlay: "bg-black/30",
    text: "text-white",
    accent: "text-gray-300",
    border: "border-white/20",
    getPrompt: (genre, artist) =>
      `strict minimalist graphic background split directly down the middle, uneven grid of flat solid color panels, Bauhaus inspired, ${genre}, flat visual art, no text`
  }
};

const PERIODS = [
  { id: "short_term", label: "LAST 4 WEEKS" },
  { id: "medium_term", label: "LAST 6 MONTHS" },
  { id: "long_term", label: "LAST 12 MONTHS" }
];

export default function SpotifyWrapped() {
  const [period, setPeriod] = useState("medium_term");
  const [theme, setTheme] = useState("meltingGradients");
  const [data, setData] = useState({ artists: [], tracks: [], genre: "Unknown" });
  const [heroImg, setHeroImg] = useState("/logo-mark.png");
  const [loading, setLoading] = useState(true);
  const [backdropLoading, setBackdropLoading] = useState(true);
  const [backdropError, setBackdropError] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api.liveTop(period, 50).then((res) => {
      if (cancelled) return;
      const topArtists = (res.artists || []).slice(0, 5);
      const topTracks = (res.tracks || []).slice(0, 5);

      const allGenres = (res.artists || []).flatMap(a => a.genres || []);
      const genreCounts = allGenres.reduce((acc, g) => { acc[g] = (acc[g] || 0) + 1; return acc; }, {});
      const topGenre = Object.keys(genreCounts).sort((a, b) => genreCounts[b] - genreCounts[a])[0] || "Afrobeats";

      setData({ artists: topArtists, tracks: topTracks, genre: topGenre });

      if (topArtists[0]) {
        api.getImage("artists", topArtists[0].name).then(imgRes => {
          if (!cancelled && imgRes.url) setHeroImg(imgRes.url);
        }).catch(() => {});
      }
      setLoading(false);
    }).catch(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [period]);

  useEffect(() => {
    setBackdropLoading(true);
    setBackdropError(false);
  }, [theme, period]);

  const handleDownload = async () => {
    if (!exportRef.current || backdropLoading) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/jpeg", 0.95);
      link.download = `MusiTrack-Wrapped-${period}.jpg`;
      link.click();
    } catch (err) {
      alert("Failed to generate Wrapped image.");
    }
    setDownloading(false);
  };

  const currentTheme = THEMES[theme];
  const activeTimelineLabel = PERIODS.find(p => p.id === period)?.label || "LAST 6 MONTHS";

  const topArtistName = data.artists[0]?.name || "Music";
  const promptValue = currentTheme.getPrompt(data.genre, topArtistName);
  const aiThemeUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptValue)}?width=800&height=1200&nologo=true&seed=${period.length + theme.length + topArtistName.length}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Your Shareable Wrapped</h2>

        <div className="flex flex-wrap items-center gap-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="cursor-pointer rounded-xl border border-line bg-night px-4 py-2 text-sm font-medium text-snow outline-none transition hover:border-snow/50"
          >
            {PERIODS.map((p) => <option key={p.id} value={p.id}>{p.label.toLowerCase()}</option>)}
          </select>

          <div className="flex gap-1.5 rounded-full border border-line p-1">
            {Object.keys(THEMES).map((key) => {
              const active = theme === key;
              return (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-all ${
                    active 
                      ? "bg-[#1ed760] text-[#121212]" 
                      : "text-snow/75 hover:text-snow hover:bg-white/5"
                  }`}
                >
                  {THEMES[key].name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-center overflow-hidden rounded-3xl border border-line bg-surface p-4 sm:p-8">
        {loading ? (
          <DynamicLoader />
        ) : (
          <div
            ref={exportRef}
            className={`relative w-full max-w-[400px] flex flex-col overflow-hidden px-5 py-5 sm:px-6 sm:py-8 shadow-2xl transition-all duration-500 rounded-2xl sm:rounded-3xl border border-white/5 ${currentTheme.fallback}`}
            style={{ aspectRatio: "9/16" }}
          >
            {/* Z-0: Pollinations AI Backdrop */}
            {!backdropError && (
              <img
                src={aiThemeUrl}
                alt=""
                crossOrigin="anonymous"
                onLoad={() => setBackdropLoading(false)}
                onError={() => { setBackdropError(true); setBackdropLoading(false); }}
                className={`absolute inset-0 z-0 h-full w-full object-cover transition-opacity duration-700 ${backdropLoading ? 'opacity-0' : 'opacity-100'}`}
              />
            )}

            {/* Z-10: Dark Overlay for contrast */}
            <div className={`absolute inset-0 z-10 ${currentTheme.overlay}`}></div>

            {/* Z-20: Card Content - Explicitly raised above the images */}
            <div className="relative z-20 flex flex-col h-full overflow-visible">

              <div className={`flex items-center justify-center gap-3 ${currentTheme.text}`}>
                <img src="/logo-mark.png" alt="MusiTrack" className="h-8 w-8 sm:h-10 sm:w-10 shrink-0" />
                <div className="flex flex-col justify-center items-center">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-none">MusiTrack</h1>
                  <p className={`mt-1.5 text-[8px] sm:text-[9px] font-light tracking-[0.35em] uppercase leading-none ${currentTheme.accent}`}>By Tochi</p>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 flex justify-center shrink-0">
                <div className="h-32 w-32 sm:h-44 sm:w-44 overflow-hidden border border-white/10 rounded-xl shadow-xl shrink-0">
                  <img src={heroImg} alt="Top Artist" className="h-full w-full object-cover filter contrast-125" crossOrigin="anonymous" />
                </div>
              </div>

              <div className={`mt-4 sm:mt-6 grid grid-cols-2 gap-4 sm:gap-6 ${currentTheme.text}`} style={{ fontFamily: "'Spotify Mix', system-ui, sans-serif" }}>
                <div>
                  <h3 className={`mb-2 sm:mb-3 border-b pb-1 text-[10px] sm:text-xs uppercase tracking-widest ${currentTheme.border} ${currentTheme.accent}`}>Top Artists</h3>
                  <ul className="space-y-1.5 sm:space-y-2.5 text-[12px] sm:text-[13px] font-bold">
                    {data.artists.map((a, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-3 text-current opacity-50 flex-shrink-0" style={{ lineHeight: "1.5" }}>{i + 1}</span>
                        <span className="truncate pr-1 pb-[3px]" style={{ lineHeight: "1.5" }}>{a.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className={`mb-2 sm:mb-3 border-b pb-1 text-[10px] sm:text-xs uppercase tracking-widest ${currentTheme.border} ${currentTheme.accent}`}>Top Songs</h3>
                  <ul className="space-y-1.5 sm:space-y-2.5 text-[12px] sm:text-[13px] font-bold">
                    {data.tracks.map((t, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-3 text-current opacity-50 flex-shrink-0" style={{ lineHeight: "1.5" }}>{i + 1}</span>
                        <span className="truncate pr-1 pb-[3px]" style={{ lineHeight: "1.5" }}>{t.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={`mt-3 sm:mt-6 text-center sm:text-left shrink-0 ${currentTheme.text}`}>
                <p className={`text-[10px] sm:text-xs uppercase tracking-widest ${currentTheme.accent}`}>Top Genre</p>
                <h2 className="mt-0 sm:mt-1 text-3xl sm:text-5xl font-black capitalize tracking-tighter pb-1" style={{ fontFamily: "'Spotify Mix', system-ui, sans-serif", lineHeight: "1.1" }}>
                  {data.genre}
                </h2>
              </div>

              <div className={`mt-auto pt-3 sm:pt-4 flex items-end justify-between w-full shrink-0 ${currentTheme.text}`}>
                <div className="flex items-center gap-2">
                  <img src="/logo-mark.png" alt="Icon" className="h-8 w-8 sm:h-10 sm:w-10 shrink-0" />
                  <p className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-widest leading-tight ${currentTheme.accent}`}>Your sound.<br/>Your story.<br/>Tracked.</p>
                </div>

                <div className="text-right">
                  <p className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-widest leading-normal ${currentTheme.accent}`}>Timeline</p>
                  <p className="text-[10px] sm:text-xs font-black uppercase tracking-tight" style={{ fontFamily: "'Spotify Mix', system-ui, sans-serif" }}>
                    {activeTimelineLabel}
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleDownload}
        disabled={downloading || loading || backdropLoading}
        className="mx-auto w-full sm:w-auto rounded-xl bg-[#1ed760] px-8 py-3.5 font-bold text-[#121212] transition hover:brightness-110 disabled:opacity-60"
      >
        {downloading
          ? "Generating High-Res JPEG..."
          : backdropLoading && !backdropError
            ? "Creating backdrop theme..."
            : "Download Wrapped"
        }
      </motion.button>
    </div>
  );
}