import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import Brand from "../components/Brand.jsx";

const field = "w-full rounded-xl border border-line bg-night px-4 py-3 text-snow";

// Shown after the user clicks the link in the reset email.
export default function ResetPasswordPage() {
  const { updatePassword, finishRecovery, signOut } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) return setError("The two passwords don't match.");
    setBusy(true);
    const { error } = await updatePassword(password);
    setBusy(false);
    if (error) {
      return setError(
        /session/i.test(error.message)
          ? "This reset link has expired or was already used. Go back and request a new one."
          : error.message
      );
    }
    finishRecovery(); // the user is signed in now, so the dashboard opens
  }

  async function cancel() {
    await signOut();
    finishRecovery();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-8 px-6 py-12">
      <Brand className="justify-center" />
      <section className="rounded-3xl border border-line bg-surface p-8">
        <h1 className="text-2xl font-semibold">Choose a new password</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">New password</span>
            <input type="password" required minLength={8} autoComplete="new-password"
              value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Confirm new password</span>
            <input type="password" required minLength={8} autoComplete="new-password"
              value={confirm} onChange={(e) => setConfirm(e.target.value)} className={field} />
          </label>
          {error && <p role="alert" className="text-sm font-medium text-red-400">{error}</p>}

          {/* Updated button to Spotify green */}
          <button type="submit" disabled={busy}
            className="w-full rounded-xl bg-[#1ed760] py-3 font-bold text-[#121212] transition hover:brightness-110 disabled:opacity-60">
            {busy ? "Saving…" : "Save new password"}
          </button>
        </form>
        <button type="button" onClick={cancel} className="mt-5 text-sm font-medium underline underline-offset-4 hover:text-snow/80 transition-colors">
          Back to sign in
        </button>
      </section>
    </main>
  );
}