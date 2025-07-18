"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import PulseHubLogo from "@/components/ui/PulseHubLogo";
import { FiUser, FiShoppingBag } from "react-icons/fi";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Redireciona usuários já autenticados para seus respectivos dashboards
    if (user) {
      if (user.type === "fornecedor") {
        router.push("/supplier/dashboard");
      } else {
        router.push("/reseller/dashboard");
      }
    }
  }, [user, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-gray-50 dark:bg-gray-900">
      {/* Logo */}
      <div className="mb-12">
        <PulseHubLogo size="lg" />
      </div>

      {/* Título */}
      <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
        Bem-vindo ao SPECS
      </h1>
      <p className="text-xl mb-12 text-gray-600 dark:text-gray-300">
        Sistema de Representantes e Fornecedores
      </p>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto w-full">
        {/* Card Fornecedor */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiShoppingBag className="text-blue-600" size={28} />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white text-center">Fornecedor</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
            Gerencie seus produtos, revendedores e acompanhe pedidos.
          </p>
          <button 
            onClick={() => router.push("/login?type=fornecedor")}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <span>Entrar como Fornecedor</span>
            <FiUser className="ml-2" />
          </button>
        </div>

        {/* Card Revendedor */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUser className="text-green-600" size={28} />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white text-center">Revendedor</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
            Acesse catálogos, solicite orçamentos e faça pedidos.
          </p>
          <button 
            onClick={() => router.push("/login?type=revendedor")}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <span>Entrar como Revendedor</span>
            <FiUser className="ml-2" />
          </button>
        </div>
      </div>
    </main>
  );
}