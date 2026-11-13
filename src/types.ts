// Bentuk data dari API server Mastra (lihat src/mastra/server/types.ts di backend).

export type StepStatus = "pending" | "running" | "suspended" | "success" | "failed";

export type RunStatus = "starting" | "running" | "suspended" | "success" | "failed";

export type RunStep = {
  id: string;
  label: string;
  status: StepStatus;
};

export type RunPlan = {
  reason: string;
  topic: string;
  subQuestions: string[];
};

export type RunDTO = {
  runId: string;
  topic: string;
  status: RunStatus;
  steps: RunStep[];
  plan?: RunPlan;
  report?: string;
  reportId?: string;
  error?: string;
};

// Ringkasan satu riset di daftar beranda.
export type RunSummary = {
  runId: string;
  topic: string;
  createdAt: string;
  hasReport: boolean;
};

export type PlanDecision = {
  approved: boolean;
  subQuestions?: string[];
};
