"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function SupplierDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Redireciona se não estiver autenticado ou não for fornecedor
    if (!user) {
      router.push("/login?type=fornecedor");
    } else if (user.type !== "fornecedor") {
      router.push("/");
    }
  }, [user, router]);

  if (!user || user.type !== "fornecedor") {
    return null;
  }

  return (
    <div style={{ 
      maxWidth: "1200px", 
      margin: "0 auto", 
      padding: "20px",
      fontFamily: "Arial, sans-serif"
    }}>
      <header style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "20px" 
      }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: "0" }}>PulseHub</h1>
        </div>
        <nav>
          <Link href="/" style={{ marginRight: "15px", textDecoration: "none", color: "#2563eb" }}>
            Início
          </Link>
          <button 
            onClick={() => router.push("/login")}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Sair
          </button>
        </nav>
      </header>

      <main>
        <div style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "10px" }}>Dashboard</h2>
          <p style={{ color: "#666" }}>Bem-vindo ao seu painel de controle</p>
        </div>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", 
          gap: "20px",
          marginBottom: "30px"
        }}>
          {/* Card Produtos */}
          <div style={{ 
            backgroundColor: "white", 
            padding: "20px", 
            borderRadius: "8px", 
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            border: "1px solid #eee"
          }}>
            <h3 style={{ fontSize: "18px", marginBottom: "10px", color: "#666" }}>Produtos</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>24</p>
          </div>

          {/* Card Revendedores */}
          <div style={{ 
            backgroundColor: "white", 
            padding: "20px", 
            borderRadius: "8px", 
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            border: "1px solid #eee"
          }}>
            <h3 style={{ fontSize: "18px", marginBottom: "10px", color: "#666" }}>Revendedores</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>12</p>
          </div>

          {/* Card Pedidos */}
          <div style={{ 
            backgroundColor: "white", 
            padding: "20px", 
            borderRadius: "8px", 
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            border: "1px solid #eee"
          }}>
            <h3 style={{ fontSize: "18px", marginBottom: "10px", color: "#666" }}>Pedidos</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>8</p>
          </div>

          {/* Card Vendas */}
          <div style={{ 
            backgroundColor: "white", 
            padding: "20px", 
            borderRadius: "8px", 
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            border: "1px solid #eee"
          }}>
            <h3 style={{ fontSize: "18px", marginBottom: "10px", color: "#666" }}>Vendas</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>R$ 5.240</p>
          </div>
        </div>

        <div style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "15px" }}>Pedidos recentes</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #eee" }}>
                  <th style={{ textAlign: "left", padding: "10px", color: "#666" }}>ID</th>
                  <th style={{ textAlign: "left", padding: "10px", color: "#666" }}>Revendedor</th>
                  <th style={{ textAlign: "left", padding: "10px", color: "#666" }}>Valor</th>
                  <th style={{ textAlign: "left", padding: "10px", color: "#666" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "10px" }}>#1234</td>
                  <td style={{ padding: "10px" }}>Maria Silva</td>
                  <td style={{ padding: "10px" }}>R$ 1.200,00</td>
                  <td style={{ padding: "10px" }}>
                    <span style={{ 
                      backgroundColor: "#d1fae5", 
                      color: "#065f46", 
                      padding: "4px 8px", 
                      borderRadius: "4px", 
                      fontSize: "12px" 
                    }}>
                      Entregue
                    </span>
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "10px" }}>#1235</td>
                  <td style={{ padding: "10px" }}>João Santos</td>
                  <td style={{ padding: "10px" }}>R$ 850,00</td>
                  <td style={{ padding: "10px" }}>
                    <span style={{ 
                      backgroundColor: "#dbeafe", 
                      color: "#1e40af", 
                      padding: "4px 8px", 
                      borderRadius: "4px", 
                      fontSize: "12px" 
                    }}>
                      Enviado
                    </span>
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "10px" }}>#1236</td>
                  <td style={{ padding: "10px" }}>Ana Oliveira</td>
                  <td style={{ padding: "10px" }}>R$ 2.340,00</td>
                  <td style={{ padding: "10px" }}>
                    <span style={{ 
                      backgroundColor: "#fef3c7", 
                      color: "#92400e", 
                      padding: "4px 8px", 
                      borderRadius: "4px", 
                      fontSize: "12px" 
                    }}>
                      Pendente
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}