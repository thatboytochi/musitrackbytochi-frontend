export default function TermsAndConditions() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-snow/80 sm:px-6 sm:py-20">
      <h1 className="mb-8 text-3xl font-black text-snow sm:text-4xl">Terms & Conditions</h1>
      <div className="space-y-8 text-sm leading-relaxed sm:text-base">
        <section>
          <h2 className="mb-3 text-xl font-bold text-snow">1. Acceptance of Terms</h2>
          <p>By logging into MusiTrack, you agree to these Terms. If you disagree, please do not use the service.</p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-bold text-snow">2. Service Limitations</h2>
          <p>MusiTrack is provided "as is". We are not affiliated with, sponsored by, or endorsed by Spotify AB. We rely entirely on the Spotify API. If they change their API limits or go offline, our service may be temporarily interrupted.</p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-bold text-snow">3. Intellectual Property</h2>
          <p>The MusiTrack branding, UI, and custom graphics are owned by Tochi. Spotify trademarks, logos, and artist images belong to Spotify AB and their respective owners.</p>
        </section>
        <div className="pt-8">
          <a href="/" className="rounded-xl bg-night px-6 py-3 font-bold text-snow transition hover:bg-white/10">← Back to App</a>
        </div>
      </div>
    </div>
  );
}