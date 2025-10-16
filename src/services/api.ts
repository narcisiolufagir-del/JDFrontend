import axios from 'axios';
import { 
  User, 
  Jornal, 
  Subscription, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  CreateSubscriptionRequest 
} from '@/types/api';

const API_BASE_URL = 'https://jdbackend-production.up.railway.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to convert FastAPI/Pydantic errors into a readable string
function extractErrorMessage(err: any): string {
  const data = err?.response?.data;
  
  // Common FastAPI detail as string
  if (typeof data?.detail === 'string') return data.detail;
  
  // Pydantic v2 array shape (validation errors)
  if (Array.isArray(data)) {
    const msgs = data.map((e: any) => e?.msg || e?.detail).filter(Boolean);
    if (msgs.length) return msgs.join(' | ');
  }
  
  // detail could be an array/object
  if (data?.detail) {
    const d = data.detail;
    
    // Array of validation errors
    if (Array.isArray(d)) {
      const msgs = d.map((e: any) => {
        // Handle Pydantic validation error objects with keys: type, loc, msg, input, ctx
        if (e && typeof e === 'object') {
          return e.msg || e.detail || 'Erro de validação';
        }
        return e;
      }).filter(Boolean);
      if (msgs.length) return msgs.join(' | ');
    }
    
    // Single validation error object
    if (d && typeof d === 'object') {
      return d.msg || d.detail || 'Erro de validação';
    }
    
    // Convert to string if possible
    try { 
      return String(d); 
    } catch {
      return 'Erro de validação';
    }
  }
  
  // fallback to generic message or stringified data
  if (typeof data === 'string') return data;
  try { 
    return JSON.stringify(data) || err?.message || 'Erro inesperado.'; 
  } catch {
    return err?.message || 'Erro inesperado.';
  }
}

// Add token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // normalize message for UI consumers (toasts/JSX should use strings)
    const normalized = extractErrorMessage(error);
    // preserve original but ensure message is readable
    if (normalized && typeof normalized === 'string') {
      error.message = normalized;
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // keep current SPA route; optionally could navigate to login
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (data: LoginRequest): Promise<AuthResponse> =>
    api.post('/user/login', data).then(res => res.data),
  
  // IMPORTANT: register as normal user (non-admin)
  register: (data: RegisterRequest): Promise<User> =>
    api.post('/user/register', data).then(res => res.data),
  
  logout: (): Promise<void> =>
    api.post('/user/logout').then(res => res.data),
  
  getCurrentUser: (): Promise<User> =>
    api.get('/user/me').then(res => res.data),
};

// Public/User endpoints
export const userAPI = {
  getPublicJornais: (params?: { skip?: number; limit?: number; busca?: string; data_inicio?: string; data_fim?: string }): Promise<Jornal[]> =>
    api.get('/user/public/jornais', { params }).then(res => res.data),
  
  getJornais: (params?: { skip?: number; limit?: number; data_inicio?: string; data_fim?: string }): Promise<Jornal[]> =>
    api.get('/user/jornais', { params }).then(res => res.data),
  
  getJornal: (id: number): Promise<Jornal> =>
    api.get(`/user/jornais/${id}`).then(res => res.data),
  
  createSubscription: (data: CreateSubscriptionRequest): Promise<Subscription> =>
    api.post('/user/subscriptions', data).then(res => res.data),
  
  getMySubscriptions: (): Promise<Subscription[]> =>
    api.get('/user/my-subscriptions').then(res => res.data),
  
  createSubscriptionRequest: (data: CreateSubscriptionRequest): Promise<any> =>
    api.post('/user/subscriptions/requests', data).then(res => res.data),
  
  getMySubscriptionRequests: (): Promise<any[]> =>
    api.get('/user/subscriptions/requests/my').then(res => res.data),
  
  // Auto-renew subscription based on type
  renewSubscription: (subscriptionId: number): Promise<Subscription> =>
    api.post(`/user/subscriptions/${subscriptionId}/renew`).then(res => res.data),
};

// Admin endpoints (mirror of JDFront)
export const adminAPI = {
  // Jornais
  createJornal: (formData: FormData): Promise<Jornal> =>
    api.post('/admin/jornais', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data),
  
  getJornais: (params?: { skip?: number; limit?: number }): Promise<Jornal[]> =>
    api.get('/admin/jornais', { params }).then(res => res.data),
  
  getJornal: (id: number): Promise<Jornal> =>
    api.get(`/admin/jornais/${id}`).then(res => res.data),
  
  updateJornal: (id: number, formData: FormData): Promise<Jornal> =>
    api.put(`/admin/jornais/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data),
  
  deleteJornal: (id: number): Promise<{ message: string }> =>
    api.delete(`/admin/jornais/${id}`).then(res => res.data),
  
  // Usuários
  getUsers: (params?: { skip?: number; limit?: number }): Promise<User[]> =>
    api.get('/admin/users', { params }).then(res => res.data),
  
  getUser: (id: number): Promise<User> =>
    api.get(`/admin/users/${id}`).then(res => res.data),
  
  updateUser: (id: number, data: Partial<User>): Promise<User> =>
    api.put(`/admin/users/${id}`, data).then(res => res.data),
  
  deleteUser: (id: number): Promise<{ message: string }> =>
    api.delete(`/admin/users/${id}`).then(res => res.data),
  
  // Assinaturas
  createSubscription: (data: CreateSubscriptionRequest): Promise<Subscription> =>
    api.post('/admin/subscriptions', data).then(res => res.data),
  
  getSubscriptions: (params?: { skip?: number; limit?: number }): Promise<Subscription[]> =>
    api.get('/admin/subscriptions', { params }).then(res => res.data),
  
  getSubscriptionRequests: (params?: { status_filter?: string; skip?: number; limit?: number }): Promise<any[]> =>
    api.get('/admin/subscriptions/requests', { params }).then(res => res.data),
  
  approveSubscriptionRequest: (id: number, body?: { observacao_admin?: string }): Promise<any> =>
    api.post(`/admin/subscriptions/requests/${id}/approve`, body).then(res => res.data),
  
  rejectSubscriptionRequest: (id: number, body?: { observacao_admin?: string }): Promise<any> =>
    api.post(`/admin/subscriptions/requests/${id}/reject`, body).then(res => res.data),
  
  // Configurações
  getSettings: (): Promise<any> =>
    api.get('/admin/settings').then(res => res.data),
  
  updateSettings: (settings: any): Promise<any> =>
    api.put('/admin/settings', settings).then(res => res.data),
  
  clearCache: (): Promise<{ message: string }> =>
    api.post('/admin/system/clear-cache').then(res => res.data),
  
  createBackup: (): Promise<{ message: string }> =>
    api.post('/admin/system/backup').then(res => res.data),
};

export default api;

// Helper to build full URL for files returned by the API.
export function buildFileUrl(filePath: string | null | undefined) {
  if (!filePath) return undefined;
  // If it's already an absolute URL, return as-is
  if (/^https?:\/\//i.test(filePath)) return filePath;
  const base = API_BASE_URL.replace(/\/$/, '');
  const normalized = filePath.replace(/\\\\/g, '/').replace(/^\//, '');
  return `https://jdbackend-production.up.railway.app/files/${normalized}`;
}
