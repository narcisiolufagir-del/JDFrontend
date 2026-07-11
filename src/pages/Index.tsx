import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Calendar, Crown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppHeader, HeaderSearchBar } from "@/components/AppHeader";
import { userAPI, buildFileUrl } from "@/services/api";
import { useSubscriptionRenewal } from "@/hooks/useSubscriptionRenewal";
import { formatSubscriptionType, useUserAccount } from "@/hooks/useUserAccount";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModal } from "@/contexts/AuthModalContext";
import type { Jornal } from "@/types/api";
import { JornaisGridSkeleton } from "@/components/news/NewsSkeletons";

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const { user, refreshUser } = useAuth();
  const { openLogin } = useAuthModal();

  useSubscriptionRenewal();
  const [jornais, setJornais] = useState<Jornal[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const { activeSubscription, hasActivePlan } = useUserAccount(
    Boolean(user) && user?.tipo_usuario !== "admin"
  );

  useEffect(() => {
    if (searchParams.get("planos") === "1") {
      navigate("/plans", { replace: true });
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    if (user && user.tipo_usuario !== "admin") {
      const interval = setInterval(() => {
        void refreshUser();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user, refreshUser]);

  const carregar = async () => {
    setLoadingList(true);
    try {
      const data = await userAPI.getPublicJornais({
        busca: searchQuery || undefined,
        limit: 100,
      });
      setJornais(data);
    } catch {
      // ignore
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    void carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      void carregar();
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const checkActiveSubscription = async () => {
    if (!user) return false;

    if (user.tipo_subscricao) return true;

    try {
      const subscriptions = await userAPI.getMySubscriptions();
      const now = new Date();
      const hasActiveSubscription = subscriptions.some((sub) => {
        const endDate = new Date(sub.end_date);
        return sub.is_active && endDate > now;
      });

      if (hasActiveSubscription) {
        await refreshUser();
        return true;
      }

      return false;
    } catch {
      return false;
    }
  };

  const onClickJornal = async (j: Jornal) => {
    if (!user) {
      openLogin();
      return;
    }

    if (user.tipo_usuario === "admin") {
      navigate(`/jornal/${j.id}`);
      return;
    }

    const hasActiveSubscription = await checkActiveSubscription();
    if (hasActiveSubscription) {
      navigate(`/jornal/${j.id}`);
      return;
    }

    try {
      const purchases = await userAPI.getMyPurchases();
      if (purchases.some((p) => p.jornal_id === j.id)) {
        navigate(`/jornal/${j.id}`);
        return;
      }
    } catch {
      // ignore
    }

    navigate(`/plans?jornal=${j.id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <AppHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
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

        {user && user.tipo_usuario !== "admin" && (
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
                        src={buildFileUrl(jornal.capa) || ""}
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
                        void onClickJornal(jornal);
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
            <p className="text-sm text-gray-400">Tente ajustar a sua busca</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
