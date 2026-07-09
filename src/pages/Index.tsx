import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, User, LogIn, Calendar, Filter, X, Check, Loader2, Smartphone, Crown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppHeader } from "@/components/AppHeader";
import { authAPI, userAPI, buildFileUrl } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { useSubscriptionRenewal } from "@/hooks/useSubscriptionRenewal";
import { formatSubscriptionType, useUserAccount } from "@/hooks/useUserAccount";
import type { User as IUser, Jornal } from "@/types/api";
import { JornaisGridSkeleton } from "@/components/news/NewsSkeletons";

const Index = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Hook para renovação automática de assinaturas
  useSubscriptionRenewal();
  // const [selectedCategory, setSelectedCategory] = useState("Todos"); // não usado com API
  const [showAuthModal, setShowAuthModal] = useState<"login" | "signup" | null>(null);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [msisdn, setMsisdn] = useState("");
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<"form" | "pending" | "success" | "failed">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jornais, setJornais] = useState<Jornal[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const { activeSubscription, hasActivePlan, loading: accountLoading, refresh: refreshAccount } =
    useUserAccount(Boolean(currentUser) && currentUser?.tipo_usuario !== "admin");

  const resetAuthState = () => {
    setEmail("");
    setSenha("");
    setConfirmSenha("");
    setNome("");
    setTelefone("");
    setError(null);
    setLoading(false);
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authAPI.login({ email, senha });
      localStorage.setItem("token", res.access_token);
      try {
        const me = await authAPI.getCurrentUser();
        localStorage.setItem("user", JSON.stringify(me));
        setCurrentUser(me);
      } catch (_) {}
      setShowAuthModal(null);
      resetAuthState();
      // Recarrega a página para re-montar com o novo contexto/auth
      window.location.reload();
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Falha ao entrar. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (senha !== confirmSenha) {
      setError("As senhas não coincidem.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      // Register as normal user (non-admin) via /user/register
      await authAPI.register({ nome, telefone, email, senha });
      // Auto login após registrar
      const res = await authAPI.login({ email, senha });
      localStorage.setItem("token", res.access_token);
      try {
        const me = await authAPI.getCurrentUser();
        localStorage.setItem("user", JSON.stringify(me));
        setCurrentUser(me);
      } catch (_) {}
      setShowAuthModal(null);
      resetAuthState();
      // Recarrega a página para re-montar com o novo contexto/auth
      window.location.reload();
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Falha ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await authAPI.logout().catch(() => {});
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setCurrentUser(null);
      setLoading(false);
      // Recarrega a página para limpar qualquer estado dependente do contexto
      window.location.reload();
    }
  };

  // Function to refresh user data from backend
  const refreshUserData = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const userData = await authAPI.getCurrentUser();
        localStorage.setItem("user", JSON.stringify(userData));
        setCurrentUser(userData);
        return userData;
      } catch (error) {
        console.error("Failed to refresh user data:", error);
        return null;
      }
    }
    return null;
  };

  // Function to check if user has active subscription
  const checkActiveSubscription = async () => {
    if (!currentUser) return false;
    
    // Check tipo_subscricao first (fast check)
    if (currentUser.tipo_subscricao) {
      return true;
    }
    
    // If no tipo_subscricao, check active subscriptions from backend
    try {
      const subscriptions = await userAPI.getMySubscriptions();
      const now = new Date();
      const hasActiveSubscription = subscriptions.some(sub => {
        const endDate = new Date(sub.end_date);
        return sub.is_active && endDate > now;
      });
      
      // If we found an active subscription but user doesn't have tipo_subscricao, refresh user data
      if (hasActiveSubscription) {
        await refreshUserData();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Failed to check subscriptions:", error);
      return false;
    }
  };

  useEffect(() => {
    if (searchParams.get("planos") === "1" && currentUser) {
      setShowPlansModal(true);
      searchParams.delete("planos");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, currentUser]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const cached = localStorage.getItem("user");
    if (cached) {
      try {
        setCurrentUser(JSON.parse(cached));
      } catch (_) {}
    }
    if (token && !cached) {
      authAPI
        .getCurrentUser()
        .then((me) => {
          localStorage.setItem("user", JSON.stringify(me));
          setCurrentUser(me);
        })
        .catch(() => {});
    }
  }, []);

  // Refresh user data periodically to catch subscription updates
  useEffect(() => {
    if (currentUser && currentUser.tipo_usuario !== 'admin') {
      // Refresh user data every 30 seconds to catch subscription updates
      const interval = setInterval(() => {
        refreshUserData();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Carregar jornais reais
  const carregar = async () => {
    setLoadingList(true);
    try {
      const data = await userAPI.getPublicJornais({
        busca: searchQuery || undefined,
        limit: 100,
      });
      setJornais(data);
    } catch (e) {
      // opcional: exibir toast/erro
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      carregar();
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const plans = [
    {
      id: 'singular_3m',
      name: 'Singular 3 Meses',
      price: '4.000,00 MT',
      period: '/3 meses',
      features: ['Acesso semanal', 'Todas as edições', '1 usuário', 'Suporte básico'],
      popular: false,
    },
    {
      id: 'singular_6m',
      name: 'Singular 6 Meses',
      price: '6.500,00 MT',
      period: '/6 meses',
      features: ['Acesso semanal', 'Todas as edições', '1 usuário', 'Suporte prioritário'],
      popular: true,
    },
    {
      id: 'singular_12m',
      name: 'Singular 12 Meses',
      price: '10.000,00 MT',
      period: '/ano',
      features: ['Acesso semanal', 'Todas as edições', '1 usuário', 'Suporte premium', 'Melhor custo-benefício'],
      popular: false,
    },
    {
      id: 'institucional_basico_12m',
      name: 'Institucional Básico',
      price: '50.000,00 MT',
      period: '/ano',
      features: ['Acesso semanal', 'Todas as edições', 'Até 10 usuários', 'Notícias exclusivas', 'Suporte dedicado'],
      popular: false,
    },
    {
      id: 'institucional_corporativo_12m',
      name: 'Institucional Corporativo',
      price: '200.000,00 MT',
      period: '/ano',
      features: ['Acesso semanal e ilimitado', 'Todas as edições', 'Usuários ilimitados', 'Notícias exclusivas', 'Suporte VIP 24/7', 'Relatórios personalizados'],
      popular: false,
    },
  ];

  const handlePlanSelect = async (planId: string) => {
    if (!currentUser) {
      setShowPlansModal(false);
      setShowAuthModal("login");
      toast({
        title: 'Login necessário',
        description: 'Faça login para subscrever.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedPlan(planId);
    setMsisdn(currentUser.telefone || "");
    setPaymentStep("form");
    setPaymentOrderId(null);
  };

  const resetPaymentState = () => {
    setSelectedPlan(null);
    setMsisdn("");
    setPaymentOrderId(null);
    setPaymentStep("form");
    setIsSubmitting(false);
  };

  const handleMpesaPayment = async () => {
    if (!selectedPlan) return;
    if (!msisdn.trim()) {
      toast({
        title: 'Número obrigatório',
        description: 'Indique o número M-Pesa para receber o pedido de pagamento.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await userAPI.startSubscriptionPayment({
        plan_id: selectedPlan as any,
        msisdn: msisdn.trim(),
      });

      setPaymentOrderId(result.order_id);
      setPaymentStep("pending");
      toast({
        title: 'Pedido enviado',
        description: 'Confirme o pagamento no seu telemóvel M-Pesa.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao iniciar pagamento',
        description: error?.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (paymentStep !== "pending" || !paymentOrderId) return;

    let attempts = 0;
    const maxAttempts = 40;

    const poll = async () => {
      attempts += 1;
      try {
        const result = await userAPI.checkPaymentStatus(paymentOrderId);

        if (result.success && result.fulfilled) {
          setPaymentStep("success");
          await refreshUserData();
          await refreshAccount();
          toast({
            title: 'Pagamento confirmado!',
            description: 'A sua assinatura está activa. Já pode ler os jornais.',
          });
          return;
        }

        if (result.status === "failed" || result.status === "cancelled") {
          setPaymentStep("failed");
          toast({
            title: 'Pagamento não concluído',
            description: 'O pagamento falhou ou foi cancelado. Tente novamente.',
            variant: 'destructive',
          });
          return;
        }

        if (attempts < maxAttempts) {
          window.setTimeout(poll, 3000);
        } else {
          setPaymentStep("failed");
          toast({
            title: 'Tempo esgotado',
            description: 'Não recebemos confirmação. Verifique o M-Pesa e tente novamente.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        if (attempts < maxAttempts) {
          window.setTimeout(poll, 3000);
        }
      }
    };

    const timer = window.setTimeout(poll, 3000);
    return () => window.clearTimeout(timer);
  }, [paymentStep, paymentOrderId]);

  const onClickJornal = async (j: Jornal) => {
    if (!currentUser) {
      setShowAuthModal("login");
      return;
    }
    
    // Admins têm acesso ilimitado
    if (currentUser.tipo_usuario === 'admin') {
      navigate(`/jornal/${j.id}`);
      return;
    }
    
    // Check if user has active subscription
    const hasActiveSubscription = await checkActiveSubscription();
    
    if (hasActiveSubscription) {
      // User has active subscription, can access
      navigate(`/jornal/${j.id}`);
    } else {
      // User doesn't have active subscription, show plans
      setShowPlansModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <AppHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentUser={currentUser}
        hasActivePlan={hasActivePlan}
        activePlanLabel={
          activeSubscription
            ? formatSubscriptionType(activeSubscription.subscription_type)
            : currentUser?.tipo_subscricao
              ? formatSubscriptionType(currentUser.tipo_subscricao)
              : null
        }
        loading={accountLoading}
        onLogin={() => setShowAuthModal("login")}
        onSignup={() => setShowAuthModal("signup")}
        onLogout={handleLogout}
        onSubscribe={() => setShowPlansModal(true)}
        logoutLoading={loading}
      />

      {/* Main Content */}
      <main className="px-4 py-5">
        {currentUser && currentUser.tipo_usuario !== "admin" && (
          <div className="mb-8">
            {hasActivePlan && activeSubscription ? (
              <Card className="p-4 sm:p-5 border-emerald-500/20 bg-emerald-500/5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-emerald-500/15 p-2">
                      <Crown className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        Plano activo · {formatSubscriptionType(activeSubscription.subscription_type)}
                      </p>
                      <p className="text-sm text-gray-400">
                        Válido até {new Date(activeSubscription.end_date).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate("/profile")}>
                    Ver perfil
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-4 sm:p-5 border-primary/20 bg-primary/5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">Ainda sem plano activo</p>
                    <p className="text-sm text-gray-400">
                      Subscreva para ler todas as edições do Jornal Destaque.
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setShowPlansModal(true)}>
                    Ver planos
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Hero Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Jornais Digitais
          </h2>
          <p className="text-sm text-gray-400">
            Leia as últimas edições do Jornal O Destaque
          </p>
        </div>

        {/* Filters (removido filtro por categoria para API; mantendo apenas busca) */}

        {/* Newspapers Grid (reais) */}
        {loadingList ? (
          <JornaisGridSkeleton />
        ) : jornais.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {jornais.map((jornal) => (
              <div
                key={jornal.id}
                className="group cursor-pointer"
                onClick={() => onClickJornal(jornal)}
              >
                <div className="relative overflow-hidden rounded-[20px] bg-white border border-gray-100 shadow-sm transition-all active:scale-[0.98]">
                  <div className="relative h-52 overflow-hidden">
                    {jornal.capa ? (
                      <img
                        src={buildFileUrl(jornal.capa) || ''}
                        alt={jornal.titulo}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                        <span className="text-4xl">📰</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(jornal.data_publicacao).toLocaleDateString("pt-PT")}</span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 line-clamp-2">
                      {jornal.titulo}
                    </h3>

                    <Button
                      className="w-full text-white hover:opacity-90"
                      style={{ backgroundColor: "#2B58C5" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onClickJornal(jornal);
                      }}
                    >
                      Ler agora
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Nenhum jornal encontrado</h3>
            <p className="text-sm text-gray-400">
              Tente ajustar sua busca
            </p>
          </div>
        )}
      </main>

      {/* Plans Modal */}
      <Dialog
        open={showPlansModal}
        onOpenChange={(open) => {
          setShowPlansModal(open);
          if (!open) resetPaymentState();
        }}
      >
        <DialogContent className="max-w-5xl bg-white border-gray-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Escolha seu Plano
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Selecione o plano ideal para você e tenha acesso ilimitado aos nossos jornais
            </DialogDescription>
          </DialogHeader>

          {!selectedPlan ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {plans.map((plan, index) => (
                <Card
                  key={plan.id}
                  className={`relative p-6 bg-card/50 backdrop-blur-sm border transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer animate-fade-in ${
                    plan.popular
                      ? 'border-primary shadow-lg shadow-primary/20'
                      : 'border-primary/20 hover:border-primary/50'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-accent rounded-full text-xs font-bold text-primary-foreground animate-glow">
                      POPULAR
                    </div>
                  )}
                  
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {plan.price}
                      </span>
                      <span className="text-sm text-muted-foreground">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    Selecionar
                  </Button>
                </Card>
              ))}
            </div>
          ) : paymentStep === "success" ? (
            <div className="space-y-6 mt-6 animate-fade-in text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Assinatura activa!</h3>
              <p className="text-muted-foreground">
                O pagamento foi confirmado. Já pode aceder a todos os jornais.
              </p>
              <Button
                onClick={() => {
                  resetPaymentState();
                  setShowPlansModal(false);
                }}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                Começar a ler
              </Button>
            </div>
          ) : (
            <div className="space-y-6 mt-6 animate-fade-in">
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  Plano: {plans.find(p => p.id === selectedPlan)?.name}
                </h3>
                
                {paymentStep === "pending" ? (
                  <div className="text-center py-8 space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                    <p className="text-foreground font-medium">Aguardando confirmação M-Pesa...</p>
                    <p className="text-sm text-gray-400">
                      Confirme o pagamento no telemóvel <strong>{msisdn}</strong>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-center">
                      <p className="text-sm text-gray-400">Valor a pagar</p>
                      <p className="text-2xl font-bold text-foreground">
                        {plans.find(p => p.id === selectedPlan)?.price}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Número M-Pesa
                      </label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="84xxxxxxx"
                          value={msisdn}
                          onChange={(e) => setMsisdn(e.target.value)}
                          className="pl-10 bg-background/50 border-primary/20 focus:border-primary"
                          disabled={isSubmitting}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Receberá um pedido M-Pesa neste número. Confirme para activar o acesso na hora.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={resetPaymentState}
                        className="flex-1"
                        disabled={isSubmitting}
                      >
                        Voltar
                      </Button>
                      <Button
                        onClick={handleMpesaPayment}
                        disabled={isSubmitting}
                        className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            A enviar...
                          </>
                        ) : (
                          'Pagar com M-Pesa'
                        )}
                      </Button>
                    </div>

                    {paymentStep === "failed" && (
                      <p className="text-sm text-red-500 text-center">
                        Pagamento não confirmado. Tente novamente.
                      </p>
                    )}
                  </div>
                )}
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-xl">
            {/* Close Button */}
            <button
              onClick={() => setShowAuthModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: "#2B58C5" }}>
                  {showAuthModal === "login" ? (
                    <LogIn className="w-8 h-8 text-white" />
                  ) : (
                    <User className="w-8 h-8 text-white" />
                  )}
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900">
                  {showAuthModal === "login" ? "Entrar" : "Criar Conta"}
                </h2>
                <p className="text-sm text-gray-400">
                  {showAuthModal === "login"
                    ? "Entre para acessar suas compras"
                    : "Cadastre-se para começar a comprar"}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    className="bg-[#F0F2F6] border-0 text-gray-800"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Senha</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="bg-[#F0F2F6] border-0 text-gray-800"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                </div>
                {showAuthModal === "signup" && (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Nome</label>
                      <Input
                        type="text"
                        placeholder="Seu nome"
                        className="bg-[#F0F2F6] border-0 text-gray-800"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Telefone</label>
                      <Input
                        type="tel"
                        placeholder="(00) 00000-0000"
                        className="bg-[#F0F2F6] border-0 text-gray-800"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Confirmar Senha</label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="bg-[#F0F2F6] border-0 text-gray-800"
                        value={confirmSenha}
                        onChange={(e) => setConfirmSenha(e.target.value)}
                      />
                    </div>
                  </>
                )}
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
                <Button
                  className="w-full text-white hover:opacity-90"
                  style={{ backgroundColor: "#2B58C5" }}
                  onClick={showAuthModal === "login" ? handleLogin : handleSignup}
                  disabled={loading}
                >
                  {loading ? "Processando..." : showAuthModal === "login" ? "Entrar" : "Cadastrar"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  {showAuthModal === "login" ? (
                    <>
                      Não tem conta?{" "}
                      <button
                        onClick={() => setShowAuthModal("signup")}
                        className="text-primary hover:underline font-medium"
                      >
                        Cadastre-se
                      </button>
                    </>
                  ) : (
                    <>
                      Já tem conta?{" "}
                      <button
                        onClick={() => setShowAuthModal("login")}
                        className="text-primary hover:underline font-medium"
                      >
                        Entre aqui
                      </button>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
