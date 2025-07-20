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
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    // Redireciona se não estiver autenticado ou não for fornecedor
    if (!user) {
      router.push("/login");
    } else if (user.type !== "fornecedor") {
      router.push("/");
    } else {
      fetchRevendedores();
    }
  }, [user, router]);

  const fetchRevendedores = async () => {
    setIsLoading(true);
    try {
      // Buscar relacionamentos do fornecedor
      const response = await fetch(`/api/supplier-reseller-relations?supplierId=${user?.id}`);
      if (!response.ok) throw new Error('Falha ao buscar revendedores');
      
      const relations = await response.json();
      
      // Transformar os dados para o formato esperado
      const revendedoresList = relations.map((relation: any) => ({
        id: relation.reseller.id,
        name: relation.reseller.name,
        email: relation.reseller.email,
        type: relation.reseller.type,
        status: relation.status,
        commission: relation.commission,
        createdAt: new Date(relation.createdAt),
        relationId: relation.id
      }));
      
      setRevendedores(revendedoresList);
    } catch (error) {
      console.error(error);
      addToast("Ocorreu um erro ao buscar os revendedores.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtra revendedores com base no termo de busca e status
  const filteredRevendedores = revendedores.filter(revendedor => {
    const matchesSearch = 
      (revendedor.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (revendedor.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === "all" || revendedor.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [availableResellers, setAvailableResellers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteCommission, setInviteCommission] = useState(10);

  const handleAddRevendedor = () => {
    setShowInviteModal(true);
    fetchAvailableResellers();
  };

  const fetchAvailableResellers = async () => {
    try {
      // Buscar revendedores que não têm relacionamento com este fornecedor
      const response = await fetch(`/api/users?type=revendedor`);
      if (!response.ok) throw new Error('Falha ao buscar revendedores');
      
      const allResellers = await response.json();
      
      // Filtrar revendedores que já não estão vinculados a este fornecedor
      const currentResellerIds = revendedores.map(r => r.id);
      const available = allResellers.filter((reseller: any) => 
        !currentResellerIds.includes(reseller.id)
      );
      
      setAvailableResellers(available);
    } catch (error) {
      console.error(error);
      addToast("Erro ao buscar revendedores disponíveis.", "error");
    }
  };

  const handleInviteReseller = async (resellerId: string) => {
    try {
      const response = await fetch('/api/supplier-reseller-relations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: user?.id,
          resellerId: resellerId,
          status: 'pending',
          commission: inviteCommission
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao convidar revendedor');
      }

      addToast('Convite enviado com sucesso!', 'success');
      setShowInviteModal(false);
      fetchRevendedores(); // Atualizar lista
    } catch (error: any) {
      console.error(error);
      addToast(error.message || 'Erro ao enviar convite.', 'error');
    }
  };

  const handleInviteByEmail = async () => {
    if (!inviteEmail.trim()) {
      addToast('Por favor, digite um email válido.', 'error');
      return;
    }

    try {
      // Primeiro, verificar se existe um usuário com este email
      const usersResponse = await fetch(`/api/users?type=revendedor`);
      if (!usersResponse.ok) throw new Error('Falha ao buscar usuários');
      
      const allUsers = await usersResponse.json();
      const existingUser = allUsers.find((u: any) => u.email === inviteEmail);

      if (existingUser) {
        // Se o usuário existe, criar relacionamento
        await handleInviteReseller(existingUser.id);
      } else {
        // Se não existe, mostrar mensagem para o usuário se cadastrar
        addToast('Usuário não encontrado. O revendedor deve se cadastrar primeiro em /register', 'info');
      }
    } catch (error: any) {
      console.error(error);
      addToast(error.message || 'Erro ao processar convite.', 'error');
    }
  };

  const handleApproveReseller = async (resellerId: string) => {
    try {
      // Encontrar o relacionamento
      const revendedor = revendedores.find(r => r.id === resellerId);
      if (!revendedor || !revendedor.relationId) return;

      const response = await fetch(`/api/supplier-reseller-relations/${revendedor.relationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved'
        })
      });

      if (!response.ok) throw new Error('Falha ao aprovar revendedor');

      // Atualiza a lista de revendedores
      setRevendedores(prev => 
        prev.map(r => 
          r.id === resellerId 
            ? { ...r, status: "approved" } 
            : r
        )
      );
      addToast("Revendedor aprovado com sucesso!", "success");
    } catch (error) {
      console.error(error);
      addToast("Erro ao aprovar revendedor.", "error");
    }
  };

  const handleRejectReseller = async (resellerId: string) => {
    try {
      // Encontrar o relacionamento
      const revendedor = revendedores.find(r => r.id === resellerId);
      if (!revendedor || !revendedor.relationId) return;

      const response = await fetch(`/api/supplier-reseller-relations/${revendedor.relationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected'
        })
      });

      if (!response.ok) throw new Error('Falha ao rejeitar revendedor');

      // Atualiza a lista de revendedores
      setRevendedores(prev => 
        prev.map(r => 
          r.id === resellerId 
            ? { ...r, status: "rejected" } 
            : r
        )
      );
      addToast("Revendedor rejeitado com sucesso!", "info");
    } catch (error) {
      console.error(error);
      addToast("Erro ao rejeitar revendedor.", "error");
    }
  };

  const handleUpdateCommission = async (resellerId: string) => {
    if (!editingCommission) return;
    
    try {
      // Encontrar o relacionamento
      const revendedor = revendedores.find(r => r.id === resellerId);
      if (!revendedor || !revendedor.relationId) return;

      const response = await fetch(`/api/supplier-reseller-relations/${revendedor.relationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commission: editingCommission.value
        })
      });

      if (!response.ok) throw new Error('Falha ao atualizar comissão');

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
    } catch (error) {
      console.error(error);
      addToast("Erro ao atualizar comissão.", "error");
    }
  };

  const handleSendEmail = (email?: string) => {
    if (!email) {
      addToast("Email não disponível.", "error");
      return;
    }
    
    // Abrir cliente de email padrão
    const subject = encodeURIComponent("Contato - Parceria de Revenda");
    const body = encodeURIComponent(`Olá,\n\nEspero que esteja bem!\n\nGostaria de entrar em contato sobre nossa parceria de revenda.\n\nAtenciosamente,\n${user?.name || 'Fornecedor'}`);
    
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
    addToast("Cliente de email aberto!", "info");
  };

  const handleUnlinkReseller = async (resellerId: string) => {
    const revendedor = revendedores.find(r => r.id === resellerId);
    
    if (!confirm(`Tem certeza que deseja desvincular ${revendedor?.name}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      if (!revendedor || !revendedor.relationId) return;

      const response = await fetch(`/api/supplier-reseller-relations/${revendedor.relationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Falha ao desvincular revendedor');

      // Remove o revendedor da lista
      setRevendedores(prev => prev.filter(r => r.id !== resellerId));
      addToast(`${revendedor.name} foi desvinculado com sucesso.`, "success");
    } catch (error) {
      console.error(error);
      addToast("Erro ao desvincular revendedor.", "error");
    }
  };

  const handleRemoveRejected = async (resellerId: string) => {
    const revendedor = revendedores.find(r => r.id === resellerId);
    
    if (!confirm(`Tem certeza que deseja remover ${revendedor?.name} da sua listagem? Isso permitirá convidá-lo novamente no futuro.`)) {
      return;
    }

    try {
      if (!revendedor || !revendedor.relationId) return;

      const response = await fetch(`/api/supplier-reseller-relations/${revendedor.relationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Falha ao remover revendedor rejeitado');

      // Remove o revendedor da lista
      setRevendedores(prev => prev.filter(r => r.id !== resellerId));
      addToast(`${revendedor.name} foi removido da listagem. Você pode convidá-lo novamente quando desejar.`, "success");
    } catch (error) {
      console.error(error);
      addToast("Erro ao remover revendedor rejeitado.", "error");
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
            Convidar Revendedor
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
                                title="Aprovar Vínculo"
                              >
                                <FiCheck size={18} />
                              </button>
                              <button
                                onClick={() => handleRejectReseller(revendedor.id)}
                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                                title="Rejeitar Vínculo"
                              >
                                <FiX size={18} />
                              </button>
                            </>
                          ) : revendedor.status === "approved" ? (
                            <>
                              <button
                                onClick={() => handleSendEmail(revendedor.email)}
                                className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                title="Enviar Email"
                              >
                                <FiMail size={18} />
                              </button>
                              <button
                                onClick={() => handleUnlinkReseller(revendedor.id)}
                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                                title="Desvincular Revendedor"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </>
                          ) : revendedor.status === "rejected" ? (
                            <button
                              onClick={() => handleRemoveRejected(revendedor.id)}
                              className="text-orange-500 hover:text-orange-700 p-1 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/30"
                              title="Remover da Listagem (permite convidar novamente)"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
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

        {/* Modal de Convite para Revendedores */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Convidar Revendedor</h3>
              
              {/* Buscar por email */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Convidar por Email</h4>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={inviteCommission}
                    onChange={(e) => setInviteCommission(Number(e.target.value))}
                    className="w-20 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-center"
                    placeholder="10"
                  />
                  <span className="flex items-center text-gray-500 dark:text-gray-400">%</span>
                  <button
                    onClick={handleInviteByEmail}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover"
                  >
                    Convidar
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  O revendedor deve estar cadastrado no sistema. Se não estiver, ele receberá uma mensagem para se cadastrar primeiro.
                </p>
              </div>

              {/* Lista de revendedores disponíveis */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Revendedores Disponíveis ({availableResellers.length})
                </h4>
                {availableResellers.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md">
                    {availableResellers.map((reseller) => (
                      <div key={reseller.id} className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{reseller.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{reseller.email}</div>
                        </div>
                        <button
                          onClick={() => handleInviteReseller(reseller.id)}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                        >
                          Convidar
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Não há revendedores disponíveis para convite. Todos os revendedores cadastrados já estão vinculados a você.
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Informações sobre revendedores */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Sobre os Revendedores</h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <p>
              <strong>Nova Arquitetura:</strong> Agora os revendedores se cadastram diretamente no sistema via /register. Você os convida e gerencia os relacionamentos aqui.
            </p>
            <p>
              <strong>Como funciona?</strong> 1) Revendedor se cadastra em /register, 2) Você o convida aqui, 3) Você aprova/rejeita e define comissões.
            </p>
            <p>
              <strong>Relacionamento N:N:</strong> Um revendedor pode trabalhar com vários fornecedores, e você pode ter vários revendedores, cada um com sua comissão específica.
            </p>
            <p>
              <strong>Comissões:</strong> Defina comissões personalizadas para cada revendedor. A comissão padrão é 10%, mas você pode ajustar conforme necessário.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}