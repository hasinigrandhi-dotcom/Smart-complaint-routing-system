const API_BASE_URL = 'http://localhost:4000/api';

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

export async function getAdminDashboard(params?: {
  status?: string;
  category?: string;
  priority?: string;
  department?: string;
  search?: string;
}) {
  const query = new URLSearchParams();

  if (params?.status) query.append('status', params.status);
  if (params?.category) query.append('category', params.category);
  if (params?.priority) query.append('priority', params.priority);
  if (params?.department) query.append('department', params.department);
  if (params?.search) query.append('search', params.search);

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request<{ complaints: any[]; departments: any[]; summary: any }>(`/admin/dashboard${suffix}`);
}

export async function updateComplaintStatus(complaintId: string, status: string, note?: string) {
  return request<{ message: string; complaint: any }>(`/admin/complaints/${complaintId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note })
  });
}

export async function assignComplaintDepartment(complaintId: string, departmentId: string, note?: string) {
  return request<{ message: string; complaint: any }>(`/admin/complaints/${complaintId}/assign-department`, {
    method: 'PATCH',
    body: JSON.stringify({ departmentId, note })
  });
}
