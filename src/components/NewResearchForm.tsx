import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startResearch } from "../lib/api";
import { useAuth } from "../AuthContext";

export function NewResearchForm() {
  const navigate = useNavigate();
  const { handleError } = useAuth();
  const [topic, setTopic] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);

    try {
      const runId = await startResearch(topic.trim());
      navigate(`/research/${runId}`);
    } catch (err) {
      setError(handleError(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="row">
        <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topik riset, misalnya: dampak AI pada pekerjaan developer" maxLength={300} aria-label="Topik riset" />
        <button className="primary" type="submit" disabled={busy || topic.trim().length < 3}>
          {busy ? "Memulai..." : "Mulai"}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
