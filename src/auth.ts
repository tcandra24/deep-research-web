import { createAuthClient } from "@neondatabase/neon-js/auth";
import { BetterAuthReactAdapter } from "@neondatabase/neon-js/auth/react/adapters";

const authUrl = import.meta.env.VITE_NEON_AUTH_URL as string | undefined;
if (!authUrl) {
  throw new Error("VITE_NEON_AUTH_URL belum diisi (lihat .env.example).");
}

// credentials: "include" agar cookie sesi ikut terkirim bila origin frontend
// berbeda dari origin Neon Auth.
export const authClient = createAuthClient(authUrl, {
  adapter: BetterAuthReactAdapter({ fetchOptions: { credentials: "include" } }),
});

// JWT milik pengguna yang sedang login (untuk header Authorization ke API).
// Token berumur pendek (15 menit); getSession() memperbaruinya otomatis,
// jadi panggil fungsi ini setiap kali membuat request, jangan disimpan.
export async function getToken(): Promise<string | null> {
  const { data, error } = await authClient.getSession();
  if (error || !data) return null;
  return data.session.token ?? null;
}
