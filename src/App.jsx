import { useAuth } from "./context/AuthContext.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import CookieConsent from "./components/CookieConsent.jsx";

// Import your new legal pages (ensure they are saved in your /pages/ folder)
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import CookiePolicy from "./pages/CookiePolicy.jsx";
import TermsAndConditions from "./pages/TermsAndConditions.jsx";

export default function App() {
  const { session, loading, recovery } = useAuth();

  // 1. Read the current URL path
  const path = window.location.pathname;

  // 2. If the URL matches a legal page, render it immediately
  // (This allows users and Spotify reviewers to read them without logging in)
  if (path === "/privacy") return <PrivacyPolicy />;
  if (path === "/cookies") return <CookiePolicy />;
  if (path === "/terms") return <TermsAndConditions />;

  // 3. Otherwise, proceed with your normal login/dashboard flow
  if (loading) return <p className="p-8">Loading…</p>;

  return (
    <>
      {recovery ? (
        <ResetPasswordPage />
      ) : session ? (
        <DashboardPage />
      ) : (
        <LoginPage />
      )}
      {/* Show the banner on the main app screens */}
      <CookieConsent />
    </>
  );
}
