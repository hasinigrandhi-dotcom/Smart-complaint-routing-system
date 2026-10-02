const API_BASE_URL = 'http://localhost:4000/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data as T;
}

export async function registerUser(payload: { name: string; email: string; password: string; role?: 'USER' | 'ADMIN' }) {
  return request<{ message: string; token: string; user: { id: string; name: string; email: string; role: string } }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function loginUser(payload: { email: string; password: string }) {
  return request<{ message: string; token: string; user: { id: string; name: string; email: string; role: string } }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
