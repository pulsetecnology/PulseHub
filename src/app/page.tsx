"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNextAuth } from "@/hooks/useNextAuth";

export default function Home() {
  const router = useRouter();
  const { user } = useNextAuth();

  useEffect(() => {
    // Redireciona usuários já autenticados para seus respectivos dashboards
    if (user) {
      if (user.type === "fornecedor") {
        router.push("/supplier/dashboard");
      } else if (user.type === "revendedor") {
        router.push("/reseller/dashboard");
      }
    } else {
      // Redireciona usuários não autenticados para a página de login
      router.push("/login");
    }
  }, [user, router]);

  // Esta página não será exibida, pois o usuário será redirecionado
  // Mas é bom ter um conteúdo mínimo para evitar problemas de renderização
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Redirecionando...</p>
    </div>
  );
}