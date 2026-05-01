const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

  // Auto-detect host for development (especially for Android Emulator)
  if (typeof window !== 'undefined') {
    const { hostname, protocol } = window.location;
    // If running from file system (bundled app), always use 10.0.2.2 for emulator
    if (protocol === 'file:') {
      return 'http://10.0.2.2:5000/api';
    }
    if (hostname === '10.0.2.2' || hostname === 'localhost' || hostname === '0.0.0.0') {
      return `http://${hostname}:5000/api`;
    }
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

export interface EstimateRequest {
  cartUrl?: string;
  cartTotal?: number;
  totalWeight?: number;
  mode: 'price' | 'weight';
  city?: string;
}

export interface EstimateResponse {
  success: boolean;
  data: {
    orderId: string;
    scrapeJobId: string;
    mode: string;
    city?: string;
    estimatedTotal: number;
    breakdown: {
      originalPrice: number;
      convertedPrice: number;
      weightFee: number;
      deliveryFee: number;
    };
    status: string;
  };
}

export interface EstimateConfigResponse {
  success: boolean;
  data: {
    settings: Settings;
    cities: City[];
    clothingItems: ClothingItem[];
  };
}

export interface OrderRequest {
  orderId: string;
  cartUrl?: string;
  mode: 'price' | 'weight';
  city?: string;
  contactMethod?: 'whatsapp' | 'messenger';
  contactInfo?: string;
  originalPrice?: number;
  convertedPrice?: number;
  weightFee?: number;
  deliveryFee?: number;
  totalEstimated?: number;
}

export interface Order {
  id: string;
  orderId: string;
  cartUrl: string;
  mode: string;
  city?: string;
  status: string;
  originalPrice?: number;
  convertedPrice?: number;
  weightFee?: number;
  deliveryFee?: number;
  totalEstimated?: number;
  cartSnapshot?: any;
  contactMethod?: string;
  contactInfo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface City {
  id: number;
  nameEn: string;
  nameAr: string;
}

export interface ClothingWeight {
  id: number;
  clothingItemId: number;
  labelEn: string;
  labelAr: string;
  weightKg: number;
}

export interface ClothingItem {
  id: number;
  nameEn: string;
  nameAr: string;
  weights: ClothingWeight[];
}

export interface Settings {
  id: string;
  libyanRate: number;
  perKgFee: number;
  itemWeights: Record<string, number>;
  cityFees: Record<string, number>;
}

export const api = {
  async getEstimateConfig(): Promise<EstimateConfigResponse['data']> {
    const response = await fetch(`${API_BASE_URL}/estimate/config`);
    if (!response.ok) throw new Error('Failed to fetch config');
    const result = await response.json();
    return result.success ? result.data : result;
  },

  async calculateEstimate(request: EstimateRequest): Promise<EstimateResponse> {
    const response = await fetch(`${API_BASE_URL}/estimate/price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error('Failed to calculate estimate');
    }

    return response.json();
  },

  async createOrder(request: OrderRequest): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    const result = await response.json();
    return result.data;
  },

  async getOrder(id: string): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }

    const result = await response.json();
    return result.data;
  },

  async getOrderByOrderId(orderId: string): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/order-id/${orderId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }

    const result = await response.json();
    return result.data;
  },

  async login(email: string, password: string): Promise<{ token: string; admin: any }> {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Failed to login');
    }

    const result = await response.json();
    return result.data;
  },

  async getSettings(token: string): Promise<Settings> {
    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }

    const result = await response.json();
    return result.data;
  },

  async updateSettings(token: string, settings: Partial<Settings>): Promise<Settings> {
    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    });

    if (!response.ok) {
      throw new Error('Failed to update settings');
    }

    const result = await response.json();
    return result.data;
  },

  async getAllOrders(token: string, status?: string): Promise<{ orders: Order[]; total: number }> {
    const url = status
      ? `${API_BASE_URL}/admin/orders?status=${status}`
      : `${API_BASE_URL}/admin/orders`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    const result = await response.json();
    return result.data;
  },

  async updateOrderStatus(token: string, id: string, status: string): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error('Failed to update order status');
    }

    const result = await response.json();
    return result.data;
  },

  async deleteOrder(token: string, id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/orders/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      throw new Error('Failed to delete order');
    }
  },

  async getCities(token: string): Promise<City[]> {
    const response = await fetch(`${API_BASE_URL}/admin/cities`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch cities');
    return (await response.json()).data;
  },

  async addCity(token: string, name_en: string, name_ar: string): Promise<City> {
    const response = await fetch(`${API_BASE_URL}/admin/cities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name_en, name_ar })
    });
    if (!response.ok) throw new Error('Failed to add city');
    return (await response.json()).data;
  },

  async deleteCity(token: string, id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/cities/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete city');
  },

  async getClothingItems(token: string): Promise<ClothingItem[]> {
    const response = await fetch(`${API_BASE_URL}/admin/clothing-items`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch clothing items');
    return (await response.json()).data;
  },

  async addClothingItem(token: string, name_en: string, name_ar: string): Promise<ClothingItem> {
    const response = await fetch(`${API_BASE_URL}/admin/clothing-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name_en, name_ar })
    });
    if (!response.ok) throw new Error('Failed to add clothing item');
    return (await response.json()).data;
  },

  async deleteClothingItem(token: string, id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/clothing-items/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete clothing item');
  },

  async addClothingWeight(token: string, itemId: number, data: { label_en: string; label_ar: string; weight_kg: number }): Promise<ClothingWeight> {
    const response = await fetch(`${API_BASE_URL}/admin/clothing-items/${itemId}/weights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to add weight');
    return (await response.json()).data;
  },

  async deleteClothingWeight(token: string, id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/clothing-weights/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete weight');
  }
};
