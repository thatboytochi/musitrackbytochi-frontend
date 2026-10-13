import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";
import { useRecentTracks } from "../hooks/useRecentTracks.js";
import SpotifyConnect from "../components/SpotifyConnect.jsx";
import NowPlaying from "../components/NowPlaying.jsx";
import SpotifyWrapped from "../components/SpotifyWrapped.jsx";
import RecentTracks from "../components/RecentTracks.jsx";
import HistoryUpload from "../components/HistoryUpload.jsx";
import StatsPanel from "../components/StatsPanel.jsx";
import InsightsPanel from "../components/InsightsPanel.jsx";
import Brand from "../components/Brand.jsx";
import Footer from "../components/Footer.jsx";
import FullScreenLoader from "../components/FullScreenLoader.jsx";
import { motion } from "framer-motion";

// Helper for the Bento Grid cover images
function BentoCover({ type, name, artist, isCircle }) {
  const [src, setSrc] = useState("/logo-mark.png");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSrc("/logo-mark.png");
    api.getImage(type, name, artist).then(res => {
      if (!cancelled && res.url) setSrc(res.url);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [type, name, artist]);

  return (
    <img src={src} alt={name} onLoad={() => setLoaded(true)}
         className={`h-10 w-10 sm:h-12 sm:w-12 shrink-0 bg-night object-cover shadow-sm transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-60'} ${isCircle ? "rounded-full" : "rounded-md"}`}
         onError={(e) => { e.target.src = '/logo-mark.png'; }} />
  );
}

// The Bento Overview (Moved to the Insights Tier)
function BentoOverview({ history, connected }) {
  const [data, setData] = useState(null);
  const [liveAlbums, setLiveAlbums] = useState([]);

  useEffect(() => {
    const source = history ? api.stats({ limit: 5, sort: "minutes" }) : api.liveTop("short_term", 5);
    source.then(setData).catch(console.error);

    if (connected) {
      api.liveTop("medium_term", 20).then(res => {
        if (res && res.albums) setLiveAlbums(res.albums.slice(0, 5));
      }).catch(console.error);
    }
  }, [history, connected]);

  const isHistory = !!history;
  const artists = data ? (isHistory ? data.top_artists : data.artists) ?? [] : [];
  const tracks = data ? (isHistory ? data.top_tracks : data.tracks) ?? [] : [];
  const albums = (connected && liveAlbums.length > 0) ? liveAlbums : (data ? (isHistory ? data.top_albums : data.albums) ?? [] : []).slice(0, 5);

  const totalMinutes = history?.total_ms ? Math.round(history.total_ms / 60000).toLocaleString() : "0";
  const totalStreams = history?.counted_streams ? history.counted_streams.toLocaleString() : "0";
  const topTrackName = tracks[0]?.name || "None yet";

  if (!isHistory && !connected) return null;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pt-4 pb-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
        <div className="col-span-1 flex flex-col justify-center rounded-3xl border border-line bg-surface p-5">
          <p className="text-xs sm:text-sm font-medium text-snow/60">Total Minutes</p>
          <p className="mt-1 text-2xl sm:text-3xl font-black text-snow">{totalMinutes}</p>
        </div>
        <div className="col-span-1 flex flex-col justify-center rounded-3xl border border-line bg-surface p-5">
          <p className="text-xs sm:text-sm font-medium text-snow/60">Total Streams</p>
          <p className="mt-1 text-2xl sm:text-3xl font-black text-snow">{totalStreams}</p>
        </div>
        <div className="col-span-2 md:col-span-1 flex flex-col justify-center rounded-3xl border border-line bg-surface p-5">
          <p className="text-xs sm:text-sm font-medium text-snow/60">Top Track</p>
          <p className="mt-1 truncate text-xl sm:text-2xl font-black text-snow">{topTrackName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="flex flex-col rounded-3xl border border-line bg-surface p-5">
          <h3 className="mb-4 text-base font-bold text-snow">Top Artists</h3>
          <div className="flex-1 space-y-4">
            {artists.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <p className="w-4 text-xs font-bold text-snow/50">{i + 1}</p>
                <BentoCover type="artists" name={item.name} isCircle={true} />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-snow">{item.name}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col rounded-3xl border border-line bg-surface p-5">
          <h3 className="mb-4 text-base font-bold text-snow">Top Songs</h3>
          <div className="flex-1 space-y-4">
            {tracks.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <p className="w-4 text-xs font-bold text-snow/50">{i + 1}</p>
                <BentoCover type="tracks" name={item.name} artist={item.artist} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-snow">{item.name}</p>
                  <p className="truncate text-xs font-medium text-snow/60">{item.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col rounded-3xl border border-line bg-surface p-5">
          <h3 className="mb-4 text-base font-bold text-snow">Top Albums</h3>
          <div className="flex-1 space-y-4">
            {albums.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <p className="w-4 text-xs font-bold text-snow/50">{i + 1}</p>
                <BentoCover type="albums" name={item.name} artist={item.artist} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-snow">{item.name}</p>
                  <p className="truncate text-xs font-medium text-snow/60">{item.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [statsKey, setStatsKey] = useState(0);
  const [spotify, setSpotify] = useState(null);
  const [notice, setNotice] = useState("");

  const [view, setView] = useState("overview");

  useEffect(() => {
    const result = new URLSearchParams(window.location.search).get("spotify");
    if (!result) return;
    const messages = {
      denied: "No problem. Nothing was connected. You can try again whenever you like.",
      not_allowed: "Spotify didn't let this account in. MusiTrack is still in test mode, so the owner has to add your Spotify email to its allow list first.",
      expired: "That sign-in took too long. Please try again.",
      error: "Something went wrong connecting to Spotify. Please try again.",
    };
    if (messages[result]) setNotice(messages[result]);
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  const load = useCallback(() => {
    setLoadError("");
    setReady(false);
    api.me()
      .then(({ profile, history, spotify }) => {
        setProfile(profile);
        setHistory(history);
        setSpotify(spotify);
        setReady(true);
      })
      .catch((e) => setLoadError(e.message));
  }, []);

  useEffect(() => { load(); }, [load]);

  const connected = !!spotify;
  const { now_playing, recent, error, loading } = useRecentTracks(connected);

  useEffect(() => {
    if (ready && connected) {
      api.syncHistory()
        .then((res) => {
          if (res.status === "success" && res.added > 0) {
            console.log(`Successfully synced ${res.added} new streams!`);
            setStatsKey((k) => k + 1);
            api.me().then(({ history }) => setHistory(history));
          }
        })
        .catch((err) => console.error("Background sync failed:", err));
    }
  }, [ready, connected]);

  async function disconnect() {
    if (!window.confirm("Disconnect Spotify? Live tracking will stop. Your uploaded history stays.")) return;
    await api.spotifyDisconnect();
    setSpotify(null);
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-md space-y-4 px-5 py-16 text-center">
        <Brand className="justify-center" />
        <p role="alert" className="font-medium text-red-400">{loadError}</p>
        <div className="flex justify-center gap-3">
          <button onClick={load} className="rounded-xl bg-snow px-5 py-2 font-semibold text-night">Try again</button>
          <button onClick={signOut} className="rounded-xl border border-snow/50 px-5 py-2 font-semibold">Sign out</button>
        </div>
      </div>
    );
  }

  if (!ready) return <FullScreenLoader />;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-5 py-8">
      <header className="flex items-center justify-between">
        <Brand />
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden text-snow/65 sm:inline">{user.email}</span>
          <button onClick={signOut} className="font-medium text-snow underline underline-offset-4">Sign out</button>
        </div>
      </header>

      {/* 2-Tab Navigation - Now using the Spotify Green when active */}
      <div className="flex w-fit gap-2 rounded-xl border border-line bg-surface p-1">
        <button
          onClick={() => setView("overview")}
          className={`rounded-lg px-6 py-2 text-sm transition-colors ${view === "overview" ? "bg-[#1ed760] text-[#121212] font-bold" : "font-medium text-snow/70 hover:text-snow"}`}
        >
          Overview
        </button>
        <button
          onClick={() => setView("insights")}
          className={`rounded-lg px-6 py-2 text-sm transition-colors ${view === "insights" ? "bg-[#1ed760] text-[#121212] font-bold" : "font-medium text-snow/70 hover:text-snow"}`}
        >
          Insights
        </button>
      </div>

      {/* VIEW 1: OVERVIEW (Free Tier - Live API) */}
      {view === "overview" && (
        <div className="space-y-6">
          {!connected ? (
            <SpotifyConnect notice={notice} />
          ) : (
            <>
              <p className="flex items-center gap-3 text-sm text-snow/70">
                <span>Live tracking on · <strong>{spotify.display_name}</strong></span>
                <button type="button" onClick={disconnect} className="underline underline-offset-4">Disconnect</button>
              </p>
              {notice && <p role="status" className="text-sm font-medium">{notice}</p>}
              {error && <p role="alert" className="font-medium text-red-400">{error}</p>}

              <div className="drop-shadow-xl">
                <NowPlaying track={now_playing} loading={loading} />
              </div>

              {/* The new Shareable Wrapped feature */}
              <SpotifyWrapped />
            </>
          )}
        </div>
      )}

      {/* VIEW 2: INSIGHTS (Premium Tier - Data Heavy) */}
      {view === "insights" && (
        <div className="space-y-10">
          {/* Always allow them to upload history from here */}
          <HistoryUpload
            summary={history}
            onImported={(result) => { setHistory(result); setStatsKey((k) => k + 1); }}
          />

          <BentoOverview history={history} connected={connected} />

          <StatsPanel
            hasHistory={!!history}
            spotifyConnected={connected}
            refreshKey={statsKey}
            userName={spotify?.display_name || "Listener"}
          />

          {connected && <RecentTracks tracks={recent} />}

          <InsightsPanel
            hasHistory={!!history}
            refreshKey={statsKey}
          />
        </div>
      )}

      {connected && <Footer />}
    </div>
  );
}