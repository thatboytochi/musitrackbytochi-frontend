import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { motion, AnimatePresence } from "framer-motion";

// Updated field to match the 1px tertiary border, neutral surface, and tight radius
const field = "w-full rounded-[8px] border border-[#374151] bg-[#121212] px-4 py-3.5 text-white placeholder-gray-500 focus:border-[#1ed760] focus:outline-none focus:ring-1 focus:ring-[#1ed760] transition-colors";

const expiredLink = typeof window !== "undefined" && /error_code=otp_expired|error=access_denied/.test(window.location.hash);

// Targeting the exact .jfif files in your public folder
const slides = ["/slide-1.jfif", "/slide-2.jfif", "/slide-3.jfif"];

export default function LoginPage() {
  // Added signInWithGoogle to the destructured context
  const { signIn, signUp, resetPassword, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(expiredLink ? "That reset link has expired or was already used. Request a new one below." : "");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  // Slideshow State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play the slideshow every 3.5 seconds.
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  function switchMode(next) {
    setMode(next); setError(""); setNotice("");
  }

  // Handle standard email/password submit
  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setNotice(""); setBusy(true);

    if (mode === "forgot") {
      const { error } = await resetPassword(email);
      setBusy(false);
      if (error) return setError(error.message);
      return setNotice("If an account exists for that email, a reset link is on its way. Check your inbox and spam folder.");
    }

    const action = mode === "signin" ? signIn : signUp;
    const { data, error } = await action(email, password);
    setBusy(false);
    if (error) return setError(error.message);

    if (mode === "signup" && !data.session) {
      setNotice("Check your inbox for a confirmation link, then sign in.");
    }
  }

  // Handle Google OAuth
  async function handleGoogleSignIn() {
    setError(""); setNotice(""); setBusy(true);
    // Assuming signInWithGoogle is defined in your AuthContext
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setBusy(false);
    }
    // Note: If successful, Supabase usually redirects the browser to Google instantly
  }

  const title = { signin: "Sign in", signup: "Create account", forgot: "Reset password" }[mode];
  const button = { signin: "Sign in", signup: "Create account", forgot: "Send reset link" }[mode];

  return (
    <main className="mx-auto grid min-h-screen grid-cols-1 items-center gap-12 lg:gap-16 bg-[#030303] px-6 py-12 font-sans text-white md:grid-cols-2 lg:px-16">

      {/* LEFT HERO SECTION - Massive Display Typography + Slideshow */}
      <section className="flex flex-col items-start justify-center pt-6 md:pt-0">
        <img src="/logo-full.png" alt="MusiTrack by Tochi" className="mb-6 w-24 md:mb-8 md:w-32" />

        <h1
          className="text-[55px] font-bold leading-[0.95] tracking-[-0.05em] md:text-[65px] lg:text-[90px]"
          style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
        >
          Your sound.<br/>
          Your story.<br/>
          <span className="text-[#1ed760]">Tracked.</span>
        </h1>

        <p className="mt-6 mb-10 max-w-md text-[17px] leading-[26px] tracking-[-0.19px] text-gray-300 md:text-[19px] md:leading-[29.45px]">
          See what you're playing right now, and what you've played for years.
        </p>

        {/* Dynamic Wrapped Showcase Carousel */}
        <div className="group relative aspect-[9/16] w-full max-w-[220px] md:max-w-[260px] overflow-hidden rounded-[24px] border border-[#374151] bg-[#121212] shadow-2xl">
          <AnimatePresence mode="popLayout">
            <motion.img
              key={currentSlide}
              src={slides[currentSlide]}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0 h-full w-full object-cover"
              alt="MusiTrack Custom Wrapped Preview"
            />
          </AnimatePresence>

          <div className="absolute inset-0 z-10 rounded-[24px] shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] pointer-events-none"></div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70 hover:scale-110 opacity-80 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70 hover:scale-110 opacity-80 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Next slide"
          >
            <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>

      {/* RIGHT AUTH SECTION - Dark Card & Form */}
      <section className="w-full max-w-md justify-self-center md:justify-self-end mt-10 md:mt-0">
        <div className="rounded-[20px] border border-[#374151] bg-[#121212] p-8 shadow-2xl md:p-10">
          <h2 className="mb-6 text-[32px] font-semibold leading-tight tracking-tight text-white md:text-[40px]">
            {title}
          </h2>

          {mode === "forgot" && (
            <p className="mb-6 text-[16px] leading-[24px] text-gray-400">
              Enter your email and we'll send you a link to choose a new password.
            </p>
          )}

          {/* Social Auth (Hidden in 'forgot password' mode) */}
          {mode !== "forgot" && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={busy}
                className="flex w-full items-center justify-center gap-3 rounded-[12px] border border-[#374151] bg-[#121212] py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-white/5 disabled:opacity-60"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              <div className="relative my-6 flex items-center py-2">
                <div className="grow border-t border-[#374151]"></div>
                <span className="shrink-0 px-4 text-[12px] uppercase tracking-widest text-gray-500">Or email</span>
                <div className="grow border-t border-[#374151]"></div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-[12px] font-semibold uppercase tracking-widest text-gray-400">Email</span>
              <input type="email" required autoComplete="email" value={email}
                onChange={(e) => setEmail(e.target.value)} className={field} />
            </label>

            {mode !== "forgot" && (
              <label className="block">
                <span className="mb-2 block text-[12px] font-semibold uppercase tracking-widest text-gray-400">Password</span>
                <input type="password" required minLength={8}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password} onChange={(e) => setPassword(e.target.value)} className={field} />

                {mode === "signin" && (
                  <div className="mt-3 text-right">
                    <button type="button" onClick={() => switchMode("forgot")}
                      className="text-[14px] font-medium text-gray-400 underline underline-offset-4 transition-colors hover:text-white">
                      Forgot password?
                    </button>
                  </div>
                )}
              </label>
            )}

            {error && <p role="alert" className="text-[14px] font-medium text-[#ff4d4f]">{error}</p>}
            {notice && <p role="status" className="text-[14px] font-medium text-[#1ed760]">{notice}</p>}

            <button type="submit" disabled={busy}
              className="mt-4 w-full rounded-[20px] bg-[#1ed760] py-4 text-[16px] font-bold text-[#121212] transition-transform hover:scale-[1.02] active:scale-100 disabled:opacity-60 disabled:hover:scale-100"
            >
              {busy ? "Working…" : button}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-[#374151] pt-6">
            {mode === "forgot" ? (
              <button type="button" className="text-[16px] font-medium text-white underline underline-offset-4 transition-colors hover:text-[#1ed760]"
                onClick={() => switchMode("signin")}>
                Back to sign in
              </button>
            ) : (
              <button type="button" className="text-[16px] font-medium text-white underline underline-offset-4 transition-colors hover:text-[#1ed760]"
                onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}>
                {mode === "signin" ? "New here? Create an account" : "Have an account? Sign in"}
              </button>
            )}
          </div>
        </div>
      </section>

    </main>
  );
}