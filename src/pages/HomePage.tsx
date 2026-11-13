import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listRuns } from "../api";
import { useAuth } from "../AuthContext";
import { NewResearchForm } from "../components/NewResearchForm";
import type { RunSummary } from "../types";

export function HomePage() {
  const { handleError } = useAuth();
  const [runs, setRuns] = useState<RunSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listRuns()
      .then((data) => {
        if (!cancelled) setRuns(data);
      })
      .catch((err) => {
        if (!cancelled) setError(handleError(err));
      });
    return () => {
      cancelled = true;
    };
  }, [handleError]);

  return (
    <div>
      <h1>Deep Research Assistant</h1>
      <p className="muted">Masukkan topik. Sistem menyusun rencana, kamu setujui, lalu laporan bersumber dibuat.</p>

      <div className="card">
        <NewResearchForm />
      </div>

      <h2>Riset sebelumnya</h2>
      {error && <p className="error">{error}</p>}
      {!error && runs === null && <p className="muted">Memuat...</p>}
      {runs && runs.length === 0 && <p className="muted">Belum ada riset.</p>}
      {runs && runs.length > 0 && (
        <ul className="runs">
          {runs.map((r) => (
            <li key={r.runId}>
              <Link to={`/research/${r.runId}`}>{r.topic}</Link>
              <div className="muted">
                {new Date(r.createdAt).toLocaleString("id-ID")}
                {r.hasReport ? "" : " · belum selesai"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
