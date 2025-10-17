import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles, User, LogIn, Calendar, Filter, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { authAPI, userAPI, buildFileUrl } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { useSubscriptionRenewal } from "@/hooks/useSubscriptionRenewal";
import type { User as IUser, Jornal } from "@/types/api";



const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Hook para renovação automática de assinaturas
  useSubscriptionRenewal();
  // const [selectedCategory, setSelectedCategory] = useState("Todos"); // não usado com API
  const [showAuthModal, setShowAuthModal] = useState<"login" | "signup" | null>(null);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jornais, setJornais] = useState<Jornal[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);

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
        description: 'Faça login para solicitar uma assinatura.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedPlan(planId);
  };

  // Map frontend plan IDs to backend subscription types
  const mapPlanToSubscriptionType = (planId: string): 'diario' | 'semanal' | 'mensal' | 'anual' => {
    const mapping: Record<string, 'diario' | 'semanal' | 'mensal' | 'anual'> = {
      'singular_3m': 'mensal',    // 3 meses = mensal
      'singular_6m': 'mensal',    // 6 meses = mensal  
      'singular_12m': 'anual',    // 12 meses = anual
      'institucional_basico_12m': 'anual',    // 12 meses = anual
      'institucional_corporativo_12m': 'anual', // 12 meses = anual
    };
    
    return mapping[planId] || 'mensal'; // fallback to mensal
  };

  const handleSubscriptionRequest = async () => {
    if (!selectedPlan) return;

    setIsSubmitting(true);
    try {
      await userAPI.createSubscriptionRequest({
        subscription_type: mapPlanToSubscriptionType(selectedPlan),
        payment_reference: paymentReference || undefined,
      });

      toast({
        title: 'Solicitação enviada!',
        description: 'Sua solicitação de assinatura está em análise. Você receberá uma notificação em breve.',
      });

      setShowPlansModal(false);
      setSelectedPlan(null);
      setPaymentReference('');
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
        title: 'Erro ao solicitar assinatura',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <div className="min-h-screen bg-gradient-bg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-secondary/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: "2s" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 backdrop-blur-xl bg-card/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Logo */}
            <div className="flex items-center gap-3 animate-fade-in">
              <img 
                src="https://odestaque.co.mz/wp-content/uploads/2025/02/cropped-DESTAQUE-globo-SEM-FUNDO-180x180.png" 
                alt="Jornal Destaque Logo" 
                className="w-6 h-6 object-contain"
              />
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Jornal Destaque
              </h1>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-md animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar jornais..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card/50 border-border/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* Auth / Account Buttons */}
            <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              {currentUser ? (
                <>
                  {currentUser.tipo_usuario === 'admin' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate('/admin')}
                    >
                      Admin
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{currentUser.nome || currentUser.email}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleLogout}
                    disabled={loading}
                  >
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAuthModal("login")}
                    className="gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">Entrar</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowAuthModal("signup")}
                    className="gap-2 bg-gradient-primary hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Cadastrar</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-accent bg-clip-text text-transparent">
            Suas notícias, seu mundo
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubra as últimas edições dos principais jornais com tecnologia de ponta
          </p>
        </div>

        {/* Filters (removido filtro por categoria para API; mantendo apenas busca) */}

        {/* Newspapers Grid (reais) */}
        {jornais.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jornais.map((jornal, index) => (
              <div
                key={jornal.id}
                className="group relative animate-fade-in-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="relative overflow-hidden rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/50">
                  {/* Cover Image */}
                  <div className="relative h-64 overflow-hidden">
                    {jornal.capa ? (
                      <img
                        src={buildFileUrl(jornal.capa) || ''}
                        alt={jornal.titulo}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <img
                        src={newspaperWorld}
                        alt={jornal.titulo}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(jornal.data_publicacao).toLocaleDateString()}</span>
                    </div>

                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {jornal.titulo}
                    </h3>

                    <Button
                      className="w-full bg-gradient-primary hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                      onClick={() => onClickJornal(jornal)}
                    >
                      Ler agora
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-card/50 backdrop-blur-sm border border-border/50 mb-4">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Nenhum jornal encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar sua busca ou filtros
            </p>
          </div>
        )}
      </main>

      {/* Plans Modal */}
      <Dialog open={showPlansModal} onOpenChange={setShowPlansModal}>
        <DialogContent className="max-w-5xl bg-background/95 backdrop-blur-xl border-primary/30 shadow-2xl shadow-primary/10">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-shimmer">
              Escolha seu Plano
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
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
          ) : (
            <div className="space-y-6 mt-6 animate-fade-in">
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  Plano Selecionado: {plans.find(p => p.id === selectedPlan)?.name}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Confirmação de Pagamento Mpesa/E-mola
                    </label>
                    <Input
                      placeholder="Cole a mensagem de confirmação do Mpesa ou E-mola"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      className="bg-background/50 border-primary/20 focus:border-primary"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Envie a mensagem de confirmação que você recebeu do Mpesa ou E-mola após realizar o pagamento
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedPlan(null);
                        setPaymentReference('');
                      }}
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      Voltar
                    </Button>
                    <Button
                      onClick={handleSubscriptionRequest}
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    >
                      {isSubmitting ? 'Enviando...' : 'Solicitar Assinatura'}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-card/90 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl shadow-primary/20 animate-scale-in">
            {/* Close Button */}
            <button
              onClick={() => setShowAuthModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4">
                  {showAuthModal === "login" ? (
                    <LogIn className="w-8 h-8 text-white" />
                  ) : (
                    <User className="w-8 h-8 text-white" />
                  )}
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {showAuthModal === "login" ? "Entrar" : "Criar Conta"}
                </h2>
                <p className="text-sm text-muted-foreground">
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
                    className="bg-background/50 border-border/50"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Senha</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="bg-background/50 border-border/50"
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
                        className="bg-background/50 border-border/50"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Telefone</label>
                      <Input
                        type="tel"
                        placeholder="(00) 00000-0000"
                        className="bg-background/50 border-border/50"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Confirmar Senha</label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="bg-background/50 border-border/50"
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
                  className="w-full bg-gradient-primary hover:opacity-90 transition-all shadow-lg shadow-primary/20"
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
