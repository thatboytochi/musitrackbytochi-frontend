function timeAgo(uts) {
  const s = Math.max(0, Math.floor(Date.now() / 1000) - uts);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}

export default function RecentTracks({ tracks }) {
  if (!tracks.length) return null;
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">Recently played</h2>
      <ul className="divide-y divide-line rounded-3xl border border-line bg-surface">
        {tracks.map((t, i) => (
          <li key={`${t.played_at}-${i}`} className="flex items-center gap-4 px-5 py-3">
            {t.image ? (
              <img src={t.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-line" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{t.name}</p>
              <p className="truncate text-sm text-snow/65">{t.artist}</p>
            </div>
            <span className="shrink-0 text-sm text-snow/55">{t.played_at ? timeAgo(t.played_at) : ""}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
