import { useState } from "react";
import { api } from "../lib/api.js";

// Writes profiles.lastfm_username for the signed-in user (via Flask).
// This is the ONE place the data provider is named: users must create an account
// there and link Spotify to it, so they need to know where to go.
export default function LastfmConnect({ onConnected }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const { lastfm_username } = await api.connectLastfm(username.trim());
      onConnected(lastfm_username);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-line bg-surface p-6">
      <h2 className="text-xl font-semibold">Turn on live tracking</h2>
      <p className="mt-1 text-sm text-snow/70">
        Live tracking follows your Spotify plays through a free{" "}
        <a href="https://www.last.fm/join" target="_blank" rel="noreferrer" className="underline underline-offset-2">Last.fm</a>{" "}
        account. Create one, link Spotify in its settings, then enter that username here.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input value={username} onChange={(e) => setUsername(e.target.value)} required
          placeholder="Your username" aria-label="Your Last.fm username"
          className="flex-1 rounded-xl border border-line bg-night px-4 py-3 text-snow" />
        <button disabled={busy} className="rounded-xl bg-snow px-6 py-3 font-semibold text-night disabled:opacity-60">
          {busy ? "Checking…" : "Connect"}
        </button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm font-medium text-red-400">{error}</p>}
    </form>
  );
}
