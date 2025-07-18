"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TestPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      <h1 className="text-2xl font-bold mb-4">Página de Teste</h1>
      <p className="mb-4">Esta é uma página de teste para verificar se o roteamento está funcionando corretamente.</p>
      
      <div className="flex flex-col gap-4">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => router.push("/")}
        >
          Voltar para a página inicial (usando router.push)
        </button>
        
        <Link href="/" className="px-4 py-2 bg-green-500 text-white rounded text-center">
          Voltar para a página inicial (usando Link)
        </Link>
        
        <a href="/" className="px-4 py-2 bg-red-500 text-white rounded text-center">
          Voltar para a página inicial (usando tag a)
        </a>
      </div>
    </div>
  );
}