import { useState } from "react";
import type { PlanDecision, RunPlan } from "../types";

const MAX_ITEMS = 4;

export function PlanEditor({ plan, busy, onDecide }: { plan: RunPlan; busy: boolean; onDecide: (decision: PlanDecision) => void }) {
  const [items, setItems] = useState<string[]>(plan.subQuestions);

  const cleaned = items.map((q) => q.trim()).filter((q) => q.length > 0);
  const changed = JSON.stringify(cleaned) !== JSON.stringify(plan.subQuestions);

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Setujui rencana riset</h2>
      <p className="muted">Riset belum dimulai. Periksa sub-pertanyaan di bawah, ubah bila perlu, lalu setujui. Pencarian web baru berjalan setelah kamu setuju.</p>

      {items.map((q, i) => (
        <div className="plan-item" key={i}>
          <input type="text" value={q} maxLength={300} aria-label={`Sub-pertanyaan ${i + 1}`} onChange={(e) => setItems((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))} />
          <button type="button" aria-label={`Hapus sub-pertanyaan ${i + 1}`} onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))} disabled={busy || items.length <= 1}>
            ✕
          </button>
        </div>
      ))}

      {items.length < MAX_ITEMS && (
        <button type="button" onClick={() => setItems((prev) => [...prev, ""])} disabled={busy}>
          + Tambah sub-pertanyaan
        </button>
      )}

      <div className="row" style={{ marginTop: 16 }}>
        <button className="primary" disabled={busy || cleaned.length === 0} onClick={() => onDecide({ approved: true, subQuestions: changed ? cleaned : undefined })}>
          {changed ? "Setujui dengan perubahan" : "Setujui"}
        </button>
        <button className="danger" disabled={busy} onClick={() => onDecide({ approved: false })}>
          Tolak
        </button>
      </div>
    </div>
  );
}
