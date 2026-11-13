import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authClient } from "./auth";
import { UnauthorizedError } from "./api";

type AuthState = { status: "loading" } | { status: "signedOut" } | { status: "signedIn"; email: string };

type AuthResult = { ok: true } | { ok: false; message: string };

type AuthContextValue = {
  state: AuthState;
  signIn(email: string, password: string): Promise<AuthResult>;
  signUp(name: string, email: string, password: string): Promise<AuthResult>;
  signOut(): Promise<void>;
  // Mengubah error API menjadi pesan; jika sesi habis, otomatis keluar.
  handleError(err: unknown): string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  const refresh = useCallback(async () => {
    try {
      const { data } = await authClient.getSession();
      setState(data ? { status: "signedIn", email: data.user.email } : { status: "signedOut" });
    } catch {
      setState({ status: "signedOut" });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Fungsi-fungsi di bawah sengaja stabil (useCallback tanpa dependensi pada
  // state), karena komponen memakainya sebagai dependensi efek. Jika
  // identitasnya berubah saat status login berubah, efek polling dan fetch
  // akan berjalan ulang dan memanggil API dua kali.
  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) return { ok: false, message: error.message ?? "Gagal masuk." };
      await refresh();
      return { ok: true };
    },
    [refresh],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string): Promise<AuthResult> => {
      const { error } = await authClient.signUp.email({ name, email, password });
      if (error) return { ok: false, message: error.message ?? "Gagal mendaftar." };
      await refresh();
      return { ok: true };
    },
    [refresh],
  );

  const signOut = useCallback(async () => {
    await authClient.signOut().catch(() => undefined);
    setState({ status: "signedOut" });
  }, []);

  const handleError = useCallback((err: unknown): string => {
    if (err instanceof UnauthorizedError) {
      void authClient.signOut().catch(() => undefined);
      setState({ status: "signedOut" });
      return err.message;
    }
    return err instanceof Error ? err.message : "Terjadi kesalahan.";
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ state, signIn, signUp, signOut, handleError }), [state, signIn, signUp, signOut, handleError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
