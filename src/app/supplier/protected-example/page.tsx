"use client";

import RouteGuard from "@/components/auth/RouteGuard";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ProtectedSupplierPage() {
  const { data: session } = useSession();

  return (
    <RouteGuard allowedRoles={["fornecedor"]}>
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Página Protegida - Apenas Fornecedores</h1>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-2">Informações do Usuário</h2>
            <p><strong>Nome:</strong> {session?.user?.name}</p>
            <p><strong>Email:</strong> {session?.user?.email}</p>
            <p><strong>Tipo:</strong> {session?.user?.type}</p>
          </div>
          
          <p className="mb-4">
            Esta página só pode ser acessada por usuários autenticados com o tipo &quot;fornecedor&quot;.
            Se um usuário do tipo &quot;revendedor&quot; tentar acessar, será redirecionado para seu dashboard.
          </p>
          
          <div className="mt-6">
            <Link href="/supplier/dashboard" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Voltar para o Dashboard
            </Link>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}