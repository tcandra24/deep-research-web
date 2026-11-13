import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export function LoginPage() {
  const { state, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (state.status === "signedIn") return <Navigate to="/" replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);

    const result = mode === "signIn" ? await signIn(email.trim(), password) : await signUp(name.trim(), email.trim(), password);

    setBusy(false);
    if (!result.ok) {
      setError(result.message);
    } else if (mode === "signUp") {
      // Jika sesi langsung aktif, halaman ini berpindah sendiri.
      // Jika tidak (mis. perlu verifikasi email), beri petunjuk.
      setNotice("Akun dibuat. Jika email perlu diverifikasi, cek kotak masukmu lalu masuk.");
    }
  }

  const isSignUp = mode === "signUp";

  return (
    <div>
      <h1>Deep Research Assistant</h1>
      <p className="muted">{isSignUp ? "Buat akun baru" : "Masuk untuk melanjutkan"}</p>

      <form className="card stack" onSubmit={submit}>
        {isSignUp && <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama" aria-label="Nama" autoComplete="name" required />}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" aria-label="Email" autoComplete="email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Kata sandi" aria-label="Kata sandi" autoComplete={isSignUp ? "new-password" : "current-password"} minLength={8} required />
        <button className="primary" type="submit" disabled={busy}>
          {busy ? "Memproses..." : isSignUp ? "Daftar" : "Masuk"}
        </button>
        {error && <p className="error">{error}</p>}
        {notice && <p className="notice">{notice}</p>}
      </form>

      <p className="muted">
        {isSignUp ? "Sudah punya akun? " : "Belum punya akun? "}
        <button
          type="button"
          className="link"
          onClick={() => {
            setMode(isSignUp ? "signIn" : "signUp");
            setError(null);
            setNotice(null);
          }}
        >
          {isSignUp ? "Masuk" : "Daftar"}
        </button>
      </p>
    </div>
  );
}
