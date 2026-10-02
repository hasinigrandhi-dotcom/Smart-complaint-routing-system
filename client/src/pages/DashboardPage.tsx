import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getMyComplaints } from '../services/complaintApi';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ComplaintItem {
  id: string;
  title: string;
  description?: string;
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

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('scrs_user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(storedUser));
    
    // Load complaints data for statistics
    const loadComplaints = async () => {
      try {
        const response = await getMyComplaints();
        setComplaints(response.complaints || []);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Unable to load complaints');
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('scrs_token');
    localStorage.removeItem('scrs_user');
    window.dispatchEvent(new Event('scrs-auth-change'));
    navigate('/login');
  };

  // Calculate statistics
  const stats = {
    total: complaints.length,
    submitted: complaints.filter(c => c.status === 'SUBMITTED').length,
    inProgress: complaints.filter(c => ['ASSIGNED', 'IN_PROGRESS', 'REVIEWING'].includes(c.status)).length,
    resolved: complaints.filter(c => c.status === 'RESOLVED').length
  };

  // Get recent complaints (last 5)
  const recentComplaints = complaints
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (!user && !loading) {
    return <div className="container"><p>Loading...</p></div>;
  }

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.name || 'Citizen'}!</h1>
          <p>Track your complaints and monitor their progress through the system.</p>
        </div>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>

      {/* Quick Stats */}
      <section className="dashboard-stats">
        <div className="stat-card" style={{ borderLeft: '4px solid #2563eb' }}>
          <div className="stat-label">Total Complaints</div>
          <div className="stat-value" style={{ color: '#2563eb' }}>{stats.total}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #0ea5e9' }}>
          <div className="stat-label">Submitted</div>
          <div className="stat-value" style={{ color: '#0ea5e9' }}>{stats.submitted}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-label">In Progress</div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.inProgress}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-label">Resolved</div>
          <div className="stat-value" style={{ color: '#10b981' }}>{stats.resolved}</div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <Link to="/submit-complaint" className="action-button primary">
          + Submit New Complaint
        </Link>
        <Link to="/my-complaints" className="action-button secondary">
          View All Complaints
        </Link>
      </section>

      {/* Recent Complaints */}
      <section className="recent-section">
        <h2>Recent Complaints</h2>

        {loading ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>Loading complaints...</p>
        ) : error ? (
          <div className="error-box">{error}</div>
        ) : recentComplaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No Complaints Yet</h3>
            <p>Submit your first complaint to start tracking it through the system.</p>
            <Link to="/submit-complaint" className="action-button primary">
              Submit Your First Complaint
            </Link>
          </div>
        ) : (
          <div className="recent-complaints-list">
            {recentComplaints.map((complaint) => (
              <div className="recent-complaint-card" key={complaint.id}>
                <div className="complaint-header-row">
                  <div>
                    <h3>{complaint.title}</h3>
                    <p className="complaint-id">ID: {complaint.id}</p>
                  </div>
                  <span className={`status-tag ${getStatusClassName(complaint.status)}`}>
                    {complaint.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="recent-complaint-details">
                  <div className="detail-item">
                    <span className="detail-label">Category</span>
                    <span className="detail-value">{complaint.category.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Priority</span>
                    <span className={`priority-badge ${getPriorityClassName(complaint.priorityLevel)}`}>
                      {complaint.priorityLevel.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Score</span>
                    <span className="detail-value">{complaint.priorityScore}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Department</span>
                    <span className="detail-value">{complaint.assignedDepartment?.name || 'Pending'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Submitted</span>
                    <span className="detail-value">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How SCRS Works */}
      <section className="how-it-works">
        <h2>How SCRS Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Submit</h3>
            <p>Fill out the complaint form with details and rate severity/urgency</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Calculate</h3>
            <p>System automatically calculates priority based on your inputs</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Route</h3>
            <p>Complaint is routed to the appropriate department automatically</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <h3>Track</h3>
            <p>Monitor progress and receive updates as your complaint progresses</p>
          </div>
        </div>
      </section>
    </div>
  );
}

