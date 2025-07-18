# Sistema de Proteção de Rotas

Este documento explica como o sistema de proteção de rotas funciona no PulseHub.

## Visão Geral

O sistema de proteção de rotas utiliza uma abordagem em duas camadas:

1. **Middleware (Servidor)**: Verifica a autenticação e autorização no lado do servidor antes de renderizar a página
2. **RouteGuard (Cliente)**: Componente que verifica a autenticação e autorização no lado do cliente

Esta abordagem garante que:
- Usuários não autenticados sejam redirecionados para a página de login
- Usuários autenticados sejam redirecionados para seus respectivos dashboards com base em seu tipo (fornecedor ou revendedor)
- Usuários não possam acessar rotas para as quais não têm permissão

## Middleware

O middleware é executado no lado do servidor e intercepta todas as requisições antes que elas cheguem às páginas. Ele verifica:

- Se o usuário está autenticado (possui um token JWT válido)
- Se o usuário tem permissão para acessar a rota solicitada com base em seu tipo

### Configuração do Middleware

O middleware está configurado para proteger as seguintes rotas:

```typescript
export const config = {
  matcher: [
    "/supplier/:path*",     // Todas as rotas de fornecedor
    "/reseller/:path*",     // Todas as rotas de revendedor
    "/login",               // Página de login
    "/register",            // Página de registro
    "/forgot-password",     // Página de recuperação de senha
    "/reset-password",      // Página de redefinição de senha
    "/profile/:path*",      // Páginas de perfil
    "/orders/:path*",       // Páginas de pedidos
    "/catalog/:path*",      // Páginas de catálogo
    "/settings/:path*",     // Páginas de configurações
  ],
};
```

### Comportamento do Middleware

1. **Usuários não autenticados**:
   - Tentando acessar rotas protegidas: Redirecionados para `/login` com URL de retorno
   - Tentando acessar páginas de autenticação: Permitido

2. **Usuários autenticados como fornecedor**:
   - Tentando acessar rotas de fornecedor: Permitido
   - Tentando acessar rotas de revendedor: Redirecionados para `/supplier/dashboard`
   - Tentando acessar páginas de autenticação: Redirecionados para `/supplier/dashboard`

3. **Usuários autenticados como revendedor**:
   - Tentando acessar rotas de revendedor: Permitido
   - Tentando acessar rotas de fornecedor: Redirecionados para `/reseller/dashboard`
   - Tentando acessar páginas de autenticação: Redirecionados para `/reseller/dashboard`

## RouteGuard

O componente `RouteGuard` é usado no lado do cliente para complementar o middleware. Ele é especialmente útil para:

- Mostrar um estado de carregamento enquanto verifica a autenticação
- Fornecer feedback visual ao usuário
- Garantir proteção adicional no lado do cliente

### Como usar o RouteGuard

```tsx
import RouteGuard from "@/components/auth/RouteGuard";

export default function ProtectedPage() {
  return (
    <RouteGuard allowedRoles={["fornecedor"]}>
      {/* Conteúdo da página protegida */}
      <h1>Esta página só pode ser acessada por fornecedores</h1>
    </RouteGuard>
  );
}
```

### Propriedades do RouteGuard

- `children`: O conteúdo da página protegida
- `allowedRoles`: Array de tipos de usuário permitidos (opcional)
- `redirectTo`: URL para redirecionamento em caso de acesso não autorizado (padrão: "/login")

## Fluxo de Autenticação

1. O usuário tenta acessar uma rota
2. O middleware verifica a autenticação e autorização
3. Se autorizado, a página é renderizada
4. O componente RouteGuard verifica novamente a autenticação e autorização no lado do cliente
5. Se autorizado, o conteúdo da página é exibido

## Páginas de Exemplo

- `/supplier/protected-example`: Exemplo de página protegida para fornecedores
- `/reseller/protected-example`: Exemplo de página protegida para revendedores
- `/profile`: Página de perfil protegida para qualquer usuário autenticado
- `/test-middleware`: Página de teste para verificar o funcionamento do middleware

## Considerações de Segurança

- O middleware garante que as rotas sejam protegidas mesmo se o JavaScript estiver desabilitado no navegador
- O RouteGuard fornece uma camada adicional de proteção e feedback visual
- A combinação de ambos garante uma proteção robusta contra acessos não autorizados

## Próximos Passos

- Implementar verificação de permissões mais granular
- Adicionar suporte para roles e permissões personalizadas
- Implementar timeout de sessão e logout automático