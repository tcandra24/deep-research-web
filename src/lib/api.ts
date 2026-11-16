import { getToken } from "./auth";
import type { PlanDecision, RunDTO, RunSummary } from "../types";

const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:4111").replace(/\/$/, "");

export class ApiError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// Sesi tidak ada atau ditolak server: UI harus mengarahkan ke halaman login.
export class UnauthorizedError extends ApiError {
  constructor(message = "Sesi berakhir. Silakan masuk lagi.") {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  // Percobaan kedua hanya untuk 401: token bisa saja baru kedaluwarsa,
  // jadi ambil token baru sekali lagi sebelum menyerah.
  for (let attempt = 0; attempt < 2; attempt++) {
    const token = await getToken();
    if (!token) throw new UnauthorizedError();

    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);
    if (init.body) headers.set("Content-Type", "application/json");

    const res = await fetch(`${API_URL}${path}`, { ...init, headers });
    if (res.status === 401 && attempt === 0) continue;

    const data = await res.json().catch(() => null);
    if (res.status === 401) throw new UnauthorizedError();
    if (!res.ok) {
      throw new ApiError(res.status, data?.error ?? `Permintaan gagal (${res.status}).`);
    }
    return data as T;
  }
  throw new UnauthorizedError();
}

export async function listRuns(): Promise<RunSummary[]> {
  const data = await request<{ runs: RunSummary[] }>("/research");
  return data.runs;
}

export async function startResearch(topic: string): Promise<string> {
  const data = await request<{ runId: string }>("/research", {
    method: "POST",
    body: JSON.stringify({ topic }),
  });
  return data.runId;
}

export function getRun(runId: string): Promise<RunDTO> {
  return request<RunDTO>(`/research/${encodeURIComponent(runId)}`, { cache: "no-store" });
}

export async function resumeRun(runId: string, decision: PlanDecision): Promise<void> {
  await request(`/research/${encodeURIComponent(runId)}/resume`, {
    method: "POST",
    body: JSON.stringify(decision),
  });
}

export async function askReport(reportId: string, question: string): Promise<string> {
  const data = await request<{ answer: string }>(`/reports/${encodeURIComponent(reportId)}/ask`, { method: "POST", body: JSON.stringify({ question }) });
  return data.answer;
}
