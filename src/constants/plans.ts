import type { SubscriptionPlan } from "@/types/api";

export const FALLBACK_PLANS: SubscriptionPlan[] = [
  {
    id: "edicao_unica",
    name: "Edição única",
    amount: 100,
    charge_amount: 10,
    days: 0,
    subscription_type: "avulso",
    kind: "purchase",
    pricing: {
      base_amount: 100,
      charge_amount: 10,
      fee_percent: 4,
      fee_amount: 0.4,
      net_amount: 9.6,
      currency: "MZN",
      is_test_mode: true,
    },
  },
  {
    id: "jornal_mensal",
    name: "Acesso ao Jornal O Destaque",
    amount: 100,
    charge_amount: 10,
    days: 30,
    subscription_type: "mensal",
    kind: "subscription",
    pricing: {
      base_amount: 100,
      charge_amount: 10,
      fee_percent: 4,
      fee_amount: 0.4,
      net_amount: 9.6,
      currency: "MZN",
      is_test_mode: true,
    },
  },
];

export function isPurchasePlan(plan?: SubscriptionPlan | null) {
  return plan?.kind === "purchase" || plan?.id === "edicao_unica";
}
