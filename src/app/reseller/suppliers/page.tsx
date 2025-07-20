'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNextAuth } from "@/hooks/useNextAuth";
import MainLayout from "@/layouts/MainLayout";
import { FiSearch, FiMail, FiCheck, FiX, FiPercent, FiShoppingBag } from "react-icons/fi";
import { useToast } from "@/contexts/ToastContext";
import Link from "next/link";
import ImageFallback from "@/components/ImageFallback";

// Interface para o fornecedor
interface Fornecedor {
    id: string;
    name?: string;
    email?: string;
    type: "fornecedor";
    status?: "pending" | "approved" | "rejected";
    commission?: number;
    createdAt?: Date;
    relationId?: string;
}

export default function SuppliersPage() {
    const router = useRouter();
    const { user } = useNextAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        // Redireciona se não estiver autenticado ou não for revendedor
        if (!user) {
            router.push("/login");
        } else if (user.type !== "revendedor") {
            router.push("/");
        } else {
            fetchFornecedores();
        }
    }, [user, router]);

    const fetchFornecedores = async () => {
        setIsLoading(true);
        try {
            // Buscar relacionamentos do revendedor
            const response = await fetch(`/api/supplier-reseller-relations?resellerId=${user?.id}`);
            if (!response.ok) throw new Error('Falha ao buscar fornecedores');

            const relations = await response.json();

            // Transformar os dados para o formato esperado
            const fornecedoresList = relations.map((relation: any) => ({
                id: relation.supplier.id,
                name: relation.supplier.name,
                email: relation.supplier.email,
                type: relation.supplier.type,
                status: relation.status,
                commission: relation.commission,
                createdAt: new Date(relation.createdAt),
                relationId: relation.id
            }));

            setFornecedores(fornecedoresList);
        } catch (error) {
            console.error(error);
            addToast("Ocorreu um erro ao buscar os fornecedores.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // Filtra fornecedores com base no termo de busca e status
    const filteredFornecedores = fornecedores.filter(fornecedor => {
        const matchesSearch =
            (fornecedor.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
            (fornecedor.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

        const matchesStatus = statusFilter === "all" || fornecedor.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleApproveInvitation = async (fornecedorId: string) => {
        try {
            // Encontrar o relacionamento
            const fornecedor = fornecedores.find(f => f.id === fornecedorId);
            if (!fornecedor || !fornecedor.relationId) return;

            const response = await fetch(`/api/supplier-reseller-relations/${fornecedor.relationId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'approved'
                })
            });

            if (!response.ok) throw new Error('Falha ao aceitar convite');

            // Atualiza a lista de fornecedores
            setFornecedores(prev =>
                prev.map(f =>
                    f.id === fornecedorId
                        ? { ...f, status: "approved" }
                        : f
                )
            );
            addToast("Convite aceito com sucesso!", "success");
        } catch (error) {
            console.error(error);
            addToast("Erro ao aceitar convite.", "error");
        }
    };

    const handleRejectInvitation = async (fornecedorId: string) => {
        try {
            // Encontrar o relacionamento
            const fornecedor = fornecedores.find(f => f.id === fornecedorId);
            if (!fornecedor || !fornecedor.relationId) return;

            const response = await fetch(`/api/supplier-reseller-relations/${fornecedor.relationId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'rejected'
                })
            });

            if (!response.ok) throw new Error('Falha ao rejeitar convite');

            // Atualiza a lista de fornecedores
            setFornecedores(prev =>
                prev.map(f =>
                    f.id === fornecedorId
                        ? { ...f, status: "rejected" }
                        : f
                )
            );
            addToast("Convite rejeitado com sucesso!", "info");
        } catch (error) {
            console.error(error);
            addToast("Erro ao rejeitar convite.", "error");
        }
    };

    const handleSendEmail = (email?: string) => {
        if (!email) {
            addToast("Email não disponível.", "error");
            return;
        }

        // Abrir cliente de email padrão
        const subject = encodeURIComponent("Contato - Parceria de Revenda");
        const body = encodeURIComponent(`Olá,\n\nEspero que esteja bem!\n\nGostaria de entrar em contato sobre nossa parceria de revenda.\n\nAtenciosamente,\n${user?.name || 'Revendedor'}`);

        window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
        addToast("Cliente de email aberto!", "info");
    };

    const handleRemoveRejected = async (fornecedorId: string) => {
        const fornecedor = fornecedores.find(f => f.id === fornecedorId);

        if (!confirm(`Tem certeza que deseja remover ${fornecedor?.name} da sua listagem? Isso permitirá que ele te convide novamente no futuro.`)) {
            return;
        }

        try {
            if (!fornecedor || !fornecedor.relationId) return;

            const response = await fetch(`/api/supplier-reseller-relations/${fornecedor.relationId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Falha ao remover fornecedor rejeitado');

            // Remove o fornecedor da lista
            setFornecedores(prev => prev.filter(f => f.id !== fornecedorId));
            addToast(`${fornecedor.name} foi removido da listagem.`, "success");
        } catch (error) {
            console.error(error);
            addToast("Erro ao remover fornecedor rejeitado.", "error");
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

    if (!user || user.type !== "revendedor") {
        return null;
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Meus Fornecedores</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Gerencie seus vínculos com fornecedores
                        </p>
                    </div>
                </div>

                {/* Filtros e busca */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar fornecedores..."
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

                {/* Lista de fornecedores */}
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
                                        Data de Vínculo
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                            Carregando...
                                        </td>
                                    </tr>
                                ) : filteredFornecedores.length > 0 ? (
                                    filteredFornecedores.map((fornecedor) => (
                                        <tr key={fornecedor.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                                            {fornecedor.name?.charAt(0).toUpperCase() || "?"}
                                                        </span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {fornecedor.name || "Sem nome"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{fornecedor.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(fornecedor.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        {fornecedor.commission !== undefined ? `${fornecedor.commission}%` : 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {fornecedor.createdAt?.toLocaleDateString() || "N/A"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    {fornecedor.status === "pending" ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleApproveInvitation(fornecedor.id)}
                                                                className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30"
                                                                title="Aceitar Convite"
                                                            >
                                                                <FiCheck size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectInvitation(fornecedor.id)}
                                                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                                                                title="Rejeitar Convite"
                                                            >
                                                                <FiX size={18} />
                                                            </button>
                                                        </>
                                                    ) : fornecedor.status === "approved" ? (
                                                        <>
                                                            <Link
                                                                href={`/reseller/products?supplierId=${fornecedor.id}`}
                                                                className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                                                title="Ver Produtos"
                                                            >
                                                                <FiShoppingBag size={18} />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleSendEmail(fornecedor.email)}
                                                                className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                                                title="Enviar Email"
                                                            >
                                                                <FiMail size={18} />
                                                            </button>
                                                        </>
                                                    ) : fornecedor.status === "rejected" ? (
                                                        <button
                                                            onClick={() => handleRemoveRejected(fornecedor.id)}
                                                            className="text-orange-500 hover:text-orange-700 p-1 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/30"
                                                            title="Remover da Listagem"
                                                        >
                                                            <FiX size={18} />
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
                                            {statusFilter !== "all"
                                                ? `Nenhum fornecedor com status "${statusFilter}" encontrado`
                                                : "Você ainda não tem fornecedores vinculados"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Informações sobre fornecedores */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Sobre os Fornecedores</h2>
                    <div className="space-y-4 text-gray-600 dark:text-gray-400">
                        <p>
                            <strong>Como funciona?</strong> Os fornecedores te convidam para revender seus produtos. Você pode aceitar ou rejeitar os convites.
                        </p>
                        <p>
                            <strong>Comissões:</strong> Cada fornecedor define a comissão que você receberá pelas vendas dos produtos dele.
                        </p>
                        <p>
                            <strong>Produtos:</strong> Após aceitar um convite, você terá acesso aos produtos do fornecedor para revender.
                        </p>
                        <p>
                            <strong>Múltiplos Fornecedores:</strong> Você pode trabalhar com vários fornecedores simultaneamente, cada um com suas próprias condições.
                        </p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}