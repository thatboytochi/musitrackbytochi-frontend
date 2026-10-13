import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api.js";

// Polls Flask (which asks Spotify) so "now playing" stays current.
// Default interval changed to 15 seconds for a snappier UI
export function useRecentTracks(enabled, intervalMs = 15000) {
  const [data, setData] = useState({ now_playing: null, recent: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setData(await api.recent(20));
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);

    // Fires immediately on mount (or on Vite hot-reload)
    refresh();

    // Loops every 15 seconds
    const id = setInterval(refresh, intervalMs);

    // Cleans up the old timer if the component unmounts or reloads
    return () => clearInterval(id);
  }, [enabled, intervalMs, refresh]);

  return { ...data, error, loading, refresh };
}