import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { User, LogIn, Calendar, X, Crown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AppHeader, HeaderSearchBar } from "@/components/AppHeader";
import { authAPI, userAPI, buildFileUrl } from "@/services/api";
import { useSubscriptionRenewal } from "@/hooks/useSubscriptionRenewal";
import { formatSubscriptionType, useUserAccount } from "@/hooks/useUserAccount";
import type { User as IUser, Jornal } from "@/types/api";
import { JornaisGridSkeleton } from "@/components/news/NewsSkeletons";

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  
  useSubscriptionRenewal();
  const [showAuthModal, setShowAuthModal] = useState<"login" | "signup" | null>(null);
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
  const { activeSubscription, hasActivePlan, loading: accountLoading } =
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
    if (searchParams.get("planos") === "1") {
      navigate("/plans", { replace: true });
    }
  }, [searchParams, navigate]);

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
      navigate(`/jornal/${j.id}`);
      return;
    }

    // Verifica se comprou esta edição individualmente
    try {
      const purchases = await userAPI.getMyPurchases();
      if (purchases.some((p) => p.jornal_id === j.id)) {
        navigate(`/jornal/${j.id}`);
        return;
      }
    } catch (_) {}

    // Sem acesso: vai para planos com esta edição pré-seleccionada
    navigate(`/plans?jornal=${j.id}`);
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
        onSubscribe={() => navigate("/plans")}
        logoutLoading={loading}
        subtitle="Notícias e Jornais"
        searchPlaceholder="Buscar jornais..."
      />

      <main className="mx-auto max-w-7xl px-4 py-4 lg:px-6 lg:py-8">
        <div className="lg:hidden mb-4">
          <HeaderSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Buscar jornais..."
          />
        </div>

        {currentUser && currentUser.tipo_usuario !== "admin" && (
          <div className="mb-6">
            {hasActivePlan && activeSubscription ? (
              <Card className="p-4 border-emerald-200 bg-emerald-50">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-emerald-100 p-2">
                      <Crown className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Plano activo · {formatSubscriptionType(activeSubscription.subscription_type)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Válido até {new Date(activeSubscription.end_date).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => navigate("/profile")}>
                    Ver perfil
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-4 border-[#2B58C5]/20 bg-[#2B58C5]/5">
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">Ainda sem plano activo</p>
                    <p className="text-sm text-gray-500">
                      Subscreva para ler todas as edições do Jornal Destaque.
                    </p>
                  </div>
                  <Button size="sm" className="w-full sm:w-auto text-white" style={{ backgroundColor: "#2B58C5" }} onClick={() => navigate("/plans")}>
                    Ver planos
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        <div className="mb-5">
          <h2 className="text-[17px] lg:text-xl font-bold text-gray-900 mb-0.5">
            Jornais Digitais
          </h2>
          <p className="text-[13px] text-gray-400">
            Leia as últimas edições do Jornal O Destaque
          </p>
        </div>

        {loadingList ? (
          <JornaisGridSkeleton />
        ) : jornais.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {jornais.map((jornal) => (
              <div
                key={jornal.id}
                className="group cursor-pointer"
                onClick={() => onClickJornal(jornal)}
              >
                <div className="relative overflow-hidden rounded-[16px] sm:rounded-[20px] bg-white border border-gray-100 shadow-sm transition-all active:scale-[0.98]">
                  <div className="relative h-36 sm:h-52 overflow-hidden">
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

                  <div className="p-3 sm:p-4 space-y-1.5 sm:space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-400">
                      <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                      <span className="truncate">{new Date(jornal.data_publicacao).toLocaleDateString("pt-PT")}</span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 leading-snug">
                      {jornal.titulo}
                    </h3>

                    <Button
                      className="w-full text-white hover:opacity-90 h-8 sm:h-10 text-xs sm:text-sm"
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
