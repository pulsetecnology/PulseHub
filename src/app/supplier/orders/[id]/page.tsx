"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "@/layouts/MainLayout";
import { FiArrowLeft, FiUser, FiMapPin, FiPhone, FiDollarSign, FiPackage, FiDownload } from "react-icons/fi";
import Link from "next/link";
import { useToast } from "@/contexts/ToastContext";

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

interface ResellerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Order {
  id: string;
  reseller: ResellerInfo;
  date: string;
  total: number;
  status: string;
  items: OrderItem[];
  invoiceUrl: string | null;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // In a real application, fetch order details from your API
        // For now, we'll use a mock to simulate fetching
        const fetchedOrder: Order = {
          id: orderId,
          reseller: {
            name: "Ana Oliveira",
            email: "ana.oliveira@example.com",
            phone: "(11) 98765-4321",
            address: "Rua das Flores, 456, São Paulo, SP"
          },
          date: "2024-07-16",
          total: 2340.00,
          status: "Pendente",
          items: [
            { id: 1, name: "Camiseta Básica", quantity: 20, price: 49.90, imageUrl: "https://via.placeholder.com/150?text=Camiseta" },
            { id: 2, name: "Calça Jeans", quantity: 10, price: 129.90, imageUrl: "https://via.placeholder.com/150?text=Calça" },
            { id: 5, name: "Camisa Social", quantity: 5, price: 89.90, imageUrl: "https://via.placeholder.com/150?text=Camisa" },
          ],
          invoiceUrl: null, // Simulate no invoice initially
        };
        setOrder(fetchedOrder);
        setNewStatus(fetchedOrder.status);
      } catch (error) {
        console.error("Error fetching order:", error);
        addToast("Erro ao carregar detalhes do pedido.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, addToast]);

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Falha ao atualizar o status do pedido.");
      }

      setOrder((prev) => prev ? { ...prev, status: newStatus } : null);
      addToast(`Status do pedido atualizado para ${newStatus}!`, "success");
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error);
      addToast(error.message || "Ocorreu um erro ao atualizar o status do pedido.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGenerateInvoice = async () => {
    setIsGeneratingInvoice(true);
    try {
      // In a real application, you would call an API to generate the invoice
      // For now, we'll simulate a successful generation and provide a mock URL
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockInvoiceUrl = `https://example.com/invoice/${orderId}-${Date.now()}.pdf`;
      setOrder((prev) => prev ? { ...prev, invoiceUrl: mockInvoiceUrl } : null);
      addToast("Nota fiscal gerada com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao gerar nota fiscal:", error);
      addToast("Ocorreu um erro ao gerar a nota fiscal.", "error");
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Entregue":
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{status}</span>;
      case "Enviado":
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{status}</span>;
      case "Pendente":
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">{status}</span>;
      case "Cancelado":
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">{status}</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <p>Carregando...</p>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <p>Pedido não encontrado.</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center mb-6">
          <Link href="/supplier/orders" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <FiArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Detalhes do Pedido {order.id}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Itens do Pedido */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center"><FiPackage className="mr-2"/> Itens do Pedido</h2>
              <div className="space-y-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold">{(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total do Pedido */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center"><FiDollarSign className="mr-2"/> Total do Pedido</h2>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Frete</span>
                        <span>R$ 0,00</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span>Total</span>
                        <span>{order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                </div>
            </div>
          </div>

          {/* Informações do Revendedor e Ações */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center"><FiUser className="mr-2"/> Informações do Revendedor</h2>
              <div className="space-y-3">
                <p className="font-medium">{order.reseller.name}</p>
                <p className="text-sm text-gray-500">{order.reseller.email}</p>
                <p className="text-sm text-gray-500 flex items-center"><FiPhone className="mr-2"/> {order.reseller.phone}</p>
                <p className="text-sm text-gray-500 flex items-center"><FiMapPin className="mr-2"/> {order.reseller.address}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Status do Pedido</h2>
              <div className="flex items-center justify-between mb-4">
                <p>Status atual:</p>
                {getStatusBadge(order.status)}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Atualizar Status</label>
                <select 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                >
                    <option>Pendente</option>
                    <option>Enviado</option>
                    <option>Entregue</option>
                    <option>Cancelado</option>
                </select>
                <button 
                    onClick={handleUpdateStatus}
                    disabled={isUpdating}
                    className="w-full mt-4 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary-hover disabled:opacity-50"
                >
                    {isUpdating ? 'Atualizando...' : 'Atualizar'}
                </button>
              </div>
            </div>

            {/* Geração de Nota Fiscal */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Nota Fiscal</h2>
              {order.invoiceUrl ? (
                <a 
                  href={order.invoiceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 flex items-center justify-center"
                >
                  <FiDownload className="mr-2" /> Baixar Nota Fiscal
                </a>
              ) : (
                <button 
                  onClick={handleGenerateInvoice}
                  disabled={isGeneratingInvoice}
                  className="w-full bg-purple-500 text-white py-2 rounded-lg font-semibold hover:bg-purple-600 disabled:opacity-50"
                >
                  {isGeneratingInvoice ? 'Gerando...' : 'Gerar Nota Fiscal'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}