import Vinyl from "./Vinyl.jsx";
import Equalizer from "./Equalizer.jsx";

export default function NowPlaying({ track, loading }) {
  return (
    <section className="flex items-center gap-6 rounded-3xl border border-line bg-surface p-6" aria-live="polite">
      <Vinyl spinning={!!track} art={track?.image} size="h-32 w-32 sm:h-40 sm:w-40" />
      <div className="min-w-0">
        {track ? (
          <>
            <p className="flex items-center gap-2 text-sm font-medium">
              <Equalizer live /> Playing now
            </p>
            <a href={track.url} target="_blank" rel="noreferrer"
              className="mt-2 block truncate text-2xl font-bold hover:underline sm:text-3xl">
              {track.name}
            </a>
            <p className="truncate text-lg">{track.artist}</p>
            <p className="truncate text-sm text-snow/55">{track.album}</p>
          </>
        ) : (
          <>
            <p className="text-2xl font-semibold">{loading ? "Looking…" : "Nothing playing"}</p>
            <p className="text-sm text-snow/65">Start a song on Spotify and it will show up here within a minute.</p>
          </>
        )}
      </div>
    </section>
  );
}
