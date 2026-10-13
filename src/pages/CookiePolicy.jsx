export default function CookiePolicy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-snow/80 sm:px-6 sm:py-20">
      <h1 className="mb-8 text-3xl font-black text-snow sm:text-4xl">Cookie Policy</h1>
      <div className="space-y-8 text-sm leading-relaxed sm:text-base">
        <section>
          <h2 className="mb-3 text-xl font-bold text-snow">1. What are Cookies?</h2>
          <p>Cookies and Local Storage are small data files stored on your device that help websites remember your actions and keep you securely logged in.</p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-bold text-snow">2. Essential Cookies</h2>
          <p>We use session tokens to keep you logged in to Spotify. If you block these, the app will not function because we cannot securely request your music stats.</p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-bold text-snow">3. Preference Cookies</h2>
          <p>We store a simple flag (`musitrack_cookie_consent`) so we know whether you have dismissed our consent banner, preventing it from showing on every page load.</p>
        </section>
        <div className="pt-8">
          <a href="/" className="rounded-xl bg-night px-6 py-3 font-bold text-snow transition hover:bg-white/10">← Back to App</a>
        </div>
      </div>
    </div>
  );
}