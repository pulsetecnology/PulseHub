"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNextAuth } from "@/hooks/useNextAuth";
import MainLayout from "@/layouts/MainLayout";
import { FiBox, FiUsers, FiShoppingBag, FiTrendingUp } from "react-icons/fi";
import Link from "next/link";

export default function SupplierDashboard() {
  const router = useRouter();
  const { user } = useNextAuth();

  useEffect(() => {
    // Redireciona se não estiver autenticado ou não for fornecedor
    if (!user) {
      router.push("/login?type=fornecedor");
    } else if (user.type !== "fornecedor") {
      router.push("/");
    }
  }, [user, router]);

  if (!user || user.type !== "fornecedor") {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Bem-vindo ao seu painel de bordo
          </p>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-4">
                <FiBox size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Produtos</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">24</h3>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-4">
                <FiUsers size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Revendedores</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">12</h3>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mr-4">
                <FiShoppingBag size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pedidos</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">8</h3>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 mr-4">
                <FiTrendingUp size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Vendas</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">R$ 5.240</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Seções principais */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pedidos recentes */}
          <div className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Pedidos recentes</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3">ID</th>
                    <th className="pb-3">Revendedor</th>
                    <th className="pb-3">Valor</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-3">#1234</td>
                    <td className="py-3">Maria Silva</td>
                    <td className="py-3">R$ 1.200,00</td>
                    <td className="py-3"><span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs">Entregue</span></td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-3">#1235</td>
                    <td className="py-3">João Santos</td>
                    <td className="py-3">R$ 850,00</td>
                    <td className="py-3"><span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs">Enviado</span></td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-3">#1236</td>
                    <td className="py-3">Ana Oliveira</td>
                    <td className="py-3">R$ 2.340,00</td>
                    <td className="py-3"><span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full text-xs">Pendente</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Revendedores ativos */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Revendedores ativos</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                  <span className="font-medium text-gray-700 dark:text-gray-300">MS</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Maria Silva</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">5 pedidos</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                  <span className="font-medium text-gray-700 dark:text-gray-300">JS</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">João Santos</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">3 pedidos</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                  <span className="font-medium text-gray-700 dark:text-gray-300">AO</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Ana Oliveira</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">2 pedidos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}