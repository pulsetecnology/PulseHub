"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function TestMiddlewarePage() {
  const { data: session, status } = useSession();
  const [testResults, setTestResults] = useState<Array<{ route: string; result: string }>>([]);

  // Função para testar acesso a uma rota
  const testRoute = async (route: string) => {
    try {
      const response = await fetch(route, { method: "HEAD" });
      return {
        route,
        result: `Status: ${response.status}, Redirected: ${response.redirected ? "Sim" : "Não"}`,
      };
    } catch (error) {
      return {
        route,
        result: `Erro: ${error instanceof Error ? error.message : "Desconhecido"}`,
      };
    }
  };

  // Executar testes quando o componente montar
  useEffect(() => {
    const runTests = async () => {
      if (status === "loading") return;

      const routes = [
        "/supplier/dashboard",
        "/reseller/dashboard",
        "/profile",
        "/login",
        "/register",
      ];

      const results = await Promise.all(routes.map(testRoute));
      setTestResults(results);
    };

    runTests();
  }, [status]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Teste de Middleware</h1>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Status da Autenticação</h2>
        <p>
          <strong>Status:</strong> {status}
        </p>
        <p>
          <strong>Usuário:</strong> {session?.user?.name || "Não autenticado"}
        </p>
        <p>
          <strong>Tipo:</strong> {session?.user?.type || "N/A"}
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Resultados dos Testes</h2>
        {testResults.length > 0 ? (
          <ul className="space-y-2">
            {testResults.map((test, index) => (
              <li key={index} className="p-3 bg-gray-50 rounded">
                <strong>Rota:</strong> {test.route}
                <br />
                <strong>Resultado:</strong> {test.result}
              </li>
            ))}
          </ul>
        ) : (
          <p>Executando testes...</p>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold mb-2">Links para Teste Manual</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/supplier/dashboard" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Dashboard Fornecedor
          </Link>
          <Link href="/reseller/dashboard" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Dashboard Revendedor
          </Link>
          <Link href="/profile" className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
            Perfil
          </Link>
          <Link href="/login" className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            Login
          </Link>
          <Link href="/register" className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            Registro
          </Link>
          <Link href="/" className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
            Página Inicial
          </Link>
        </div>
      </div>
    </div>
  );
}