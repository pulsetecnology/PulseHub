
"use client";

import { useCart } from "@/contexts/CartContext";
import MainLayout from "@/layouts/MainLayout";
import { FiArrowLeft, FiLock } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";

export default function CheckoutPage() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const { addToast } = useToast();

  if (cartItems.length === 0) {
    router.push("/reseller/cart");
    return null;
  }

  const handleConfirmOrder = () => {
    // Lógica para criar o pedido (simulado)
    console.log("Pedido confirmado:", { cartItems, totalPrice });
    addToast("Pedido confirmado com sucesso!", "success");
    clearCart();
    router.push("/reseller/orders"); // Redireciona para a página de histórico de pedidos
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center mb-6">
          <Link href="/reseller/cart" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <FiArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Finalizar Pedido</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Resumo do Pedido */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Resumo do Pedido</h2>
            <div className="space-y-3">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <img src={item.imageUrls?.[0]} alt={item.name} className="w-12 h-12 object-cover rounded-md mr-3" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                    </div>
                  </div>
                  <p>{(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span>A calcular</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Total</span>
                  <span>{totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
            </div>
          </div>

          {/* Informações de Entrega e Pagamento */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Detalhes da Entrega</h2>
            <form className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Endereço</label>
                    <input type="text" defaultValue="Rua Exemplo, 123" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Observações</label>
                    <textarea rows={3} placeholder="Alguma instrução especial para a entrega?" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"></textarea>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold">Pagamento</h3>
                    <p className="text-sm text-gray-500">O pagamento será combinado diretamente com o fornecedor após a confirmação do pedido.</p>
                </div>
            </form>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
            <button 
                onClick={handleConfirmOrder}
                className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center"
              >
                <FiLock className="mr-2"/>
                Confirmar Pedido
              </button>
        </div>
      </div>
    </MainLayout>
  );
}
