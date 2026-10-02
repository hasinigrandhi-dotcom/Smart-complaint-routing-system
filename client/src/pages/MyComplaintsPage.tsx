import React, { useEffect, useState } from 'react';
import { getMyComplaints } from '../services/complaintApi';

interface ComplaintItem {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: number;
  urgency: number;
  status: string;
  priorityScore: number;
  priorityLevel: string;
  createdAt: string;
  updatedAt: string;
  location?: string;
  area?: string;
  assignedDepartment?: {
    name?: string;
    code?: string;
  } | null;
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

export default function MyComplaintsPage() {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadComplaints = async (nextStatus?: string, nextSearch?: string) => {
    setLoading(true);
    try {
      const response = await getMyComplaints({
        status: nextStatus || undefined,
        search: nextSearch || undefined
      });
      setComplaints(response.complaints || []);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Unable to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints(statusFilter, search);
  }, []);

  const handleFilter = () => {
    loadComplaints(statusFilter, search);
  };

  if (loading) {
    return (
      <div className="container">
        <p style={{ textAlign: 'center', color: '#64748b' }}>Loading your complaints...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-box">{error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>My Complaints</h2>

      <div className="filter-panel">
        <input
          type="text"
          placeholder="Search complaints by title or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
        <button onClick={handleFilter}>Apply Filters</button>
      </div>

      {complaints.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
          <p style={{ fontSize: '1.1rem' }}>No complaints match the current filters.</p>
          <p>Submit a new complaint to get started.</p>
        </div>
      ) : (
        <div className="complaint-list">
          {complaints.map((complaint) => (
            <div className="complaint-card" key={complaint.id}>
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

              {/* Complaint Description */}
              <div className="complaint-section">
                <p>{complaint.description}</p>
              </div>

              {/* Citizen Input Section */}
              <div className="complaint-input-group">
                <div className="section-label">Your Input</div>
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
                  <div className="complaint-input-label">Location</div>
                  <div className="complaint-input-value">{complaint.location || 'N/A'}</div>
                </div>
              </div>

              {/* System Calculated Priority Section */}
              <div className="complaint-priority-group">
                <div className="section-label">System Calculated Priority</div>
                <div className="priority-score">
                  <span>Score: {complaint.priorityScore}</span>
                  <span className={`priority-badge ${getPriorityClassName(complaint.priorityLevel)}`}>
                    {complaint.priorityLevel.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Assignment & Timeline Section */}
              <div className="complaint-section">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div className="complaint-input-label">Assigned Department</div>
                    <div className="complaint-input-value">
                      {complaint.assignedDepartment?.name || 'Pending Assignment'}
                    </div>
                  </div>
                  <div>
                    <div className="complaint-input-label">Area / Ward</div>
                    <div className="complaint-input-value">{complaint.area || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="complaint-section">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem' }}>
                  <div>
                    <div className="complaint-input-label">Submitted</div>
                    <div style={{ color: '#0f172a' }}>
                      {new Date(complaint.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="complaint-input-label">Last Updated</div>
                    <div style={{ color: '#0f172a' }}>
                      {new Date(complaint.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
