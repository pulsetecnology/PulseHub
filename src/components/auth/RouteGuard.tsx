"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserType } from "@/contexts/AuthContextWithNextAuth";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserType[];
  redirectTo?: string;
}

/**
 * Componente para proteger rotas no lado do cliente
 * Complementa o middleware para garantir proteção de rotas
 */
export default function RouteGuard({
  children,
  allowedRoles = [],
  redirectTo = "/login",
}: RouteGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userType = session?.user?.type as UserType | undefined;
  const isLoading = status === "loading";

  useEffect(() => {
    // Não fazer nada enquanto estiver carregando
    if (isLoading) return;

    // Se não estiver autenticado, redirecionar para login
    if (status === "unauthenticated") {
      router.push(redirectTo);
      return;
    }

    // Se houver roles permitidas e o usuário não tiver uma delas, redirecionar
    if (
      allowedRoles.length > 0 &&
      userType &&
      !allowedRoles.includes(userType)
    ) {
      // Redirecionar para o dashboard apropriado
      const dashboardUrl = userType === "fornecedor" 
        ? "/supplier/dashboard" 
        : "/reseller/dashboard";
      
      router.push(dashboardUrl);
    }
  }, [status, userType, allowedRoles, redirectTo, router, isLoading]);

  // Mostrar nada enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-blue-400"></div>
          <div className="mt-4 text-gray-600">Verificando autenticação...</div>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado ou não tiver permissão, não renderizar nada
  // (o redirecionamento será feito pelo useEffect)
  if (
    status === "unauthenticated" ||
    (allowedRoles.length > 0 && userType && !allowedRoles.includes(userType))
  ) {
    return null;
  }

  // Se estiver autenticado e tiver permissão, renderizar o conteúdo
  return <>{children}</>;
}