import { supabase } from "./supabaseClient.js";

const BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const { data } = await supabase.auth.getSession();
  const headers = { ...(options.headers || {}) };
  if (data.session) headers.Authorization = `Bearer ${data.session.access_token}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error("Can't reach the backend. Is it still running in your terminal?");
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || `Backend error (${res.status}). Check the backend terminal for details.`);
  }
  return body;
}

export const api = {
  me: () => request("/api/me"),
  spotifyLogin: () => request("/api/spotify/login"),
  spotifyDisconnect: () => request("/api/spotify/connection", { method: "DELETE" }),
  recent: (limit = 20) => request(`/api/live/recent?limit=${limit}`),
  stats: ({ from, to, sort = "minutes", limit = 10 }) => {
    const q = new URLSearchParams({ sort, limit });
    if (from) q.set("from", from);
    if (to) q.set("to", to);
    return request(`/api/stats?${q}`);
  },
  timeline: () => request("/api/stats/timeline"),
  liveTop: (period, limit = 10) => request(`/api/live/top?period=${period}&limit=${limit}`),
  uploadHistory: (files) => {
    const body = new FormData();
    for (const f of files) body.append("files", f);
    return request("/api/history/upload", { method: "POST", body });
  },
  deleteHistory: () => request("/api/history", { method: "DELETE" }),
  syncHistory: () => request("/api/history/sync", { method: "POST" }),
  // The new dedicated image fetcher
  getImage: (type, name, artist = "") => {
    const q = new URLSearchParams({ type, name, artist });
    return request(`/api/image?${q}`);
  }
};

export function formatDuration(ms) {
  const totalMin = Math.round(ms / 60000);
  const h = Math.floor(totalMin / 60);
  return h > 0 ? `${h.toLocaleString()} h ${totalMin % 60} min` : `${totalMin} min`;
}

export const formatMinutes = (ms) => `${Math.round(ms / 60000).toLocaleString()} min`;