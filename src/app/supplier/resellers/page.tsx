"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNextAuth } from "@/hooks/useNextAuth";
import MainLayout from "@/layouts/MainLayout";
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiMail, FiCheck, FiX, FiPercent } from "react-icons/fi";
import { users, getSupplierResellers, approveReseller } from "@/lib/auth-utils";
import Link from "next/link";
import { useToast } from "@/contexts/ToastContext";

// Interface para o revendedor
interface Revendedor {
  id: string;
  name?: string;
  email?: string;
  type: "revendedor";
  status?: "pending" | "approved" | "rejected";
  commission?: number;
  createdAt?: Date;
}

export default function ResellerManagement() {
  const router = useRouter();
  const { user } = useNextAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [revendedores, setRevendedores] = useState<Revendedor[]>([]);
  const [editingCommission, setEditingCommission] = useState<{id: string, value: number} | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const { addToast } = useToast();

  useEffect(() => {
    // Redireciona se não estiver autenticado ou não for fornecedor
    if (!user) {
      router.push("/login");
    } else if (user.type !== "fornecedor") {
      router.push("/");
    } else {
      // Carrega os revendedores deste fornecedor
      const revendedoresList = getSupplierResellers(user.id || "1"); // Fallback para o ID 1 (fornecedor teste)
      setRevendedores(revendedoresList);
    }
  }, [user, router]);

  // Filtra revendedores com base no termo de busca e status
  const filteredRevendedores = revendedores.filter(revendedor => {
    const matchesSearch = 
      (revendedor.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (revendedor.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === "all" || revendedor.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddRevendedor = () => {
    router.push("/supplier/resellers/add");
  };

  const handleApproveReseller = (resellerId: string) => {
    if (user?.id) {
      const commission = 10; // Comissão padrão de 10%
      approveReseller(user.id, resellerId, commission);
      
      // Atualiza a lista de revendedores
      setRevendedores(prev => 
        prev.map(r => 
          r.id === resellerId 
            ? { ...r, status: "approved", commission } 
            : r
        )
      );
      addToast("Revendedor aprovado com sucesso!", "success");
    }
  };

  const handleRejectReseller = (resellerId: string) => {
    // Implementação simulada de rejeição
    setRevendedores(prev => 
      prev.map(r => 
        r.id === resellerId 
          ? { ...r, status: "rejected" } 
          : r
      )
    );
    addToast("Revendedor rejeitado com sucesso!", "info");
  };

  const handleUpdateCommission = (resellerId: string) => {
    if (!editingCommission) return;
    
    // Atualiza a comissão do revendedor
    if (user?.id) {
      approveReseller(user.id, resellerId, editingCommission.value);
      
      // Atualiza a lista de revendedores
      setRevendedores(prev => 
        prev.map(r => 
          r.id === resellerId 
            ? { ...r, commission: editingCommission.value } 
            : r
        )
      );
      
      // Limpa o estado de edição
      setEditingCommission(null);
      addToast("Comissão atualizada com sucesso!", "success");
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
            Aprovado
          </span>
        );
      case "pending":
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
            Pendente
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
            Rejeitado
          </span>
        );
      default:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400">
            Desconhecido
          </span>
        );
    }
  };

  if (!user || user.type !== "fornecedor") {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Revendedores</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie seus revendedores e controle o acesso aos seus produtos
            </p>
          </div>
          <button
            onClick={handleAddRevendedor}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <FiPlus className="mr-2" />
            Adicionar Revendedor
          </button>
        </div>

        {/* Filtros e busca */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar revendedores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Todos os status</option>
            <option value="approved">Aprovados</option>
            <option value="pending">Pendentes</option>
            <option value="rejected">Rejeitados</option>
          </select>
        </div>

        {/* Lista de revendedores */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nome
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Comissão
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Data de Cadastro
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRevendedores.length > 0 ? (
                  filteredRevendedores.map((revendedor) => (
                    <tr key={revendedor.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {revendedor.name?.charAt(0).toUpperCase() || "?"}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {revendedor.name || "Sem nome"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{revendedor.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(revendedor.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingCommission && editingCommission.id === revendedor.id ? (
                          <div className="flex items-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={editingCommission.value}
                              onChange={(e) => setEditingCommission({
                                id: revendedor.id,
                                value: Number(e.target.value)
                              })}
                              className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                            />
                            <span className="ml-1 text-gray-500 dark:text-gray-400">%</span>
                            <button
                              onClick={() => handleUpdateCommission(revendedor.id)}
                              className="ml-2 text-green-500 hover:text-green-700"
                              title="Salvar"
                            >
                              <FiCheck size={16} />
                            </button>
                            <button
                              onClick={() => setEditingCommission(null)}
                              className="ml-1 text-red-500 hover:text-red-700"
                              title="Cancelar"
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {revendedor.commission !== undefined ? `${revendedor.commission}%` : 'N/A'}
                            </span>
                            {revendedor.status === "approved" && (
                              <button
                                onClick={() => setEditingCommission({
                                  id: revendedor.id,
                                  value: revendedor.commission || 10
                                })}
                                className="ml-2 text-blue-500 hover:text-blue-700"
                                title="Editar comissão"
                              >
                                <FiEdit size={16} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {revendedor.createdAt?.toLocaleDateString() || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {revendedor.status === "pending" ? (
                            <>
                              <button
                                onClick={() => handleApproveReseller(revendedor.id)}
                                className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30"
                                title="Aprovar"
                              >
                                <FiCheck size={18} />
                              </button>
                              <button
                                onClick={() => handleRejectReseller(revendedor.id)}
                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                                title="Rejeitar"
                              >
                                <FiX size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                title="Enviar email"
                              >
                                <FiMail size={18} />
                              </button>
                              <button
                                className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30"
                                title="Editar"
                              >
                                <FiEdit size={18} />
                              </button>
                              <button
                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                                title="Desativar"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      Nenhum revendedor encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Informações sobre revendedores */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Sobre os Revendedores</h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <p>
              <strong>O que são revendedores?</strong> Revendedores são parceiros que têm acesso ao seu catálogo de produtos e podem fazer pedidos para revenda.
            </p>
            <p>
              <strong>Como adicionar um revendedor?</strong> Clique no botão "Adicionar Revendedor" acima e preencha o formulário com os dados do revendedor. O sistema enviará um convite por email para que o revendedor complete seu cadastro.
            </p>
            <p>
              <strong>Como gerenciar revendedores?</strong> Você pode aprovar ou rejeitar solicitações de revendedores, definir comissões personalizadas, editar dados e desativar o acesso quando necessário.
            </p>
            <p>
              <strong>O que são comissões?</strong> As comissões definem a porcentagem que o revendedor ganha sobre as vendas dos seus produtos. Você pode personalizar a comissão para cada revendedor.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}