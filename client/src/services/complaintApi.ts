const API_BASE_URL = 'https://smart-complaint-routing-system-g0dm.onrender.com/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('scrs_token');

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

export async function submitComplaint(payload: {
  title: string;
  description: string;
  severity: number;
  urgency: number;
  location: string;
  area?: string;
}) {
  return request<{ message: string; complaint: any }>('/complaints', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function getMyComplaints(params?: { status?: string; search?: string }) {
  const query = new URLSearchParams();

  if (params?.status) query.append('status', params.status);
  if (params?.search) query.append('search', params.search);

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request<{ complaints: any[] }>(`/complaints/my${suffix}`);
}

export async function getComplaintDetail(complaintId: string) {
  return request<{ complaint: any }>(`/complaints/${complaintId}`);
}
