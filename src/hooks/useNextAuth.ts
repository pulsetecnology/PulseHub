"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useNextAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        // Traduzir mensagens de erro comuns
        if (result.error === "CredentialsSignin") {
          return { success: false, error: "Email ou senha incorretos. Por favor, tente novamente." };
        }
        return { success: false, error: result.error };
      }

      // Aguardar um momento para a sessão ser atualizada
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Obter a sessão atualizada
      const updatedSession = await fetch('/api/auth/session');
      const sessionData = await updatedSession.json();
      
      // Redirect based on user type
      if (sessionData?.user?.type === "fornecedor") {
        router.push("/supplier/dashboard");
      } else if (sessionData?.user?.type === "revendedor") {
        router.push("/reseller/dashboard");
      } else {
        // Refresh to get the session
        router.refresh();
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "Ocorreu um erro durante o login." };
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return {
    user: session?.user || null,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    login,
    logout,
  };
}