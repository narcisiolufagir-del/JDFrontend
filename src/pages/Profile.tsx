import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Lock,
  User as UserIcon,
  Mail,
  Phone,
  Crown,
  CreditCard,
  Newspaper,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI, userAPI } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { SubscriptionInfo } from '@/components/SubscriptionInfo';
import {
  formatMoney,
  formatPaymentStatus,
  formatSubscriptionType,
  useUserAccount,
} from '@/hooks/useUserAccount';
import type { Jornal, JornalPurchase } from '@/types/api';
import { ProfileSkeleton, ProfileListSkeleton } from "@/components/news/NewsSkeletons";

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscriptions, payments, activeSubscription, hasActivePlan, loading: accountLoading, refresh } =
    useUserAccount(Boolean(user));
  const [purchases, setPurchases] = useState<JornalPurchase[]>([]);
  const [jornaisMap, setJornaisMap] = useState<Record<number, Jornal>>({});
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  useEffect(() => {
    if (!user) return;
    const loadPurchases = async () => {
      setLoadingPurchases(true);
      try {
        const data = await userAPI.getMyPurchases();
        setPurchases(data);
        if (data.length > 0) {
          const publicJornais = await userAPI.getPublicJornais({ limit: 200 });
          const map: Record<number, Jornal> = {};
          publicJornais.forEach((j) => {
            map[j.id] = j;
          });
          setJornaisMap(map);
        }
      } catch {
        // ignore
      } finally {
        setLoadingPurchases(false);
      }
    };
    void loadPurchases();
  }, [user]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!senhaAtual || !senhaNova || !confirmarSenha) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos',
        variant: 'destructive',
      });
      return;
    }

    if (senhaNova !== confirmarSenha) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem',
        variant: 'destructive',
      });
      return;
    }

    if (senhaNova.length < 6) {
      toast({
        title: 'Erro',
        description: 'A nova senha deve ter pelo menos 6 caracteres',
        variant: 'destructive',
      });
      return;
    }

    try {
      setPasswordLoading(true);
      await authAPI.changePassword({
        senha_atual: senhaAtual,
        senha_nova: senhaNova,
      });

      toast({
        title: 'Sucesso',
        description: 'Senha alterada com sucesso!',
      });

      setSenhaAtual('');
      setSenhaNova('');
      setConfirmarSenha('');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.response?.data?.detail || 'Erro ao alterar senha',
        variant: 'destructive',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button type="button" onClick={() => navigate(-1)} className="p-1 -ml-1">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Minha Conta</h1>
                <p className="text-xs text-gray-400">Gerir perfil e assinatura</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => void refresh()} disabled={accountLoading}>
              <RefreshCw className={`w-4 h-4 text-gray-500 ${accountLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 py-5">
        {accountLoading ? (
          <ProfileSkeleton />
        ) : (
        <div className="max-w-3xl mx-auto space-y-4">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Estado da subscrição
                </CardTitle>
                <Badge variant={hasActivePlan ? 'default' : 'secondary'}>
                  {hasActivePlan ? 'Plano activo' : 'Sem plano'}
                </Badge>
              </div>
              <CardDescription>
                {hasActivePlan
                  ? `Tem acesso completo até ${new Date(activeSubscription!.end_date).toLocaleDateString('pt-PT')}`
                  : 'Subscreva um plano para ler todas as edições.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeSubscription ? (
                <SubscriptionInfo subscription={activeSubscription} />
              ) : (
                <Button onClick={() => navigate('/?planos=1')} className="w-full sm:w-auto">
                  Ver planos
                </Button>
              )}

              {subscriptions.length > 1 && (
                <div className="space-y-3 pt-2">
                  <p className="text-sm font-medium text-muted-foreground">Histórico de subscrições</p>
                  {subscriptions
                    .filter((sub) => sub.id !== activeSubscription?.id)
                    .map((sub) => (
                      <SubscriptionInfo key={sub.id} subscription={sub} />
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pagamentos
              </CardTitle>
              <CardDescription>Histórico de pagamentos M-Pesa</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">Ainda não tem pagamentos registados.</p>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div
                      key={payment.order_id}
                      className="rounded-lg border border-border/60 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{payment.plan_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.created_at).toLocaleString('pt-PT')}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{payment.order_id}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-semibold">
                          {formatMoney(payment.amount, payment.currency)}
                        </span>
                        <Badge
                          variant={
                            payment.status === 'success'
                              ? 'default'
                              : payment.status === 'pending' || payment.status === 'processing'
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {formatPaymentStatus(payment.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {purchases.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5" />
                  Compras individuais
                </CardTitle>
                <CardDescription>Jornais comprados avulso</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPurchases ? (
                  <ProfileListSkeleton rows={2} />
                ) : (
                  <div className="space-y-2">
                    {purchases.map((purchase) => (
                      <div
                        key={purchase.id}
                        className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3"
                      >
                        <span className="text-sm font-medium">
                          {jornaisMap[purchase.jornal_id]?.titulo || `Jornal #${purchase.jornal_id}`}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(purchase.created_at).toLocaleDateString('pt-PT')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Dados pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <Input id="nome" value={user?.nome || ''} disabled className="bg-muted" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" value={user?.email || ''} disabled className="bg-muted" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input id="telefone" value={user?.telefone || ''} disabled className="bg-muted" />
                </div>
              </div>

              {user?.tipo_subscricao && (
                <div className="space-y-2">
                  <Label>Tipo de plano</Label>
                  <div className="px-3 py-2 bg-primary/10 border border-primary/20 rounded-md">
                    <span className="text-sm font-medium">
                      {formatSubscriptionType(user.tipo_subscricao)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Alterar senha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="senhaAtual">Senha actual</Label>
                  <Input
                    id="senhaAtual"
                    type="password"
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    disabled={passwordLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senhaNova">Nova senha</Label>
                  <Input
                    id="senhaNova"
                    type="password"
                    value={senhaNova}
                    onChange={(e) => setSenhaNova(e.target.value)}
                    disabled={passwordLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar nova senha</Label>
                  <Input
                    id="confirmarSenha"
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    disabled={passwordLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={passwordLoading}>
                  {passwordLoading ? 'A alterar...' : 'Alterar senha'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        )}
      </div>
    </div>
  );
}
