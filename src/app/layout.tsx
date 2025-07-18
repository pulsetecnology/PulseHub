import { AuthProvider } from "@/contexts/AuthContext";
import { ReactNode } from "react";

export const metadata = {
  title: "SPECS - Sistema de Representantes e Fornecedores",
  description: "Portal para conectar fornecedores de moda com seus revendedores",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style>
          {`
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Poppins', Arial, sans-serif;
              line-height: 1.5;
              color: #333;
              background-color: #f9fafb;
            }
            
            a {
              color: #2563eb;
              text-decoration: none;
            }
            
            button {
              cursor: pointer;
            }
          `}
        </style>
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}