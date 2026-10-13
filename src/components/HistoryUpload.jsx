import { useState } from "react";
import { api } from "../lib/api.js";

export default function HistoryUpload({ summary, onImported }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onPick(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setError("");
    setBusy(true);
    try {
      onImported(await api.uploadHistory(files));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function onDelete() {
    if (!window.confirm("Are you sure you want to delete all uploaded history? This cannot be undone.")) return;
    setBusy(true);
    setError("");
    try {
      await api.deleteHistory();
      onImported(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-3xl border border-line bg-surface p-6">
      <h2 className="text-xl font-semibold">Spotify history</h2>
      <p className="mt-1 text-sm text-snow/70">
        Request your data from Spotify (Account → Privacy), choose <strong>Extended streaming history</strong>, then upload your Streaming_History_Audio .json files. You can upload them in batches—new files will safely add to your existing data.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {/* Swapped bg-snow for Spotify green */}
        <label className="cursor-pointer rounded-xl bg-[#1ed760] px-5 py-2.5 font-bold text-[#121212] transition hover:brightness-110">
          {busy ? "Processing…" : summary ? "Add more files" : "Upload history files"}
          <input type="file" multiple accept=".json" onChange={onPick} disabled={busy} className="hidden" />
        </label>

        {summary && (
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="rounded-xl border border-red-500/50 px-4 py-2.5 font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
          >
            Delete history
          </button>
        )}
      </div>

      {error && <p role="alert" className="mt-3 text-sm font-medium text-red-400">{error}</p>}

      {summary && (
        <p className="mt-4 text-sm text-snow/70">
          {summary.counted_streams?.toLocaleString()} total plays saved.
        </p>
      )}
    </section>
  );
}