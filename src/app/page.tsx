"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Redireciona usuários já autenticados para seus respectivos dashboards
    if (user) {
      if (user.type === "fornecedor") {
        router.push("/supplier/dashboard");
      } else {
        router.push("/reseller/dashboard");
      }
    }
  }, [user, router]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      backgroundColor: "#f9fafb",
      fontFamily: "Arial, sans-serif"
    }}>
      {/* Logo */}
      <div style={{ marginBottom: "40px", fontWeight: "bold", fontSize: "32px" }}>
        <span style={{ color: "#2563eb" }}>Pulse</span>
        <span style={{ color: "#10b981" }}>Hub</span>
      </div>

      {/* Título */}
      <h1 style={{ 
        fontSize: "36px", 
        fontWeight: "bold", 
        marginBottom: "16px", 
        color: "#1f2937",
        textAlign: "center"
      }}>
        Bem-vindo ao SPECS
      </h1>
      <p style={{ 
        fontSize: "18px", 
        marginBottom: "40px", 
        color: "#4b5563",
        textAlign: "center"
      }}>
        Sistema de Representantes e Fornecedores
      </p>

      {/* Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "24px",
        maxWidth: "800px",
        width: "100%"
      }}>
        {/* Card Fornecedor */}
        <div style={{
          backgroundColor: "white",
          padding: "32px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb",
          textAlign: "center"
        }}>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px", color: "#1f2937" }}>Fornecedor</h2>
          <p style={{ color: "#4b5563", marginBottom: "24px" }}>
            Gerencie seus produtos, revendedores e acompanhe pedidos.
          </p>
          <button 
            onClick={() => router.push("/login?type=fornecedor")}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
              width: "100%"
            }}
          >
            Entrar como Fornecedor
          </button>
        </div>

        {/* Card Revendedor */}
        <div style={{
          backgroundColor: "white",
          padding: "32px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb",
          textAlign: "center"
        }}>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px", color: "#1f2937" }}>Revendedor</h2>
          <p style={{ color: "#4b5563", marginBottom: "24px" }}>
            Acesse catálogos, solicite orçamentos e faça pedidos.
          </p>
          <button 
            onClick={() => router.push("/login?type=revendedor")}
            style={{
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
              width: "100%"
            }}
          >
            Entrar como Revendedor
          </button>
        </div>
      </div>
    </div>
  );
}