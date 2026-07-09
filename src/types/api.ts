export interface User {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  tipo_subscricao?: 'diario' | 'semanal' | 'mensal' | 'anual';
  tipo_usuario: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Jornal {
  id: number;
  titulo: string;
  capa?: string;
  arquivopdf: string;
  data_publicacao: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Subscription {
  id: number;
  user_id: number;
  subscription_type: 'diario' | 'semanal' | 'mensal' | 'anual';
  start_date: string;
  end_date: string;
  is_active: boolean;
  payment_method: 'digital' | 'fisico';
  created_at: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  telefone: string;
  email: string;
  senha: string;
  tipo_subscricao?: 'diario' | 'semanal' | 'mensal' | 'anual';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface CreateJornalRequest {
  titulo: string;
  capa?: File;
  arquivopdf: File;
}

export interface CreateSubscriptionRequest {
  user_id: number;
  subscription_type: 'diario' | 'semanal' | 'mensal' | 'anual';
  payment_method?: 'digital' | 'fisico';
}

export type SubscriptionType = 'jornal_mensal';

export interface PlanPricing {
  base_amount: number;
  charge_amount: number;
  fee_percent: number;
  fee_amount: number;
  net_amount: number;
  currency: string;
  is_test_mode: boolean;
}

export interface SubscriptionPlan {
  id: SubscriptionType;
  name: string;
  amount: number;
  charge_amount: number;
  days: number;
  subscription_type: 'diario' | 'semanal' | 'mensal' | 'anual';
  pricing: PlanPricing;
}

export interface SubscriptionRequestCreate {
  subscription_type: 'diario' | 'semanal' | 'mensal' | 'anual';
  payment_reference?: string;
}

export type SubscriptionRequestStatus = 'pending' | 'approved' | 'rejected';

export interface SubscriptionRequest {
  id: number;
  user_id: number;
  subscription_type: 'diario' | 'semanal' | 'mensal' | 'anual';
  status: SubscriptionRequestStatus;
  payment_reference?: string;
  observacao_admin?: string;
  approved_by?: number;
  approved_at?: string;
  created_at: string;
}

export interface PaymentStartRequest {
  plan_id: SubscriptionType;
  msisdn?: string;
}

export interface PaymentStatusResponse {
  order_id: string;
  plan_id: string;
  plan_name: string;
  amount: number;
  currency: string;
  status: string;
  success: boolean;
  fulfilled: boolean;
  msisdn: string;
  created_at: string;
  pricing?: PlanPricing;
  subscription?: Subscription;
}

export interface JornalPurchase {
  id: number;
  user_id: number;
  jornal_id: number;
  created_at: string;
}
