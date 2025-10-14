import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, RefreshCw } from 'lucide-react';
import type { Subscription } from '@/types/api';

interface SubscriptionInfoProps {
  subscription: Subscription;
}

export const SubscriptionInfo: React.FC<SubscriptionInfoProps> = ({ subscription }) => {
  const getRenewalDays = (type: string): number => {
    switch (type) {
      case 'diario': return 1;
      case 'semanal': return 7;
      case 'mensal': return 30;
      case 'anual': return 365;
      default: return 30;
    }
  };

  const renewalDays = getRenewalDays(subscription.subscription_type);
  const endDate = new Date(subscription.end_date);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Assinatura {subscription.subscription_type}
          </CardTitle>
          <Badge variant={subscription.is_active ? "default" : "secondary"}>
            {subscription.is_active ? "Ativa" : "Inativa"}
          </Badge>
        </div>
        <CardDescription>
          Renovação automática a cada {renewalDays} {renewalDays === 1 ? 'dia' : 'dias'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Início:</span>
            <span>{new Date(subscription.start_date).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Expira em:</span>
            <span>{endDate.toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Dias restantes:</span>
            <span className={daysUntilExpiry <= 3 ? "text-orange-500 font-semibold" : ""}>
              {daysUntilExpiry} dias
            </span>
          </div>
          {daysUntilExpiry <= 3 && (
            <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-2 rounded">
              <RefreshCw className="h-4 w-4" />
              Renovação automática em breve
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

