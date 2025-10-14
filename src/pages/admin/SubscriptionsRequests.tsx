import { useState, useEffect } from 'react';
import { adminAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';
import type { SubscriptionRequest, SubscriptionRequestStatus } from '@/types/api';

const SubscriptionsRequests = () => {
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<SubscriptionRequestStatus | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<SubscriptionRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [observacaoAdmin, setObservacaoAdmin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 100 };
      if (statusFilter !== 'all') {
        params.status_filter = statusFilter;
      }
      const data = await adminAPI.getSubscriptionRequests(params);
      setRequests(data);
    } catch (error: any) {
      // Extract error message properly
      let errorMessage = 'Tente novamente mais tarde.';
      const data = error.response?.data;
      
      if (typeof data?.detail === 'string') {
        errorMessage = data.detail;
      } else if (Array.isArray(data?.detail)) {
        // Handle Pydantic validation errors
        const msgs = data.detail.map((e: any) => e?.msg || e?.detail).filter(Boolean);
        if (msgs.length) {
          errorMessage = msgs.join(' | ');
        }
      } else if (data?.detail && typeof data.detail === 'object') {
        // Handle single validation error object
        errorMessage = data.detail.msg || data.detail.detail || 'Erro de validação';
      } else if (data?.detail) {
        errorMessage = String(data.detail);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Erro ao carregar pedidos',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return;

    setIsSubmitting(true);
    try {
      if (actionType === 'approve') {
        await adminAPI.approveSubscriptionRequest(selectedRequest.id, {
          observacao_admin: observacaoAdmin || undefined,
        });
        toast({
          title: 'Pedido aprovado!',
          description: 'A assinatura foi criada e o usuário foi notificado.',
        });
      } else {
        await adminAPI.rejectSubscriptionRequest(selectedRequest.id, {
          observacao_admin: observacaoAdmin || undefined,
        });
        toast({
          title: 'Pedido rejeitado',
          description: 'O usuário será notificado sobre a rejeição.',
        });
      }

      setSelectedRequest(null);
      setActionType(null);
      setObservacaoAdmin('');
      loadRequests();
    } catch (error: any) {
      // Extract error message properly
      let errorMessage = 'Tente novamente mais tarde.';
      const data = error.response?.data;
      
      if (typeof data?.detail === 'string') {
        errorMessage = data.detail;
      } else if (Array.isArray(data?.detail)) {
        // Handle Pydantic validation errors
        const msgs = data.detail.map((e: any) => e?.msg || e?.detail).filter(Boolean);
        if (msgs.length) {
          errorMessage = msgs.join(' | ');
        }
      } else if (data?.detail && typeof data.detail === 'object') {
        // Handle single validation error object
        errorMessage = data.detail.msg || data.detail.detail || 'Erro de validação';
      } else if (data?.detail) {
        errorMessage = String(data.detail);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Erro ao processar pedido',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openActionDialog = (request: SubscriptionRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setObservacaoAdmin('');
  };

  const getStatusBadge = (status: SubscriptionRequestStatus) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/50"><CheckCircle className="w-3 h-3 mr-1" /> Aprovado</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/50"><XCircle className="w-3 h-3 mr-1" /> Rejeitado</Badge>;
    }
  };

  const getPlanName = (type: string) => {
    const plans: Record<string, string> = {
      'singular_3m': 'Singular 3 Meses',
      'singular_6m': 'Singular 6 Meses',
      'singular_12m': 'Singular 12 Meses',
      'institucional_basico_12m': 'Institucional Básico',
      'institucional_corporativo_12m': 'Institucional Corporativo',
    };
    return plans[type] || type;
  };

  const filteredRequests = requests.filter((req) =>
    req.payment_reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.id.toString().includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Pedidos de Assinatura
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie solicitações de assinatura dos usuários
          </p>
        </div>
        <Button
          onClick={loadRequests}
          className="bg-gradient-primary hover:opacity-90 shadow-lg shadow-primary/50"
        >
          Atualizar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID ou referência de pagamento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50 border-primary/20"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('all')}
            className={statusFilter === 'all' ? 'bg-gradient-primary' : ''}
          >
            <Filter className="w-4 h-4 mr-2" />
            Todos
          </Button>
          <Button
            variant={statusFilter === 'pending' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('pending')}
            className={statusFilter === 'pending' ? 'bg-gradient-primary' : ''}
          >
            Pendentes
          </Button>
          <Button
            variant={statusFilter === 'approved' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('approved')}
            className={statusFilter === 'approved' ? 'bg-gradient-primary' : ''}
          >
            Aprovados
          </Button>
          <Button
            variant={statusFilter === 'rejected' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('rejected')}
            className={statusFilter === 'rejected' ? 'bg-gradient-primary' : ''}
          >
            Rejeitados
          </Button>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card className="p-12 text-center bg-card/50 backdrop-blur-xl border-primary/20">
          <p className="text-muted-foreground">Nenhum pedido encontrado.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map((request) => (
            <Card
              key={request.id}
              className="p-6 bg-card/50 backdrop-blur-xl border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 animate-fade-in"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm text-muted-foreground">ID: #{request.id}</span>
                    {getStatusBadge(request.status)}
                    <Badge variant="outline" className="bg-gradient-primary/10">
                      {getPlanName(request.subscription_type)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Usuário ID:</span> {request.user_id}
                    </p>
                    {request.payment_reference && (
                      <div className="text-sm">
                        <span className="font-medium text-foreground">Confirmação Mpesa/E-mola:</span>
                        <p className="text-muted-foreground mt-1 p-2 bg-background/50 rounded border border-border/50 font-mono text-xs break-all">
                          {request.payment_reference}
                        </p>
                      </div>
                    )}
                    {request.observacao_admin && (
                      <p className="text-sm">
                        <span className="font-medium text-foreground">Observação Admin:</span>{' '}
                        <span className="text-muted-foreground">{request.observacao_admin}</span>
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Criado em: {new Date(request.created_at).toLocaleString('pt-BR')}
                    </p>
                    {request.approved_at && (
                      <p className="text-xs text-muted-foreground">
                        Processado em: {new Date(request.approved_at).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => openActionDialog(request, 'approve')}
                      className="bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/50"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button
                      onClick={() => openActionDialog(request, 'reject')}
                      variant="destructive"
                      className="shadow-lg shadow-destructive/50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeitar
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={!!selectedRequest && !!actionType} onOpenChange={() => {
        setSelectedRequest(null);
        setActionType(null);
        setObservacaoAdmin('');
      }}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
              {actionType === 'approve' ? 'Aprovar Pedido' : 'Rejeitar Pedido'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? 'Ao aprovar, uma assinatura será criada e o usuário terá acesso imediato aos jornais.'
                : 'Informe o motivo da rejeição para o usuário.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedRequest && (
              <div className="p-4 bg-background/50 rounded-lg border border-border/50 space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Pedido:</span> #{selectedRequest.id}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Plano:</span> {getPlanName(selectedRequest.subscription_type)}
                </p>
                {selectedRequest.payment_reference && (
                  <div className="text-sm">
                    <span className="font-medium">Confirmação:</span>
                    <p className="text-muted-foreground text-xs mt-1 p-2 bg-background/50 rounded border border-border/50 font-mono break-all">
                      {selectedRequest.payment_reference}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">
                Observação {actionType === 'reject' ? '(obrigatória)' : '(opcional)'}
              </label>
              <Textarea
                placeholder={
                  actionType === 'approve'
                    ? 'Ex: Pagamento confirmado via Mpesa.'
                    : 'Ex: Comprovante de pagamento inválido.'
                }
                value={observacaoAdmin}
                onChange={(e) => setObservacaoAdmin(e.target.value)}
                className="bg-background/50 border-primary/20"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRequest(null);
                  setActionType(null);
                  setObservacaoAdmin('');
                }}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAction}
                disabled={isSubmitting || (actionType === 'reject' && !observacaoAdmin.trim())}
                className={`flex-1 ${
                  actionType === 'approve'
                    ? 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/50'
                    : 'bg-destructive hover:bg-destructive/90 shadow-lg shadow-destructive/50'
                }`}
              >
                {isSubmitting ? 'Processando...' : actionType === 'approve' ? 'Confirmar Aprovação' : 'Confirmar Rejeição'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionsRequests;
