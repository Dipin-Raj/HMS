const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
}

class ApiService {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { requiresAuth = true, ...fetchConfig } = config;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(fetchConfig.headers || {}),
    };

    if (requiresAuth) {
      const token = this.getToken();
      if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchConfig,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.detail || error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

export const api = new ApiService(API_BASE_URL);
