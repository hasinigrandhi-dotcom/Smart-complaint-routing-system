import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assignComplaintDepartment, getAdminDashboard, updateComplaintStatus } from '../services/adminApi';

interface DepartmentItem {
  id: string;
  name: string;
  code: string;
  description?: string | null;
}

interface ComplaintItem {
  id: string;
  title: string;
  category: string;
  severity: number;
  urgency: number;
  priorityScore: number;
  priorityLevel: string;
  status: string;
  assignedDepartment?: {
    id: string;
    name: string;
    code: string;
  } | null;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

function getPriorityClassName(levelStr: string): string {
  const level = levelStr?.toUpperCase() || '';
  if (level === 'CRITICAL') return 'priority-critical';
  if (level === 'HIGH') return 'priority-high';
  if (level === 'MEDIUM') return 'priority-medium';
  if (level === 'LOW') return 'priority-low';
  if (level === 'VERY LOW' || level === 'VERY_LOW') return 'priority-very-low';
  return 'priority-medium';
}

function getStatusClassName(status: string): string {
  return status?.toLowerCase().replace('_', '_') || '';
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ role?: string; name?: string } | null>(null);
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN';

  const loadDashboard = async () => {
    const storedUser = localStorage.getItem('scrs_user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    if (parsedUser.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }

    setLoading(true);
    try {
      const response = await getAdminDashboard({
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        priority: priorityFilter || undefined,
        department: departmentFilter || undefined,
        search: search || undefined
      });
      setComplaints(response.complaints || []);
      setDepartments(response.departments || []);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Unable to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, [statusFilter, categoryFilter, priorityFilter, departmentFilter, search]);

  const summary = useMemo(() => {
    return {
      total: complaints.length,
      submitted: complaints.filter((item) => item.status === 'SUBMITTED').length,
      inProgress: complaints.filter((item) => ['ASSIGNED', 'IN_PROGRESS', 'REVIEWING'].includes(item.status)).length,
      resolved: complaints.filter((item) => item.status === 'RESOLVED').length,
      escalated: complaints.filter((item) => item.status === 'ESCALATED').length
    };
  }, [complaints]);

  const handleStatusChange = async (complaintId: string, status: string) => {
    try {
      setUpdatingId(complaintId);
      await updateComplaintStatus(complaintId, status, `Status updated to ${status}`);
      await loadDashboard();
    } catch (err: any) {
      setError(err.message || 'Unable to update complaint status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDepartmentChange = async (complaintId: string, departmentId: string) => {
    if (!departmentId) return;
    try {
      setUpdatingId(complaintId);
      await assignComplaintDepartment(complaintId, departmentId, 'Assigned by administrator');
      await loadDashboard();
    } catch (err: any) {
      setError(err.message || 'Unable to assign department');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('scrs_token');
    localStorage.removeItem('scrs_user');
    window.dispatchEvent(new Event('scrs-auth-change'));
    navigate('/login');
  };

  if (!isAdmin && !loading) {
    return <div className="container"><p>Redirecting...</p></div>;
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Welcome, {user?.name || 'Administrator'}. Manage complaints across all departments.</p>
        </div>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* Summary Metrics */}
      <div className="admin-metrics">
        <div className="metric-card" style={{ borderLeft: '4px solid #2563eb' }}>
          <strong style={{ color: '#2563eb' }}>{summary.total}</strong>
          <span>Total Complaints</span>
        </div>
        <div className="metric-card" style={{ borderLeft: '4px solid #0ea5e9' }}>
          <strong style={{ color: '#0ea5e9' }}>{summary.submitted}</strong>
          <span>Submitted</span>
        </div>
        <div className="metric-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <strong style={{ color: '#f59e0b' }}>{summary.inProgress}</strong>
          <span>In Progress</span>
        </div>
        <div className="metric-card" style={{ borderLeft: '4px solid #10b981' }}>
          <strong style={{ color: '#10b981' }}>{summary.resolved}</strong>
          <span>Resolved</span>
        </div>
        <div className="metric-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <strong style={{ color: '#ef4444' }}>{summary.escalated}</strong>
          <span>Escalated</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-panel admin-filters">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, citizen name, or ID..."
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="REVIEWING">Reviewing</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="REJECTED">Rejected</option>
          <option value="ESCALATED">Escalated</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          <option value="WATER_SUPPLY">Water Supply</option>
          <option value="ROADS">Roads</option>
          <option value="ELECTRICITY">Electricity</option>
          <option value="SANITATION">Sanitation</option>
          <option value="GARBAGE">Garbage</option>
          <option value="PUBLIC_SAFETY">Public Safety</option>
          <option value="STREET_LIGHTS">Street Lights</option>
          <option value="OTHER">Other</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
          <option value="VERY LOW">Very Low</option>
        </select>
        <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name} ({department.code})
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error-box">{error}</div>}

      {/* Complaint List */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>Loading admin dashboard...</p>
      ) : complaints.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
          <p style={{ fontSize: '1.1rem' }}>No complaints match the selected filters.</p>
        </div>
      ) : (
        <div className="complaint-list">
          {complaints.map((complaint) => (
            <div className="complaint-card" key={complaint.id}>
              {/* Header */}
              <div className="complaint-header-row">
                <div>
                  <h3>{complaint.title}</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                    ID: {complaint.id}
                  </p>
                </div>
                <span className={`status-tag ${getStatusClassName(complaint.status)}`}>
                  {complaint.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Citizen Info */}
              <div className="complaint-section">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div className="complaint-input-label">Reported By</div>
                    <div className="complaint-input-value">
                      {complaint.user?.name || 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <div className="complaint-input-label">Email</div>
                    <div className="complaint-input-value">
                      {complaint.user?.email || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Complaint Details - Citizen Input */}
              <div className="complaint-input-group">
                <div className="section-label">Complaint Details (Citizen Input)</div>
                <div className="complaint-input-item">
                  <div className="complaint-input-label">Category</div>
                  <div className="complaint-input-value">
                    {complaint.category.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="complaint-input-item">
                  <div className="complaint-input-label">Severity</div>
                  <div className="complaint-input-value">{complaint.severity}/5</div>
                </div>
                <div className="complaint-input-item">
                  <div className="complaint-input-label">Urgency</div>
                  <div className="complaint-input-value">{complaint.urgency}/5</div>
                </div>
                <div className="complaint-input-item">
                  <div className="complaint-input-label">Submitted</div>
                  <div className="complaint-input-value">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* System Calculated Priority */}
              <div className="complaint-priority-group">
                <div className="section-label">System-Calculated Priority</div>
                <div className="priority-score">
                  <span>Score: <strong>{complaint.priorityScore}</strong></span>
                  <span className={`priority-badge ${getPriorityClassName(complaint.priorityLevel)}`}>
                    {complaint.priorityLevel.replace(/_/g, ' ')}
                  </span>
                </div>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#78350f' }}>
                  Based on severity, urgency, and department workload analysis
                </p>
              </div>

              {/* Admin Actions */}
              <div className="complaint-section">
                <div className="section-label">Admin Actions</div>
                <div className="admin-actions">
                  <label>
                    <strong>Update Status</strong>
                    <select
                      value={complaint.status}
                      onChange={(e) => void handleStatusChange(complaint.id, e.target.value)}
                      disabled={updatingId === complaint.id}
                    >
                      <option value="SUBMITTED">Submitted</option>
                      <option value="REVIEWING">Reviewing</option>
                      <option value="ASSIGNED">Assigned</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="ESCALATED">Escalated</option>
                    </select>
                  </label>

                  <label>
                    <strong>Assign Department</strong>
                    <select
                      value={complaint.assignedDepartment?.id || ''}
                      onChange={(e) => void handleDepartmentChange(complaint.id, e.target.value)}
                      disabled={updatingId === complaint.id}
                    >
                      <option value="">-- Unassigned --</option>
                      {departments.map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.name} ({department.code})
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              {/* Current Assignment */}
              {complaint.assignedDepartment && (
                <div className="complaint-section">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                      Currently Assigned To
                    </span>
                    <span
                      style={{
                        background: '#dbeafe',
                        color: '#1d4ed8',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      {complaint.assignedDepartment.name} ({complaint.assignedDepartment.code})
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
