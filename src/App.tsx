import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { ResearchPage } from "./pages/ResearchPage";

// Halaman yang butuh login. Selama sesi dicek, tampilkan "Memuat..."
// agar tidak sempat menampilkan layar login lalu berpindah.
function ProtectedLayout() {
  const { state, signOut } = useAuth();

  if (state.status === "loading") return <p className="muted">Memuat...</p>;
  if (state.status === "signedOut") return <Navigate to="/login" replace />;

  return (
    <>
      <header className="topbar">
        <a href="/" className="brand">
          Deep Research
        </a>
        <span className="muted">{state.email}</span>
        <button onClick={() => void signOut()}>Keluar</button>
      </header>
      <Outlet />
    </>
  );
}

export function App() {
  return (
    <main>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/research/:runId" element={<ResearchPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}
