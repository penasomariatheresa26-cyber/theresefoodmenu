// API base URL - uses relative path in production, localhost in development
const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

// Helper function for API calls
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// ============================================
// MENU API
// ============================================

export interface ApiMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'meals' | 'drinks' | 'desserts' | 'sides';
  available: boolean;
  featured: boolean;
}

export const menuApi = {
  getAll: () => fetchAPI<ApiMenuItem[]>('/menu'),
  
  getById: (id: string) => fetchAPI<ApiMenuItem>(`/menu/${id}`),
  
  create: (item: ApiMenuItem) => 
    fetchAPI<ApiMenuItem>('/menu', {
      method: 'POST',
      body: JSON.stringify(item),
    }),
  
  update: (id: string, item: Partial<ApiMenuItem>) =>
    fetchAPI<ApiMenuItem>(`/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    }),
  
  delete: (id: string) =>
    fetchAPI<{ message: string }>(`/menu/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================
// ORDERS API
// ============================================

export interface ApiOrderItem {
  menuItem: ApiMenuItem;
  quantity: number;
}

export interface ApiOrder {
  id: string;
  customerName: string;
  address: string;
  phone: string;
  paymentMethod: 'e-wallet' | 'cash-on-delivery';
  status: 'pending' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
  total: number;
  createdAt: string;
  items: ApiOrderItem[];
}

export const ordersApi = {
  getAll: (userId?: string, isAdmin?: boolean) => {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    if (isAdmin) params.append('is_admin', 'true');
    return fetchAPI<ApiOrder[]>(`/orders?${params}`);
  },
  
  create: (order: {
    id: string;
    user_id: string;
    customer_name: string;
    address: string;
    phone: string;
    payment_method: string;
    total: number;
    items: ApiOrderItem[];
  }) =>
    fetchAPI<ApiOrder>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    }),
  
  updateStatus: (id: string, status: ApiOrder['status']) =>
    fetchAPI<ApiOrder>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// ============================================
// USERS API
// ============================================

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  walletBalance: number;
}

export interface AuthResponse {
  user: ApiUser;
  token: string;
}

export const usersApi = {
  register: (data: { email: string; password: string; name: string; is_admin?: boolean }) =>
    fetchAPI<AuthResponse>('/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  login: (data: { email: string; password: string }) =>
    fetchAPI<AuthResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getProfile: (id: string) => fetchAPI<ApiUser>(`/users/${id}`),
};

// ============================================
// WALLET API
// ============================================

export interface WalletTransaction {
  id: string;
  type: 'topup' | 'payment';
  amount: number;
  description: string;
  date: string;
}

export interface WalletData {
  balance: number;
  transactions: WalletTransaction[];
}

export interface WalletResponse {
  balance: number;
  transaction: WalletTransaction;
}

export const walletApi = {
  get: (userId: string) => fetchAPI<WalletData>(`/wallet/${userId}`),
  
  topUp: (userId: string, amount: number) =>
    fetchAPI<WalletResponse>(`/wallet/${userId}/topup`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),
  
  deduct: (userId: string, amount: number, description: string) =>
    fetchAPI<WalletResponse>(`/wallet/${userId}/deduct`, {
      method: 'POST',
      body: JSON.stringify({ amount, description }),
    }),
};

// ============================================
// HEALTH CHECK
// ============================================

export const healthApi = {
  check: () => fetchAPI<{ status: string; timestamp: string }>('/health'),
};
