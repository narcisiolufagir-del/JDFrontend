import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Crown,
  Lock,
  LogIn,
  Mail,
  Newspaper,
  Phone,
  Receipt,
  User as UserIcon,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { authAPI, userAPI, buildFileUrl } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import {
  formatMoney,
  formatPaymentStatus,
  formatSubscriptionType,
  useUserAccount,
} from "@/hooks/useUserAccount";
import type { Jornal, JornalPurchase } from "@/types/api";
import { ProfileSkeleton } from "@/components/news/NewsSkeletons";
import { cn } from "@/lib/utils";

const BRAND = "#2B58C5";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { openLogin, openSignup } = useAuthModal();
  const { subscriptions, payments, activeSubscription, hasActivePlan, loading, refresh } =
    useUserAccount(Boolean(user));

  const [purchases, setPurchases] = useState<JornalPurchase[]>([]);
  const [jornaisMap, setJornaisMap] = useState<Record<number, Jornal>>({});
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

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

  const successfulPayments = useMemo(
    () => payments.filter((p) => p.status === "success"),
    [payments]
  );

  const pastSubscriptions = useMemo(
    () => subscriptions.filter((sub) => sub.id !== activeSubscription?.id),
    [subscriptions, activeSubscription]
  );

  const sortedPurchases = useMemo(
    () =>
      [...purchases].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    [purchases]
  );

  const userInitial = (user?.nome || user?.email || "U").charAt(0).toUpperCase();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!senhaAtual || !senhaNova || !confirmarSenha) {
      toast({ title: "Erro", description: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    if (senhaNova !== confirmarSenha) {
      toast({ title: "Erro", description: "As senhas não coincidem", variant: "destructive" });
      return;
    }
    if (senhaNova.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    try {
      setPasswordLoading(true);
      await authAPI.changePassword({ senha_atual: senhaAtual, senha_nova: senhaNova });
      toast({ title: "Sucesso", description: "Senha alterada com sucesso!" });
      setSenhaAtual("");
      setSenhaNova("");
      setConfirmarSenha("");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast({
        title: "Erro",
        description: err.response?.data?.detail || "Erro ao alterar senha",
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader showSearch={false} />

      <div className="mx-auto max-w-3xl px-4 py-4 lg:py-6 space-y-4">
        <div className="mb-1">
          <h1 className="text-[17px] lg:text-xl font-bold text-gray-900">Minha conta</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">Perfil, jornais e subscrição</p>
        </div>

        {!user ? (
          <div className="rounded-2xl bg-white border border-gray-100 p-6 text-center shadow-sm">
            <div
              className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor: BRAND }}
            >
              <UserIcon className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Entre na sua conta</h2>
            <p className="text-sm text-gray-400 mb-5">
              Aceda aos jornais que comprou e gerencie a sua subscrição.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button className="text-white" style={{ backgroundColor: BRAND }} onClick={openLogin}>
                <LogIn className="w-4 h-4 mr-2" />
                Entrar
              </Button>
              <Button variant="outline" onClick={openSignup}>
                <UserPlus className="w-4 h-4 mr-2" />
                Criar conta
              </Button>
            </div>
          </div>
        ) : loading ? (
          <ProfileSkeleton />
        ) : (
          <>
            {/* Perfil */}
            <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                  style={{ backgroundColor: BRAND }}
                >
                  {userInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 truncate">{user.nome || "Utilizador"}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  {user.telefone && (
                    <p className="text-xs text-gray-400 truncate">{user.telefone}</p>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="text-red-600 shrink-0" onClick={() => logout()}>
                  Sair
                </Button>
              </div>
            </div>

            {/* Plano */}
            <div
              className={cn(
                "rounded-2xl border p-4 shadow-sm",
                hasActivePlan ? "bg-emerald-50 border-emerald-200" : "bg-white border-gray-100"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={cn(
                      "rounded-full p-2 shrink-0",
                      hasActivePlan ? "bg-emerald-100" : "bg-gray-100"
                    )}
                  >
                    <Crown
                      className={cn("w-5 h-5", hasActivePlan ? "text-emerald-600" : "text-gray-400")}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">
                      {hasActivePlan ? "Plano activo" : "Sem plano activo"}
                    </p>
                    {hasActivePlan && activeSubscription ? (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {formatSubscriptionType(activeSubscription.subscription_type)} · válido até{" "}
                        {new Date(activeSubscription.end_date).toLocaleDateString("pt-PT")}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 mt-0.5">
                        Subscreva para ler todas as edições.
                      </p>
                    )}
                  </div>
                </div>
                {!hasActivePlan && (
                  <Button
                    size="sm"
                    className="text-white shrink-0"
                    style={{ backgroundColor: BRAND }}
                    onClick={() => navigate("/plans")}
                  >
                    Ver planos
                  </Button>
                )}
              </div>
            </div>

            {/* Jornais comprados / acesso */}
            <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Newspaper className="w-4 h-4" style={{ color: BRAND }} />
                    Os meus jornais
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {hasActivePlan
                      ? "Tem acesso a todas as edições"
                      : "Jornais que comprou individualmente"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs shrink-0"
                  style={{ color: BRAND }}
                  onClick={() => navigate("/jornais")}
                >
                  Ver todos
                </Button>
              </div>

              {hasActivePlan ? (
                <button
                  type="button"
                  onClick={() => navigate("/jornais")}
                  className="w-full rounded-xl border border-[#2B58C5]/20 bg-[#2B58C5]/5 p-4 text-left active:scale-[0.99] transition-transform"
                >
                  <p className="font-semibold text-gray-900 text-sm">Explorar jornais digitais</p>
                  <p className="text-xs text-gray-500 mt-1">
                    O seu plano dá acesso a todas as edições disponíveis.
                  </p>
                </button>
              ) : loadingPurchases ? (
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1].map((i) => (
                    <div key={i} className="rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                      <div className="h-28 bg-gray-200" />
                      <div className="p-3 space-y-2">
                        <div className="h-3 bg-gray-100 rounded w-3/4" />
                        <div className="h-8 bg-gray-100 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : sortedPurchases.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {sortedPurchases.map((purchase) => {
                    const jornal = jornaisMap[purchase.jornal_id];
                    return (
                      <div
                        key={purchase.id}
                        className="rounded-xl border border-gray-100 overflow-hidden bg-white"
                      >
                        <div className="relative h-28 bg-gray-100">
                          {jornal?.capa ? (
                            <img
                              src={buildFileUrl(jornal.capa) || ""}
                              alt={jornal.titulo}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              📰
                            </div>
                          )}
                        </div>
                        <div className="p-2.5 space-y-2">
                          <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug">
                            {jornal?.titulo || `Jornal #${purchase.jornal_id}`}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {new Date(purchase.created_at).toLocaleDateString("pt-PT")}
                          </p>
                          <Button
                            size="sm"
                            className="w-full h-8 text-xs text-white"
                            style={{ backgroundColor: BRAND }}
                            onClick={() => navigate(`/jornal/${purchase.jornal_id}`)}
                          >
                            Ler agora
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl bg-gray-50 p-5 text-center">
                  <p className="text-sm text-gray-500">Ainda não comprou nenhum jornal.</p>
                  <Button
                    size="sm"
                    className="mt-3 text-white"
                    style={{ backgroundColor: BRAND }}
                    onClick={() => navigate("/jornais")}
                  >
                    Ver jornais
                  </Button>
                </div>
              )}
            </div>

            {/* Pagamentos — ocultos por defeito */}
            {successfulPayments.length > 0 && (
              <Collapsible open={paymentsOpen} onOpenChange={setPaymentsOpen}>
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-900">
                          Pagamentos e transações
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {successfulPayments.length}
                        </Badge>
                      </div>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-gray-400 transition-transform",
                          paymentsOpen && "rotate-180"
                        )}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-2 border-t border-gray-50 pt-3">
                      {successfulPayments.map((payment) => (
                        <div
                          key={payment.order_id}
                          className="rounded-xl border border-gray-100 p-3 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {payment.plan_name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(payment.created_at).toLocaleDateString("pt-PT")}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-gray-900">
                              {formatMoney(payment.amount, payment.currency)}
                            </p>
                            <p className="text-[10px] text-emerald-600 font-medium">
                              {formatPaymentStatus(payment.status)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            {/* Histórico subscrições — só se houver passadas */}
            {pastSubscriptions.length > 0 && (
              <Collapsible>
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm font-semibold text-gray-900">
                        Histórico de subscrições
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-2 border-t border-gray-50 pt-3">
                      {pastSubscriptions.map((sub) => (
                        <div
                          key={sub.id}
                          className="rounded-xl border border-gray-100 p-3 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {formatSubscriptionType(sub.subscription_type)}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(sub.start_date).toLocaleDateString("pt-PT")} –{" "}
                              {new Date(sub.end_date).toLocaleDateString("pt-PT")}
                            </p>
                          </div>
                          <Badge variant={sub.is_active ? "default" : "secondary"} className="text-xs">
                            {sub.is_active ? "Activa" : "Expirada"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            {/* Definições — ocultas por defeito */}
            <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-900">
                        Definições da conta
                      </span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-gray-400 transition-transform",
                        settingsOpen && "rotate-180"
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-4 border-t border-gray-50 pt-3">
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500">Nome</Label>
                        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 h-10">
                          <UserIcon className="h-4 w-4 text-gray-400 shrink-0" />
                          <span className="text-sm text-gray-800 truncate">{user.nome || "—"}</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500">Email</Label>
                        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 h-10">
                          <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                          <span className="text-sm text-gray-800 truncate">{user.email}</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500">Telefone</Label>
                        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 h-10">
                          <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                          <span className="text-sm text-gray-800 truncate">{user.telefone || "—"}</span>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-3 pt-2 border-t border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">Alterar senha</p>
                      <div className="space-y-1.5">
                        <Label htmlFor="senhaAtual" className="text-xs">Senha actual</Label>
                        <Input
                          id="senhaAtual"
                          type="password"
                          value={senhaAtual}
                          onChange={(e) => setSenhaAtual(e.target.value)}
                          disabled={passwordLoading}
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="senhaNova" className="text-xs">Nova senha</Label>
                        <Input
                          id="senhaNova"
                          type="password"
                          value={senhaNova}
                          onChange={(e) => setSenhaNova(e.target.value)}
                          disabled={passwordLoading}
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="confirmarSenha" className="text-xs">Confirmar nova senha</Label>
                        <Input
                          id="confirmarSenha"
                          type="password"
                          value={confirmarSenha}
                          onChange={(e) => setConfirmarSenha(e.target.value)}
                          disabled={passwordLoading}
                          className="h-10"
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={passwordLoading}>
                        {passwordLoading ? "A alterar..." : "Alterar senha"}
                      </Button>
                    </form>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </>
        )}
      </div>
    </div>
  );
}
