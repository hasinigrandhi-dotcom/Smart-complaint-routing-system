import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('scrs_token');

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Smart Complaint Routing System</h1>
          <p className="hero-subtitle">
            Efficiently manage and track public complaints with intelligent priority calculation and automatic department routing.
          </p>
          <p className="hero-description">
            Submit complaints about water supply, roads, electricity, sanitation, garbage, public safety, street lights, and more. 
            Our system automatically analyzes severity and urgency to determine priority and routes your complaint to the appropriate department.
          </p>

          {!isLoggedIn && (
            <div className="hero-cta">
              <button 
                className="cta-button primary" 
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
              <button 
                className="cta-button secondary" 
                onClick={() => navigate('/register')}
              >
                Create Account
              </button>
            </div>
          )}
          {isLoggedIn && (
            <button 
              className="cta-button primary" 
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </button>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>How SCRS Works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Submit Complaint</h3>
            <p>
              Provide complaint details including title, description, category, and your assessment of severity and urgency.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>Smart Priority Calculation</h3>
            <p>
              Our system analyzes severity and urgency levels to automatically calculate a priority score and level (Critical, High, Medium, Low, or Very Low).
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Department Routing</h3>
            <p>
              Using Dijkstra's shortest path algorithm, complaints are intelligently routed to the most appropriate department based on category and workload.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Complaint Tracking</h3>
            <p>
              Monitor your complaints in real-time. Track status updates including submitted, under review, assigned, in progress, resolved, or escalated.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Efficient Processing</h3>
            <p>
              Complaints are processed through a priority queue system ensuring critical issues are handled first, optimizing resource allocation.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Transparent Status Updates</h3>
            <p>
              Receive updates as your complaint moves through the system. Know exactly which department is handling your issue and current progress.
            </p>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="info-section">
        <div className="info-content">
          <h2>Why Use SCRS?</h2>
          <ul className="info-list">
            <li><strong>Intelligent Prioritization:</strong> No more first-come-first-served. Complex issues get the priority they deserve.</li>
            <li><strong>Right Department:</strong> Your complaint reaches the department that can actually help, reducing handoffs and delays.</li>
            <li><strong>Full Visibility:</strong> Track your complaint from submission to resolution with detailed status updates.</li>
            <li><strong>Data-Driven:</strong> Built with academic-grade data structures and algorithms for optimal performance.</li>
          </ul>
        </div>
      </section>

      {/* CTA Footer */}
      {!isLoggedIn && (
        <section className="cta-section">
          <h2>Ready to get your complaint heard?</h2>
          <p>Join thousands of citizens using SCRS to improve their communities.</p>
          <div className="cta-buttons">
            <button 
              className="cta-button primary" 
              onClick={() => navigate('/login')}
            >
              Login to SCRS
            </button>
            <button 
              className="cta-button secondary" 
              onClick={() => navigate('/register')}
            >
              Register Now
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

