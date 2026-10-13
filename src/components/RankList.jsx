import { formatMinutes } from "../lib/api.js";

// items: [{ name, artist?, plays, ms? }]. metric decides what is ranked and shown big.
export default function RankList({ items, metric = "minutes", subtitle = true }) {
  if (!items.length) return null;

  // Spotify's own top lists are just a ranking (no plays or minutes): show names only.
  if (metric === "none" || items[0].plays == null) {
    return (
      <ol className="space-y-3">
        {items.map((item, idx) => (
          <li key={`${item.name}-${item.artist ?? ""}-${idx}`} className="flex items-baseline gap-3 border-b border-line pb-3 last:border-0">
            <span className="w-6 shrink-0 text-sm tabular-nums text-snow/50">{idx + 1}</span>
            <div className="min-w-0">
              <p className="truncate font-medium">{item.name}</p>
              {subtitle && item.artist && <p className="truncate text-sm text-snow/60">{item.artist}</p>}
            </div>
          </li>
        ))}
      </ol>
    );
  }

  const value = (i) => (metric === "plays" || i.ms == null ? i.plays : i.ms);
  const top = value(items[0]) || 1;

  return (
    <ol className="space-y-3">
      {items.map((item, idx) => (
        <li key={`${item.name}-${item.artist ?? ""}-${idx}`}>
          <div className="flex items-baseline gap-3">
            <span className="w-6 shrink-0 text-sm tabular-nums text-snow/50">{idx + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{item.name}</p>
              {subtitle && item.artist && <p className="truncate text-sm text-snow/60">{item.artist}</p>}
            </div>
            <div className="shrink-0 text-right text-sm">
              {metric === "minutes" && item.ms != null ? (
                <>
                  <p className="font-semibold tabular-nums">{formatMinutes(item.ms)}</p>
                  <p className="text-snow/55">{item.plays.toLocaleString()} plays</p>
                </>
              ) : (
                <p className="font-semibold tabular-nums">{item.plays.toLocaleString()} plays</p>
              )}
            </div>
          </div>
          <div className="ml-9 mt-1.5 h-1.5 rounded-full bg-line">
            <div className="h-1.5 rounded-full bg-snow" style={{ width: `${Math.max(2, (value(item) / top) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}
