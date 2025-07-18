"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SimplePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      <h1 className="text-2xl font-bold mb-4">Página Simples</h1>
      <p className="mb-4">Esta é uma versão simplificada da página principal.</p>
      
      <div className="flex flex-col gap-4">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => router.push("/login?type=fornecedor")}
        >
          Entrar como Fornecedor (usando router.push)
        </button>
        
        <Link href="/login?type=revendedor" className="px-4 py-2 bg-green-500 text-white rounded text-center">
          Entrar como Revendedor (usando Link)
        </Link>
        
        <a href="/test" className="px-4 py-2 bg-red-500 text-white rounded text-center">
          Ir para a página de teste (usando tag a)
        </a>
      </div>
    </div>
  );
}