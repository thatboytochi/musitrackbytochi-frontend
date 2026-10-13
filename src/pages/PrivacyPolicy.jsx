export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-snow/80 sm:px-6 sm:py-20">
      <h1 className="mb-8 text-3xl font-black text-snow sm:text-4xl">Privacy Policy</h1>
      <p className="mb-8 text-sm uppercase tracking-widest text-[#1ed760]">Last Updated: October 2026</p>

      <div className="space-y-8 text-sm leading-relaxed sm:text-base">
        <section>
          <h2 className="mb-3 text-xl font-bold text-snow">1. What Data We Collect</h2>
          <p>
            MusiTrack By Tochi is a web application that visualizes your Spotify listening history. To provide this service, we request access to your Spotify account via the official Spotify Web API. We only access the data you explicitly permit, which includes your top artists, top tracks, and recently played history.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-snow">2. How We Use Your Data</h2>
          <p>
            Your data is strictly used to generate your personal listening statistics, charts, and downloadable Wrapped graphics. <strong>We do not store your Spotify data on our servers.</strong> All data processing happens on the fly to generate your dashboard, and your Spotify data is cleared when your session ends. We will never sell, rent, or share your personal listening data with third parties.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-snow">3. Revoking Access</h2>
          <p>
            You have full control over your data. You can disconnect MusiTrack from your Spotify account at any time. To revoke access, visit the official{" "}
            <a href="https://www.spotify.com/us/account/apps/" target="_blank" rel="noopener noreferrer" className="text-[#1ed760] hover:underline">
              Spotify Third-Party Apps page
            </a>{" "}
            and click "Remove Access" next to MusiTrack.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-snow">4. Cookies and Local Storage</h2>
          <p>
            We use essential local storage strictly to keep you authenticated with Spotify during your active session and to remember your UI preferences (like hiding the cookie banner).
          </p>
        </section>

        <div className="pt-8">
          <a href="/" className="rounded-xl bg-night px-6 py-3 font-bold text-snow transition hover:bg-white/10">← Back to App</a>
        </div>
      </div>
    </div>
  );
}