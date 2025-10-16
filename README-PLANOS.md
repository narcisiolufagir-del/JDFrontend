# Integração Frontend — Pedidos de Assinatura (Planos)

Este guia explica como consumir os endpoints do backend para criar e gerenciar pedidos de assinatura, com aprovação por administrador.

## Endpoints do Backend

- Usuário
  - POST /user/subscriptions/requests
    - Body: { "subscription_type": "diario" | "semanal" | "mensal" | "anual", "payment_reference": "string?" }
  - GET /user/subscriptions/requests/my

- Admin
  - GET /admin/subscriptions/requests?status_filter=pending|approved|rejected
  - POST /admin/subscriptions/requests/{id}/approve
    - Body: { "observacao_admin": "string?" }
  - POST /admin/subscriptions/requests/{id}/reject
    - Body: { "observacao_admin": "string?" }

Observações:
- Ao aprovar, o backend cria Subscription e atualiza o usuário.
- Admin tem acesso ilimitado (frontend já pode liberar leitura para admin).

## Autenticação

- Todas as rotas exigem Bearer Token:
  Authorization: Bearer <token>

- O projeto já possui interceptor em `src/services/api.ts` para injetar o token de localStorage.

## Tipos recomendados (src/types/api.ts)

```ts
export type SubscriptionType = 'diario' | 'semanal' | 'mensal' | 'anual';

export interface SubscriptionRequestCreate {
  subscription_type: SubscriptionType;
  payment_reference?: string;
}

export type SubscriptionRequestStatus = 'pending' | 'approved' | 'rejected';

export interface SubscriptionRequest {
  id: number;
  user_id: number;
  subscription_type: SubscriptionType;
  status: SubscriptionRequestStatus;
  payment_reference?: string;
  observacao_admin?: string;
  approved_by?: number;
  approved_at?: string;
  created_at: string;
}
```

## API Client (src/services/api.ts)

Adicionar estes métodos:

```ts
// Opcional, caso exista no backend:
export const plansAPI = {
  getPlans: () => api.get('/plans').then(r => r.data),
};

export const userAPI = {
  // ...
  createSubscriptionRequest: (data: SubscriptionRequestCreate): Promise<SubscriptionRequest> =>
    api.post('/user/subscriptions/requests', data).then(r => r.data),
  getMySubscriptionRequests: (): Promise<SubscriptionRequest[]> =>
    api.get('/user/subscriptions/requests/my').then(r => r.data),
};

export const adminAPI = {
  // ...
  getSubscriptionRequests: (params?: { status_filter?: SubscriptionRequestStatus; skip?: number; limit?: number }): Promise<SubscriptionRequest[]> =>
    api.get('/admin/subscriptions/requests', { params }).then(r => r.data),
  approveSubscriptionRequest: (id: number, body?: { observacao_admin?: string }): Promise<SubscriptionRequest> =>
    api.post(`/admin/subscriptions/requests/${id}/approve`, body).then(r => r.data),
  rejectSubscriptionRequest: (id: number, body?: { observacao_admin?: string }): Promise<SubscriptionRequest> =>
    api.post(`/admin/subscriptions/requests/${id}/reject`, body).then(r => r.data),
};
```

## Páginas sugeridas

1) Página “Planos” (usuário)
- Lista os planos (via `plansAPI.getPlans` ou dados estáticos).
- Botão “Solicitar” abre modal com:
  - Select de `subscription_type`
  - Input `payment_reference`
- Envia POST para `userAPI.createSubscriptionRequest`
- Exibe lista de pedidos do usuário via `getMySubscriptionRequests`

2) Página Admin “Pedidos de Assinatura”
- Tabela com `adminAPI.getSubscriptionRequests({ status_filter: 'pending' })`
- Ações por linha:
  - Aprovar: `adminAPI.approveSubscriptionRequest(id, { observacao_admin })`
  - Rejeitar: `adminAPI.rejectSubscriptionRequest(id, { observacao_admin })`
- Atualiza a lista após ação

## Proteção de rotas

- Garanta que todas as rotas `/admin/*` estejam protegidas (já implementado com `AdminRoute`) e não sejam acessíveis por não-admins.

## Leitura de jornais

- Admin bypass: se `user.tipo_usuario === 'admin'`, permitir leitura sem exigir assinatura.
- Usuário comum precisa de assinatura ativa (o backend já valida).

## Exemplos de requisição (curl)

Criar pedido (usuário):
```bash
curl -X POST https://jdbackend-production.up.railway.app/user/subscriptions/requests \
 -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
 -d '{ "subscription_type": "anual", "payment_reference": "TX-2025-0001" }'
```

Listar pedidos do usuário:
```bash
curl -H "Authorization: Bearer <TOKEN>" https://jdbackend-production.up.railway.app/user/subscriptions/requests/my
```

Admin listar pendentes:
```bash
curl -H "Authorization: Bearer <ADMIN_TOKEN>" "https://jdbackend-production.up.railway.app/admin/subscriptions/requests?status_filter=pending"
```

Aprovar:
```bash
curl -X POST https://jdbackend-production.up.railway.app/admin/subscriptions/requests/1/approve \
 -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" \
 -d '{ "observacao_admin": "Pagamento confirmado." }'
```

Rejeitar:
```bash
curl -X POST https://jdbackend-production.up.railway.app/admin/subscriptions/requests/1/reject \
 -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" \
 -d '{ "observacao_admin": "Comprovante inválido." }'
```

## Dicas
- Configure `VITE_API_URL` se preferir não fixar `https://jdbackend-production.up.railway.app`.
- Use toasts (sonner) para feedback de envio/erro.
- Mostre estados de loading/empty nas páginas.
