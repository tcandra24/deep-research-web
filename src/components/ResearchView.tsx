import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getRun, resumeRun } from "../api";
import { useAuth } from "../AuthContext";
import type { PlanDecision, RunDTO, StepStatus } from "../types";
import { AskPanel } from "./AskPanel";
import { PlanEditor } from "./PlanEditor";
import { Report } from "./Report";

const MARKS: Record<StepStatus, string> = {
  success: "✓",
  failed: "✗",
  running: "●",
  suspended: "⏸",
  pending: "○",
};

const POLL_MS = 2000;
// Setelah resume, status "suspended" lama mungkin masih terbaca sebentar.
const RESUME_GRACE_MS = 20_000;

export function ResearchView({ runId }: { runId: string }) {
  const { handleError } = useAuth();
  const [data, setData] = useState<RunDTO | null>(null);
  const [polling, setPolling] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resumedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!polling) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function tick() {
      try {
        const next = await getRun(runId);
        if (cancelled) return;
        setData(next);
        setError(null);

        const justResumed = resumedAt.current !== null && Date.now() - resumedAt.current < RESUME_GRACE_MS;
        const waitingForUser = next.status === "suspended" && !justResumed;
        if (next.status === "success" || next.status === "failed" || waitingForUser) {
          setPolling(false);
          return;
        }
        if (next.status !== "suspended") resumedAt.current = null;
      } catch (err) {
        if (cancelled) return;
        const status = (err as { status?: number }).status;
        if (status === 404) {
          setError("Riset tidak ditemukan.");
          setPolling(false);
          return;
        }
        if (status === 401) {
          // handleError mengeluarkan pengguna; berhenti polling.
          setError(handleError(err));
          setPolling(false);
          return;
        }
        // gangguan jaringan atau server sesaat: coba lagi
      }
      if (!cancelled) timer = setTimeout(tick, POLL_MS);
    }

    void tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [runId, polling, handleError]);

  async function decide(decision: PlanDecision) {
    setBusy(true);
    setError(null);
    try {
      await resumeRun(runId, decision);
      resumedAt.current = Date.now();
      setPolling(true);
    } catch (err) {
      setError(handleError(err));
    } finally {
      setBusy(false);
    }
  }

  if (error && !data) {
    return (
      <div>
        <p className="error">{error}</p>
        <p>
          <Link to="/">← Kembali</Link>
        </p>
      </div>
    );
  }
  if (!data) return <p className="muted">Memuat...</p>;

  const cancelled = data.status === "failed" && data.error?.includes("ditolak");

  return (
    <div>
      <h1>{data.topic}</h1>
      <p className="muted">
        {data.status === "starting" && "Memulai..."}
        {data.status === "running" && "Sedang berjalan..."}
        {data.status === "suspended" && "Menunggu persetujuan kamu"}
        {data.status === "success" && "Selesai"}
        {data.status === "failed" && (cancelled ? "Dibatalkan" : "Berhenti karena error")}
      </p>

      {data.steps.length > 0 && (
        <div className="card">
          <ol className="steps">
            {data.steps.map((s) => (
              <li key={s.id} className={`step-${s.status}`}>
                <span className="mark" aria-hidden>
                  {MARKS[s.status]}
                </span>
                <span>{s.label}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {data.status === "suspended" && data.plan && <PlanEditor plan={data.plan} busy={busy} onDecide={decide} />}

      {error && <p className="error">{error}</p>}

      {data.status === "failed" && data.error && <p className="error">{data.error}</p>}

      {data.status === "success" && data.report && data.reportId && (
        <>
          <div className="card">
            <Report markdown={data.report} />
          </div>
          <AskPanel reportId={data.reportId} />
        </>
      )}

      {data.status === "success" && !data.report && <p className="muted">Laporan belum tersedia. Muat ulang halaman sebentar lagi.</p>}

      <p style={{ marginTop: 32 }}>
        <Link to="/">← Riset baru</Link>
      </p>
    </div>
  );
}
