"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import PulseHubLogo from "@/components/ui/PulseHubLogo";
import Button from "@/components/ui/Button";
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
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 relative">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/3 to-secondary/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="z-10 max-w-5xl w-full items-center justify-center text-center">
        <div className="mb-12 flex justify-center">
          <PulseHubLogo size="lg" />
        </div>

        <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
          Bem-vindo ao SPECS
        </h1>
        <p className="text-xl mb-12 text-gray-600 dark:text-gray-300">
          Sistema de Representantes e Fornecedores
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiShoppingBag className="text-primary" size={28} />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Fornecedor</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Gerencie seus produtos, revendedores e acompanhe pedidos.
            </p>
            <Button 
              fullWidth 
              onClick={() => router.push("/login?type=fornecedor")}
              rightIcon={<FiUser />}
            >
              Entrar como Fornecedor
            </Button>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUser className="text-secondary" size={28} />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Revendedor</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Acesse catálogos, solicite orçamentos e faça pedidos.
            </p>
            <Button 
              fullWidth 
              variant="secondary"
              onClick={() => router.push("/login?type=revendedor")}
              rightIcon={<FiUser />}
            >
              Entrar como Revendedor
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}