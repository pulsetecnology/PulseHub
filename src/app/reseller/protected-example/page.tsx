"use client";

import RouteGuard from "@/components/auth/RouteGuard";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ProtectedResellerPage() {
  const { data: session } = useSession();

  return (
    <RouteGuard allowedRoles={["revendedor"]}>
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Página Protegida - Apenas Revendedores</h1>
          
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-2">Informações do Usuário</h2>
            <p><strong>Nome:</strong> {session?.user?.name}</p>
            <p><strong>Email:</strong> {session?.user?.email}</p>
            <p><strong>Tipo:</strong> {session?.user?.type}</p>
          </div>
          
          <p className="mb-4">
            Esta página só pode ser acessada por usuários autenticados com o tipo &quot;revendedor&quot;.
            Se um usuário do tipo &quot;fornecedor&quot; tentar acessar, será redirecionado para seu dashboard.
          </p>
          
          <div className="mt-6">
            <Link href="/reseller/dashboard" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
              Voltar para o Dashboard
            </Link>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}