import { useCallback, useEffect, useMemo, useState } from "react";
import { userAPI } from "@/services/api";
import type { PaymentStatusResponse, Subscription } from "@/types/api";

export function useUserAccount(enabled = true) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<PaymentStatusResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const [subs, payRes] = await Promise.all([
        userAPI.getMySubscriptions(),
        userAPI.getMyPayments(),
      ]);
      setSubscriptions(subs);
      setPayments(payRes.payments || []);
    } catch {
      // silencioso — UI mostra estado vazio
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const activeSubscription = useMemo(() => {
    const now = new Date();
    return subscriptions.find((sub) => {
      const endDate = new Date(sub.end_date);
      return sub.is_active && endDate > now;
    }) ?? null;
  }, [subscriptions]);

  const hasActivePlan = Boolean(activeSubscription);

  return {
    subscriptions,
    payments,
    activeSubscription,
    hasActivePlan,
    loading,
    refresh,
  };
}

export function formatSubscriptionType(type?: string | null) {
  const labels: Record<string, string> = {
    diario: "Diário",
    semanal: "Semanal",
    mensal: "Mensal",
    anual: "Anual",
  };
  return type ? labels[type] || type : "—";
}

export function formatPaymentStatus(status: string) {
  const labels: Record<string, string> = {
    pending: "Pendente",
    processing: "A processar",
    success: "Pago",
    failed: "Falhou",
    cancelled: "Cancelado",
  };
  return labels[status] || status;
}

export function formatMoney(value: number, currency = "MZN") {
  return `${value.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}
