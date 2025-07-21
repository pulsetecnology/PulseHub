import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Define tipos de usuário para melhor tipagem
type UserType = "fornecedor" | "revendedor";

// Define rotas públicas que não precisam de autenticação
const publicRoutes = ["/", "/about", "/contact", "/terms", "/privacy"];

// Define rotas de autenticação
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Obter token JWT da sessão
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Verificar autenticação e tipo de usuário
  const isAuthenticated = !!token;
  const userType = token?.type as UserType | undefined;
  const isAuthPage = authRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname === route);

  // 1. Redirecionar usuários autenticados para fora das páginas de autenticação
  if (isAuthenticated && isAuthPage) {
    const dashboardUrl = getDashboardUrl(userType);
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // 2. Proteger rotas específicas de fornecedor
  if (pathname.startsWith("/supplier")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    } else if (userType !== "fornecedor") {
      const dashboardUrl = getDashboardUrl(userType);
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }
  }

  // 3. Proteger rotas específicas de revendedor
  if (pathname.startsWith("/reseller")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    } else if (userType !== "revendedor") {
      const dashboardUrl = getDashboardUrl(userType);
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }
  }

  // 4. Proteger rotas de perfil
  if (pathname.startsWith("/profile")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 5. Proteger outras rotas privadas (não públicas e não de autenticação)
  if (!isAuthenticated && !isAuthPage && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Permitir a requisição continuar
  const response = NextResponse.next();
  return response;
}

// Função auxiliar para obter a URL do dashboard com base no tipo de usuário
function getDashboardUrl(userType?: UserType): string {
  switch (userType) {
    case "fornecedor":
      return "/supplier/dashboard";
    case "revendedor":
      return "/reseller/dashboard";
    default:
      return "/login"; // Fallback para login se o tipo for desconhecido
  }
}

// Configuração de rotas para o middleware
export const config = {
  matcher: [
    // Rotas de autenticação
    "/login",
    "/register", 
    "/forgot-password",
    "/reset-password",
    
    // Rotas protegidas
    "/supplier/:path*", 
    "/reseller/:path*", 
    "/profile/:path*",
    "/orders/:path*",
    "/catalog/:path*",
    "/settings/:path*",
    
    // Adicionar outras rotas protegidas conforme necessário
  ],
};
