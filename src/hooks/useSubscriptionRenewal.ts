import { useEffect, useCallback } from 'react';
import { userAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export const useSubscriptionRenewal = () => {
  const { user, isAdmin } = useAuth();

  const calculateRenewalDays = useCallback((subscriptionType: string): number => {
    switch (subscriptionType) {
      case 'diario':
        return 1;
      case 'semanal':
        return 7;
      case 'mensal':
        return 30;
      case 'anual':
        return 365;
      default:
        return 30; // Default to monthly
    }
  }, []);

  const checkAndRenewSubscriptions = useCallback(async () => {
    if (!user || isAdmin) return;

    try {
      const subscriptions = await userAPI.getMySubscriptions();
      const now = new Date();
      
      for (const subscription of subscriptions) {
        if (!subscription.is_active) continue;
        
        const endDate = new Date(subscription.end_date);
        const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const renewalDays = calculateRenewalDays(subscription.subscription_type);
        
        // If subscription expires today or has expired, renew it
        if (daysUntilExpiry <= 0) {
          try {
            console.log(`Renovando assinatura ${subscription.id} (${subscription.subscription_type})`);
            await userAPI.renewSubscription(subscription.id);
          } catch (error) {
            console.error(`Erro ao renovar assinatura ${subscription.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar assinaturas:', error);
    }
  }, [user, isAdmin, calculateRenewalDays]);

  useEffect(() => {
    if (!user || isAdmin) return;

    // Check subscriptions immediately
    checkAndRenewSubscriptions();

    // Set up interval to check every hour
    const interval = setInterval(checkAndRenewSubscriptions, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkAndRenewSubscriptions]);

  return {
    checkAndRenewSubscriptions,
    calculateRenewalDays,
  };
};

