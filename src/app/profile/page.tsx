"use client";

import RouteGuard from "@/components/auth/RouteGuard";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/contexts/ToastContext";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(session?.user?.name || "");
  const { addToast } = useToast();

  // Função simulada para salvar o perfil
  const handleSaveProfile = () => {
    // Aqui seria implementada a lógica para salvar o perfil
    // Por enquanto, apenas simulamos o sucesso
    setTimeout(() => {
      setIsEditing(false);
      addToast("Perfil atualizado com sucesso!", "success");
    }, 500);
  };

  return (
    <RouteGuard>
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
          
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-green-400 flex items-center justify-center text-white text-3xl font-bold">
                {session?.user?.name?.charAt(0) || "U"}
              </div>
              <div className="ml-6">
                <h2 className="text-xl font-semibold">{session?.user?.name}</h2>
                <p className="text-gray-600">{session?.user?.email}</p>
                <span className="inline-block px-3 py-1 mt-2 text-sm rounded-full bg-blue-100 text-blue-800">
                  {session?.user?.type === "fornecedor" ? "Fornecedor" : "Revendedor"}
                </span>
              </div>
            </div>
          </div>
          
          {isEditing ? (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Editar Perfil</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={session?.user?.email || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Salvar Alterações
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full sm:w-auto"
              >
                Editar Perfil
              </button>
              
              <Link
                href={session?.user?.type === "fornecedor" ? "/supplier/dashboard" : "/reseller/dashboard"}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-center w-full sm:w-auto"
              >
                Voltar para o Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </RouteGuard>
  );
}