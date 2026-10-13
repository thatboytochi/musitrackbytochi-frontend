import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Removes any saved Supabase login from this browser (used when it is stuck or broken).
function clearSavedLogin() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("sb-") && k.endsWith("-auth-token"))
      .forEach((k) => localStorage.removeItem(k));
  } catch { /* storage unavailable: nothing to clear */ }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  // True while the user is on the "choose a new password" step of a reset-email link.
  // The email link opens this site with "#...type=recovery" in the address; we also
  // listen for Supabase's PASSWORD_RECOVERY event in case the hash was already read.
  const [recovery, setRecovery] = useState(
    () => typeof window !== "undefined" && window.location.hash.includes("type=recovery")
  );

  useEffect(() => {
    let cancelled = false;

    // Restore an existing session. If Supabase doesn't answer within 6 seconds
    // (bad connection, wrong URL, corrupted saved login) we stop waiting, clear
    // the saved login, and show the login page instead of "Loading…" forever.
    const timeout = new Promise((resolve) => setTimeout(() => resolve({ timedOut: true }), 6000));
    Promise.race([supabase.auth.getSession(), timeout])
      .then((result) => {
        if (cancelled) return;
        if (result.timedOut || result.error) {
          clearSavedLogin();
          setSession(null);
        } else {
          setSession(result.data.session);
        }
      })
      .catch(() => { if (!cancelled) { clearSavedLogin(); setSession(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });

    // Then listen for sign-in / sign-out / token refresh / password recovery.
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      setSession(s);
    });
    return () => { cancelled = true; data.subscription.unsubscribe(); };
  }, []);

  const value = {
    session,
    user: session?.user ?? null, // user.id === profiles.id in Postgres
    loading,
    recovery,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password) => supabase.auth.signUp({ email, password }),
    signOut: () => supabase.auth.signOut(),
    // Google OAuth Sign In
    signInWithGoogle: () =>
      supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      }),
    // Sends the "reset your password" email. The link brings the user back to this site.
    resetPassword: (email) =>
      supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin }),
    // Saves the new password (works because the email link signed the user in temporarily).
    updatePassword: (password) => supabase.auth.updateUser({ password }),
    finishRecovery: () => {
      setRecovery(false);
      // Tidy the "#access_token=..." part off the address bar.
      window.history.replaceState(null, "", window.location.pathname);
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}