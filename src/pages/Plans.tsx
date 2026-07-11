import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { PlansCheckout } from "@/components/plans/PlansCheckout";
import { isPurchasePlan } from "@/constants/plans";
import { usePlansPayment } from "@/hooks/usePlansPayment";
import { useAuth } from "@/contexts/AuthContext";
import { userAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import type { Jornal } from "@/types/api";

const Plans = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jornalId = searchParams.get("jornal");
  const [selectedJornal, setSelectedJornal] = useState<Jornal | null>(null);

  const { user } = useAuth();

  const {
    plans,
    plansLoading,
    currentUser,
    selectedPlan,
    setSelectedPlan,
    msisdn,
    setMsisdn,
    paymentStep,
    isSubmitting,
    resetPaymentState,
    handleMpesaPayment,
  } = usePlansPayment(selectedJornal);

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);

  useEffect(() => {
    if (!jornalId) return;
    userAPI
      .getPublicJornais({ limit: 100 })
      .then((list) => {
        const found = list.find((j) => j.id === Number(jornalId));
        if (found) setSelectedJornal(found);
      })
      .catch(() => {});
  }, [jornalId]);

  const handlePlanSelect = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    const userRef = user || currentUser;

    if (!userRef) {
      toast({
        title: "Login necessário",
        description: "Faça login para subscrever.",
        variant: "destructive",
      });
      navigate("/jornais");
      return;
    }

    if (isPurchasePlan(plan) && !selectedJornal) {
      toast({
        title: "Escolha uma edição",
        description: "Vá aos Jornais e seleccione a edição que pretende comprar.",
      });
      navigate("/jornais");
      return;
    }

    setSelectedPlan(planId);
    setMsisdn(userRef.telefone || "");
  };

  const handleSuccessContinue = () => {
    const jornalTarget = isPurchasePlan(selectedPlanData) ? selectedJornal?.id : null;
    resetPaymentState();
    if (jornalTarget) navigate(`/jornal/${jornalTarget}`);
    else navigate("/jornais");
  };

  return (
    <div className="min-h-screen bg-white">
      <AppHeader showSearch={false} subtitle="Planos e Subscrições" />

      <main className="mx-auto max-w-4xl px-4 py-6 lg:px-6 lg:py-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Escolha seu Plano</h1>
          <p className="text-gray-400 mt-1 text-sm lg:text-base">
            Compre uma edição ou assine para ter acesso ilimitado aos nossos jornais
          </p>
        </div>

        <PlansCheckout
          plans={plans}
          plansLoading={plansLoading}
          selectedPlan={selectedPlan}
          selectedPlanData={selectedPlanData}
          selectedJornal={selectedJornal}
          paymentStep={paymentStep}
          msisdn={msisdn}
          isSubmitting={isSubmitting}
          onSelectPlan={handlePlanSelect}
          onMsisdnChange={setMsisdn}
          onPay={handleMpesaPayment}
          onBack={resetPaymentState}
          onSuccessContinue={handleSuccessContinue}
        />
      </main>
    </div>
  );
};

export default Plans;
