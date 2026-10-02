import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitComplaint } from '../services/complaintApi';

export default function SubmitComplaintPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: 3,
    urgency: 3,
    location: '',
    area: ''
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await submitComplaint(form);
      setSuccess(true);
      setTimeout(() => {
        navigate('/my-complaints');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Complaint submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-card">
        <h2>Submit a Complaint</h2>
        <p style={{ marginBottom: '24px', color: '#64748b' }}>
          Please provide detailed information about your complaint. The system will automatically calculate the priority based on severity and urgency.
        </p>

        {error && <div className="error-box">{error}</div>}
        {success && <div style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: '6px', padding: '10px 12px', marginBottom: '16px' }}>Complaint submitted successfully! Redirecting...</div>}

        <form onSubmit={handleSubmit}>
          {/* Complaint Details Section */}
          <div className="form-section">
            <div className="form-section-title">Complaint Details</div>
            
            <label>
              <strong>Title *</strong>
              <input
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Brief title of the complaint"
                required
              />
            </label>

            <label className="form-group-full">
              <strong>Description *</strong>
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Provide detailed information about the issue"
                required
              />
            </label>

            <div className="form-group">
              <label>
                <strong>Location *</strong>
                <input
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g., Main Street, Block A"
                required
                />
              </label>
                <label>
              <strong>Area / Ward *</strong>
                <input
                  value={form.area}
                  onChange={(e) => handleChange('area', e.target.value)}
                  placeholder="e.g., Ward 5, Central Zone"
                  required
                />
              </label>
            </div>
          </div>

          {/* Priority Factors Section */}
          <div className="form-section">
            <div className="form-section-title">Priority Factors</div>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: 0 }}>
              Rate the severity and urgency of your complaint. The system will analyze these factors to determine priority.
            </p>

            <div className="form-group">
              <div className="slider-group">
                <label>
                  <strong>Severity (1-5) *</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={form.severity}
                  onChange={(e) => handleChange('severity', Number(e.target.value))}
                  style={{ cursor: 'pointer' }}
                />
                <div className="slider-value">
                  <span>Impact Level:</span>
                  <span className="slider-badge">
                    {form.severity === 1 && 'Minor'}
                    {form.severity === 2 && 'Low'}
                    {form.severity === 3 && 'Medium'}
                    {form.severity === 4 && 'High'}
                    {form.severity === 5 && 'Critical'}
                  </span>
                </div>
              </div>

              <div className="slider-group">
                <label>
                  <strong>Urgency (1-5) *</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={form.urgency}
                  onChange={(e) => handleChange('urgency', Number(e.target.value))}
                  style={{ cursor: 'pointer' }}
                />
                <div className="slider-value">
                  <span>Time Sensitive:</span>
                  <span className="slider-badge">
                    {form.urgency === 1 && 'Low'}
                    {form.urgency === 2 && 'Moderate'}
                    {form.urgency === 3 && 'Normal'}
                    {form.urgency === 4 && 'High'}
                    {form.urgency === 5 && 'Immediate'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </div>
    </div>
  );
}

