import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already made a choice
    const consent = localStorage.getItem("musitrack_cookie_consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleConsent = (choice) => {
    localStorage.setItem("musitrack_cookie_consent", choice);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-line bg-surface/95 p-4 backdrop-blur-md sm:p-6"
        >
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-sm text-snow/80">
              <p>
                <strong>MusiTrack uses cookies</strong> to keep you logged in to Spotify and analyze site performance. We never sell your data.
                Read our <a href="/cookies" className="text-[#1ed760] hover:underline">Cookie Policy</a> and <a href="/privacy" className="text-[#1ed760] hover:underline">Privacy Policy</a>.
              </p>
            </div>
            <div className="flex w-full shrink-0 items-center gap-3 sm:w-auto">
              <button
                onClick={() => handleConsent("declined")}
                className="w-full rounded-xl border border-line bg-night px-5 py-2.5 text-sm font-bold text-snow transition hover:bg-white/5 sm:w-auto"
              >
                Decline
              </button>
              <button
                onClick={() => handleConsent("accepted")}
                className="w-full rounded-xl bg-[#1ed760] px-5 py-2.5 text-sm font-bold text-[#121212] transition hover:brightness-110 sm:w-auto"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}