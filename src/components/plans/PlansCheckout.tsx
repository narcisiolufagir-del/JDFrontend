import { Check, Loader2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/hooks/useUserAccount";
import { isPurchasePlan } from "@/constants/plans";
import type { Jornal, SubscriptionPlan } from "@/types/api";

const BRAND = "#2B58C5";

type PlansCheckoutProps = {
  plans: SubscriptionPlan[];
  plansLoading: boolean;
  selectedPlan: string | null;
  selectedPlanData?: SubscriptionPlan;
  selectedJornal: Jornal | null;
  paymentStep: "form" | "pending" | "success" | "failed";
  msisdn: string;
  isSubmitting: boolean;
  onSelectPlan: (planId: string) => void;
  onMsisdnChange: (value: string) => void;
  onPay: () => void;
  onBack: () => void;
  onSuccessContinue: () => void;
};

export function PlansCheckout({
  plans,
  plansLoading,
  selectedPlan,
  selectedPlanData,
  selectedJornal,
  paymentStep,
  msisdn,
  isSubmitting,
  onSelectPlan,
  onMsisdnChange,
  onPay,
  onBack,
  onSuccessContinue,
}: PlansCheckoutProps) {
  if (!selectedPlan) {
    return (
      <div>
        {plansLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
            <div className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {plans.map((plan) => {
              const purchase = isPurchasePlan(plan);
              return (
                <Card
                  key={plan.id}
                  className="relative p-5 lg:p-6 bg-white border border-[#2B58C5]/30 shadow-sm cursor-pointer hover:border-[#2B58C5]/60 transition-colors"
                  onClick={() => onSelectPlan(plan.id)}
                >
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {purchase ? "Comprar esta edição" : plan.name}
                    </h3>
                    {purchase && (
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                        {selectedJornal
                          ? selectedJornal.titulo
                          : "Uma edição específica do jornal"}
                      </p>
                    )}
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold text-[#2B58C5]">
                        {formatMoney(plan.pricing.charge_amount)}
                      </span>
                      <span className="text-sm text-gray-400">
                        {purchase ? "/ edição" : `/ ${plan.days} dias`}
                      </span>
                    </div>
                    {plan.pricing.is_test_mode && (
                      <p className="text-xs text-amber-600 mt-2">
                        Modo teste — preço normal: {formatMoney(plan.amount)}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2 mb-5 text-sm text-gray-600">
                    {purchase ? (
                      <>
                        <li>• Acesso vitalício a esta edição</li>
                        <li>• Pagamento via M-Pesa (SkyWallet)</li>
                        <li>• Leitura imediata após confirmação</li>
                      </>
                    ) : (
                      <>
                        <li>• Todas as edições do jornal</li>
                        <li>• Pagamento via M-Pesa (SkyWallet)</li>
                        <li>• Acesso imediato após confirmação</li>
                      </>
                    )}
                  </ul>

                  <Button
                    className="w-full text-white hover:opacity-90"
                    style={{ backgroundColor: BRAND }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPlan(plan.id);
                    }}
                  >
                    {purchase ? "Comprar edição" : "Subscrever"}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (paymentStep === "success") {
    return (
      <div className="space-y-6 text-center py-8 max-w-md mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">
          {isPurchasePlan(selectedPlanData) ? "Edição comprada!" : "Assinatura activa!"}
        </h3>
        <p className="text-gray-500">
          {isPurchasePlan(selectedPlanData)
            ? "O pagamento foi confirmado. Já pode ler esta edição."
            : "O pagamento foi confirmado. Já pode aceder a todos os jornais."}
        </p>
        <Button
          className="text-white hover:opacity-90"
          style={{ backgroundColor: BRAND }}
          onClick={onSuccessContinue}
        >
          Começar a ler
        </Button>
      </div>
    );
  }

  return (
    <Card className="p-5 lg:p-6 bg-white border-[#2B58C5]/20 max-w-lg mx-auto">
      <h3 className="text-lg font-bold text-gray-900 mb-1">
        {isPurchasePlan(selectedPlanData) ? "Comprar edição" : `Plano: ${selectedPlanData?.name}`}
      </h3>
      {isPurchasePlan(selectedPlanData) && selectedJornal && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{selectedJornal.titulo}</p>
      )}

      {paymentStep === "pending" ? (
        <div className="text-center py-8 space-y-4">
          <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse mx-auto" />
          <p className="text-gray-900 font-medium">Aguardando confirmação M-Pesa...</p>
          <p className="text-sm text-gray-400">
            Confirme o pagamento no telemóvel <strong>{msisdn}</strong>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg bg-[#2B58C5]/5 border border-[#2B58C5]/20 p-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Preço do jornal</span>
              <span>{formatMoney(selectedPlanData?.pricing.base_amount ?? 0)}</span>
            </div>
            {selectedPlanData?.pricing.is_test_mode && (
              <div className="flex justify-between text-sm text-amber-600">
                <span>Valor de teste (gateway)</span>
                <span>{formatMoney(selectedPlanData.pricing.charge_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-600">
              <span>Taxa SkyWallet ({selectedPlanData?.pricing.fee_percent ?? 4}%)</span>
              <span>{formatMoney(selectedPlanData?.pricing.fee_amount ?? 0)}</span>
            </div>
            <div className="border-t border-[#2B58C5]/10 pt-2 flex justify-between font-semibold text-gray-900">
              <span>Total M-Pesa</span>
              <span>{formatMoney(selectedPlanData?.pricing.charge_amount ?? 0)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Número M-Pesa</label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="84xxxxxxx"
                value={msisdn}
                onChange={(e) => onMsisdnChange(e.target.value)}
                className="pl-10 bg-[#F0F2F6] border-0"
                disabled={isSubmitting}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Receberá um pedido M-Pesa neste número. Confirme para activar o acesso na hora.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="flex-1" disabled={isSubmitting}>
              Voltar
            </Button>
            <Button
              onClick={onPay}
              disabled={isSubmitting}
              className="flex-1 text-white hover:opacity-90"
              style={{ backgroundColor: BRAND }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  A enviar...
                </>
              ) : (
                "Pagar com M-Pesa"
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
  );
}
