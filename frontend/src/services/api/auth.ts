import { LoginCredentials, User } from '@/types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const formatErrorDetail = (detail: unknown): string => {
  if (!detail) return 'Login failed';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && 'msg' in item) {
          return String((item as { msg?: unknown }).msg ?? '');
        }
        return '';
      })
      .filter(Boolean);
    return messages.length > 0 ? messages.join(', ') : 'Login failed';
  }
  if (typeof detail === 'object' && 'msg' in (detail as Record<string, unknown>)) {
    return String((detail as { msg?: unknown }).msg ?? 'Login failed');
  }
  return 'Login failed';
};

export const loginUser = async (credentials: LoginCredentials) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let detail = 'Login failed';

    if (errorText) {
      try {
        const errorData = JSON.parse(errorText);
        detail = formatErrorDetail(errorData.detail ?? errorData.message ?? detail);
      } catch {
        detail = errorText;
      }
    }

    throw new Error(detail);
  }

  return await response.json(); // Returns { access_token, token_type }
};

export const getMe = async (token: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }

  const data = await response.json();
  
  // The backend returns UserInDBBase, we need to map it to the frontend User type
  // This is a temporary mapping. Ideally the frontend and backend models are more in sync.
  return {
      id: data.id,
      name: data.username, // Assuming username as name for now
      email: data.email,
      role: data.role,
      avatar: data.username.charAt(0).toUpperCase(), // simple avatar
  };
};
