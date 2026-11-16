import { Navigate, useParams } from "react-router-dom";
import { ResearchView } from "../components/ResearchView";

export function ResearchPage() {
  const { runId } = useParams();
  if (!runId) return <Navigate to="/" replace />;

  // key = runId: pindah ke riset lain (mis. setelah "Mulai ulang") membuat
  // ResearchView dimulai dari nol, bukan memakai ulang state riset sebelumnya.
  return <ResearchView key={runId} runId={runId} />;
}
