import { Navigate, useParams } from "react-router-dom";
import { ResearchView } from "../components/ResearchView";

export function ResearchPage() {
  const { runId } = useParams();
  if (!runId) return <Navigate to="/" replace />;
  return <ResearchView runId={runId} />;
}
