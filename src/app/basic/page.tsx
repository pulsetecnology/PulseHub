"use client";

import { useRouter } from "next/navigation";

export default function BasicPage() {
  const router = useRouter();

  // Função para navegar usando o router
  const navigateToLogin = (type: string) => {
    console.log(`Navegando para /login?type=${type}`);
    router.push(`/login?type=${type}`);
  };

  // Função para navegar usando window.location
  const navigateWithLocation = (type: string) => {
    console.log(`Navegando para /login?type=${type} usando window.location`);
    window.location.href = `/login?type=${type}`;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Teste de Navegação</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Usando router.push (Next.js)</h2>
        <button 
          onClick={() => navigateToLogin('fornecedor')}
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#2563eb', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px',
            marginTop: '10px'
          }}
        >
          Fornecedor (router.push)
        </button>
        
        <button 
          onClick={() => navigateToLogin('revendedor')}
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#10b981', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Revendedor (router.push)
        </button>
      </div>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Usando window.location (JavaScript puro)</h2>
        <button 
          onClick={() => navigateWithLocation('fornecedor')}
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#2563eb', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px',
            marginTop: '10px'
          }}
        >
          Fornecedor (window.location)
        </button>
        
        <button 
          onClick={() => navigateWithLocation('revendedor')}
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#10b981', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Revendedor (window.location)
        </button>
      </div>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Usando links HTML simples</h2>
        <a 
          href="/login?type=fornecedor"
          style={{ 
            display: 'inline-block',
            padding: '10px 15px', 
            backgroundColor: '#2563eb', 
            color: 'white', 
            textDecoration: 'none',
            borderRadius: '5px',
            marginRight: '10px',
            marginTop: '10px'
          }}
        >
          Fornecedor (link HTML)
        </a>
        
        <a 
          href="/login?type=revendedor"
          style={{ 
            display: 'inline-block',
            padding: '10px 15px', 
            backgroundColor: '#10b981', 
            color: 'white', 
            textDecoration: 'none',
            borderRadius: '5px',
            marginTop: '10px'
          }}
        >
          Revendedor (link HTML)
        </a>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <a href="/" style={{ color: '#2563eb', textDecoration: 'underline' }}>Voltar para a página principal</a>
      </div>
    </div>
  );
}