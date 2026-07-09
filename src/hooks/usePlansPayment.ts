import { useCallback, useEffect, useState } from "react";
import { authAPI, userAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { useUserAccount } from "@/hooks/useUserAccount";
import { FALLBACK_PLANS } from "@/constants/plans";
import type { Jornal, SubscriptionPlan, User } from "@/types/api";

type PaymentStep = "form" | "pending" | "success" | "failed";

export function usePlansPayment(selectedJornal: Jornal | null) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [msisdn, setMsisdn] = useState("");
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>("form");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { refresh: refreshAccount } = useUserAccount(
    Boolean(currentUser) && currentUser?.tipo_usuario !== "admin"
  );

  const refreshUserData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const userData = await authAPI.getCurrentUser();
      localStorage.setItem("user", JSON.stringify(userData));
      setCurrentUser(userData);
      return userData;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    userAPI
      .getSubscriptionPlans()
      .then((res) => setPlans(res.plans))
      .catch(() => setPlans(FALLBACK_PLANS))
      .finally(() => setPlansLoading(false));
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem("user");
    if (cached) {
      try {
        setCurrentUser(JSON.parse(cached));
      } catch {
        // ignore
      }
    }
    if (localStorage.getItem("token") && !cached) {
      authAPI
        .getCurrentUser()
        .then((me) => {
          localStorage.setItem("user", JSON.stringify(me));
          setCurrentUser(me);
        })
        .catch(() => {});
    }
  }, []);

  const resetPaymentState = useCallback(() => {
    setSelectedPlan(null);
    setMsisdn("");
    setPaymentOrderId(null);
    setPaymentStep("form");
    setIsSubmitting(false);
  }, []);

  const handleMpesaPayment = useCallback(async () => {
    if (!selectedPlan) return;
    if (!msisdn.trim()) {
      toast({
        title: "Número obrigatório",
        description: "Indique o número M-Pesa para receber o pedido de pagamento.",
        variant: "destructive",
      });
      return;
    }

    const plan = plans.find((p) => p.id === selectedPlan);
    const purchase = plan?.kind === "purchase" || plan?.id === "edicao_unica";

    setIsSubmitting(true);
    try {
      const result = await userAPI.startSubscriptionPayment({
        plan_id: selectedPlan as any,
        msisdn: msisdn.trim(),
        jornal_id: purchase ? selectedJornal?.id : undefined,
      });

      setPaymentOrderId(result.order_id);
      setPaymentStep("pending");
      toast({
        title: "Pedido enviado",
        description: "Confirme o pagamento no seu telemóvel M-Pesa.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao iniciar pagamento",
        description: error?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedPlan, msisdn, plans, selectedJornal]);

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
            title: "Pagamento confirmado!",
            description: result.jornal_id
              ? "Edição comprada. Já pode ler este jornal."
              : "A sua assinatura está activa. Já pode ler os jornais.",
          });
          return;
        }

        if (result.status === "failed" || result.status === "cancelled") {
          setPaymentStep("failed");
          toast({
            title: "Pagamento não concluído",
            description: "O pagamento falhou ou foi cancelado. Tente novamente.",
            variant: "destructive",
          });
          return;
        }

        if (attempts < maxAttempts) {
          window.setTimeout(poll, 3000);
        } else {
          setPaymentStep("failed");
          toast({
            title: "Tempo esgotado",
            description: "Não recebemos confirmação. Verifique o M-Pesa e tente novamente.",
          });
        }
      } catch {
        if (attempts < maxAttempts) window.setTimeout(poll, 3000);
      }
    };

    const timer = window.setTimeout(poll, 3000);
    return () => window.clearTimeout(timer);
  }, [paymentStep, paymentOrderId, refreshUserData, refreshAccount]);

  return {
    plans,
    plansLoading,
    currentUser,
    setCurrentUser,
    selectedPlan,
    setSelectedPlan,
    msisdn,
    setMsisdn,
    paymentStep,
    isSubmitting,
    resetPaymentState,
    handleMpesaPayment,
    refreshUserData,
  };
}
