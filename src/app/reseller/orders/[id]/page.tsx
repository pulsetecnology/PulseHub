"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "@/layouts/MainLayout";
import { FiArrowLeft, FiUser, FiMapPin, FiPhone, FiDollarSign, FiPackage } from "react-icons/fi";
import Link from "next/link";
import { useToast } from "@/contexts/ToastContext";

const mockOrder = {
  id: "#1236",
  supplier: {
    name: "Fornecedor Teste",
    email: "fornecedor@example.com",
    phone: "(11) 99887-7665",
    address: "Av. Principal, 789, Rio de Janeiro, RJ"
  },
  date: "2024-07-16",
  total: 2340.00,
  status: "Pendente",
  items: [
    { id: 1, name: "Camiseta Básica", quantity: 20, price: 49.90, imageUrl: "https://via.placeholder.com/150?text=Camiseta" },
    { id: 2, name: "Calça Jeans", quantity: 10, price: 129.90, imageUrl: "https://via.placeholder.com/150?text=Calça" },
    { id: 5, name: "Camisa Social", quantity: 5, price: 89.90, imageUrl: "https://via.placeholder.com/150?text=Camisa" },
  ]
};

export default function ResellerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(mockOrder);
  const { addToast } = useToast();

  // Simulação de busca de pedido
  useEffect(() => {
    // Em um ambiente real, buscaria o pedido pelo ID
    // const fetchedOrder = fetch(`/api/orders/${params.id}`);
    // setOrder(fetchedOrder);
  }, [params.id]);

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

  return (
    <MainLayout>
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center mb-6">
          <Link href="/reseller/orders" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
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

          {/* Informações do Fornecedor e Ações */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center"><FiUser className="mr-2"/> Informações do Fornecedor</h2>
              <div className="space-y-3">
                <p className="font-medium">{order.supplier.name}</p>
                <p className="text-sm text-gray-500">{order.supplier.email}</p>
                <p className="text-sm text-gray-500 flex items-center"><FiPhone className="mr-2"/> {order.supplier.phone}</p>
                <p className="text-sm text-gray-500 flex items-center"><FiMapPin className="mr-2"/> {order.supplier.address}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Status do Pedido</h2>
              <div className="flex items-center justify-between mb-4">
                <p>Status atual:</p>
                {getStatusBadge(order.status)}
              </div>
              <button 
                onClick={() => addToast("Funcionalidade de contato com fornecedor em desenvolvimento!", "info")}
                className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600"
              >
                Entrar em Contato com Fornecedor
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}