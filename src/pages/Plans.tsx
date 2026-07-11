import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
      <AppHeader showSearch={false} />

      <main className="mx-auto max-w-4xl px-4 py-4 lg:px-6 lg:py-8">
        <div className="mb-6">
          <h1 className="text-[17px] lg:text-2xl font-bold text-gray-900">Planos e Subscrições</h1>
          <p className="text-[13px] lg:text-base text-gray-400 mt-0.5">
            Compre uma edição ou subscreva para acesso ilimitado aos jornais
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
