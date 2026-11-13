import { useState } from "react";
import { askReport } from "../api";
import { useAuth } from "../AuthContext";

type Message = { role: "user" | "bot"; text: string };

export function AskPanel({ reportId }: { reportId: string }) {
  const { handleError } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q || busy) return;

    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");
    setBusy(true);
    setError(null);

    try {
      const answer = await askReport(reportId, q);
      setMessages((prev) => [...prev, { role: "bot", text: answer }]);
    } catch (err) {
      setError(handleError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h2>Tanya lanjutan</h2>
      <p className="muted">Dijawab hanya dari isi laporan ini. Percakapan tersimpan di server, tetapi riwayatnya belum ditampilkan ulang setelah halaman dimuat ulang.</p>

      <div className="chat">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.text}
          </div>
        ))}
        {busy && <div className="msg bot muted">Menjawab...</div>}
      </div>

      <form className="row" onSubmit={send}>
        <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Tanyakan sesuatu tentang laporan ini" maxLength={1000} aria-label="Pertanyaan" />
        <button className="primary" type="submit" disabled={busy || !question.trim()}>
          Kirim
        </button>
      </form>
      {error && <p className="error">{error}</p>}
    </section>
  );
}
