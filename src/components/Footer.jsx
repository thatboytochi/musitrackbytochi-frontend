// Small credit line: Spotify's developer rules ask apps showing Spotify content to credit and link back to Spotify.
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-8 space-y-1.5 border-t border-line py-6 text-center text-xs text-snow/45">
      <p>© {currentYear} MusiTrack By Tochi. All rights reserved.</p>
      <p>
        Listening data from{" "}
        <a
          href="https://www.spotify.com"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-snow transition-colors"
        >
          Spotify
        </a>
      </p>
    </footer>
  );
}