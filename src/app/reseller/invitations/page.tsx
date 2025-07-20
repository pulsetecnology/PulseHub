'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNextAuth } from "@/hooks/useNextAuth";
import MainLayout from "@/layouts/MainLayout";
import { FiCheck, FiX, FiClock } from "react-icons/fi";
import { useToast } from "@/contexts/ToastContext";

interface Invitation {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  commission: number;
  createdAt: Date;
  relationId: string;
}

export default function InvitationsPage() {
  const router = useRouter();
  const { user } = useNextAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    // Redireciona se não estiver autenticado ou não for revendedor
    if (!user) {
      router.push("/login");
    } else if (user.type !== "revendedor") {
      router.push("/");
    } else {
      fetchInvitations();
    }
  }, [user, router]);

  const fetchInvitations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/supplier-reseller-relations?resellerId=${user?.id}&status=pending`);
      if (!response.ok) throw new Error('Falha ao buscar convites');
      
      const relations = await response.json();
      
      const invitationsList = relations.map((relation: any) => ({
        id: relation.id,
        supplierId: relation.supplier.id,
        supplierName: relation.supplier.name,
        supplierEmail: relation.supplier.email,
        commission: relation.commission,
        createdAt: new Date(relation.createdAt),
        relationId: relation.id
      }));
      
      setInvitations(invitationsList);
    } catch (error) {
      console.error(error);
      addToast("Ocorreu um erro ao buscar os convites.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async (relationId: string) => {
    try {
      const response = await fetch(`/api/supplier-reseller-relations/${relationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved'
        })
      });

      if (!response.ok) throw new Error('Falha ao aceitar convite');

      // Remove o convite da lista
      setInvitations(prev => prev.filter(inv => inv.relationId !== relationId));
      addToast("Convite aceito com sucesso!", "success");
    } catch (error) {
      console.error(error);
      addToast("Erro ao aceitar convite.", "error");
    }
  };

  const handleRejectInvitation = async (relationId: string) => {
    try {
      const response = await fetch(`/api/supplier-reseller-relations/${relationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected'
        })
      });

      if (!response.ok) throw new Error('Falha ao rejeitar convite');

      // Remove o convite da lista
      setInvitations(prev => prev.filter(inv => inv.relationId !== relationId));
      addToast("Convite rejeitado.", "info");
    } catch (error) {
      console.error(error);
      addToast("Erro ao rejeitar convite.", "error");
    }
  };

  if (!user || user.type !== "revendedor") {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Convites de Fornecedores</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie os convites recebidos de fornecedores
          </p>
        </div>

        {isLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              Carregando convites...
            </div>
          </div>
        ) : invitations.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fornecedor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Comissão
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Data do Convite
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {invitations.map((invitation) => (
                    <tr key={invitation.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {invitation.supplierName?.charAt(0).toUpperCase() || "?"}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {invitation.supplierName || "Sem nome"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{invitation.supplierEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{invitation.commission}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <FiClock className="mr-1" />
                          {invitation.createdAt.toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleAcceptInvitation(invitation.relationId)}
                            className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30"
                            title="Aceitar Convite"
                          >
                            <FiCheck size={18} />
                          </button>
                          <button
                            onClick={() => handleRejectInvitation(invitation.relationId)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                            title="Rejeitar Convite"
                          >
                            <FiX size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              Você não tem convites pendentes de fornecedores.
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Quando um fornecedor te convidar para ser revendedor, o convite aparecerá aqui.
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Sobre os Convites</h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <p>
              <strong>Como funciona?</strong> Os fornecedores podem te convidar para revender seus produtos. Você pode aceitar ou rejeitar esses convites.
            </p>
            <p>
              <strong>Comissões:</strong> Cada fornecedor define a comissão que você receberá pelas vendas dos produtos dele.
            </p>
            <p>
              <strong>Após aceitar:</strong> Você terá acesso aos produtos do fornecedor para revender em sua loja.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}