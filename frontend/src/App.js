/**
 * Resume Website Builder - Main App
 * Enhanced prompting system for professional resume websites
 */
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ResumeBuilder from './components/ResumeBuilder';
import UsageDashboard from './components/UsageDashboard';
import Dashboard from './components/Dashboard/Dashboard';
import AuthModal from './components/Auth/AuthModal';
import './App.css';

function AppContent() {
  const { user, profile, signOut, loading, isConfigured } = useAuth();
  const [currentView, setCurrentView] = useState('landing');
  const [builderData, setBuilderData] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const LandingPage = () => (
    <div className="landing-page">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>🚀 Resume Website Builder</h2>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <button
              className="usage-btn"
              onClick={() => setCurrentView('usage')}
            >
              📊 Usage
            </button>
            {isConfigured && (
              user ? (
                <>
                  <button
                    className="dashboard-btn"
                    onClick={() => setCurrentView('dashboard')}
                  >
                    My Websites
                  </button>
                  <button
                    className="signout-btn"
                    onClick={signOut}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="login-btn"
                    onClick={() => openAuthModal('login')}
                  >
                    Log In
                  </button>
                  <button
                    className="signup-btn"
                    onClick={() => openAuthModal('signup')}
                  >
                    Sign Up
                  </button>
                </>
              )
            )}
            <button
              className="start-btn"
              onClick={() => setCurrentView('builder')}
            >
              Start Building →
            </button>
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1>Turn Your Resume Into a<br />Professional Website</h1>
            <p className="hero-subtitle">
              Stand out to recruiters with a custom website featuring your target company's name. 
              Show serious intent with domains like <strong>yourname-apple.com</strong> or <strong>yourname-google.com</strong>
            </p>
            
            <div className="hero-features">
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <span>Company-Specific Domains</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span>AI-Powered Design</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📱</span>
                <span>Mobile Responsive</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🚀</span>
                <span>SEO Optimized</span>
              </div>
            </div>

            <button 
              className="cta-button"
              onClick={() => setCurrentView('builder')}
            >
              Create Your Website Now
            </button>
            
            <p className="hero-note">
              💡 <strong>Colin's Business Model:</strong> Domain costs included in monthly pricing - no hidden fees!
            </p>
          </div>
          
          <div className="hero-visual">
            <div className="website-preview">
              <div className="browser-frame">
                <div className="browser-header">
                  <span className="browser-dots"></span>
                  <div className="url-bar">johnsmith-apple.com</div>
                </div>
                <div className="browser-content">
                  <div className="preview-hero">
                    <h3>John Smith</h3>
                    <p>Product Manager → Senior PM at Apple</p>
                    <div className="preview-cta">Hire Me for Apple</div>
                  </div>
                  <div className="preview-sections">
                    <div className="preview-section"></div>
                    <div className="preview-section"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="features" className="features-section">
        <div className="container">
          <h2>Why Resume Websites Get 3x More Interviews</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-header">
                <span className="feature-emoji">🎯</span>
                <h3>Company-Targeted Domains</h3>
              </div>
              <p>
                <strong>yourname-apple.com</strong> shows you researched the company and are serious about the role. 
                Recruiters remember targeted domains weeks later.
              </p>
              <div className="feature-examples">
                <span>sarahchen-google.com</span>
                <span>mikejones-tesla.com</span>
                <span>alexsmith-microsoft.com</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-header">
                <span className="feature-emoji">🤖</span>
                <h3>AI-Enhanced Content</h3>
              </div>
              <p>
                Smart content generation that emphasizes skills relevant to your target company. 
                Industry-specific keywords that ATS systems love.
              </p>
              <div className="feature-benefits">
                <span>✓ ATS-Friendly Content</span>
                <span>✓ Company-Specific Keywords</span>
                <span>✓ Quantified Achievements</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-header">
                <span className="feature-emoji">📊</span>
                <h3>Professional Design</h3>
              </div>
              <p>
                Choose from 5 professional templates designed for different industries. 
                Modern, responsive design that works on all devices.
              </p>
              <div className="design-styles">
                <span>Modern Tech</span>
                <span>Traditional Corporate</span>
                <span>Creative Portfolio</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="success-stories">
        <div className="container">
          <h2>Success Stories</h2>
          <div className="stories-grid">
            <div className="story-card">
              <div className="story-quote">
                "Got 3 interviews after sharing johnsmith-apple.com instead of my PDF resume. The recruiters remembered me!"
              </div>
              <div className="story-author">John S., Software Engineer → Apple</div>
            </div>
            <div className="story-card">
              <div className="story-quote">
                "My custom domain showed I was serious about the role. Got the job at Tesla!"
              </div>
              <div className="story-author">Mike J., Product Manager → Tesla</div>
            </div>
            <div className="story-card">
              <div className="story-quote">
                "Recruiters commented on my professional website during interviews. It set me apart."
              </div>
              <div className="story-author">Sarah C., Marketing → Google</div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="pricing-section">
        <div className="container">
          <h2>Simple, All-Inclusive Pricing</h2>
          <p className="pricing-subtitle">Domain costs included - no hidden fees or commission dependencies</p>
          
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="plan-header">
                <h3>Basic</h3>
                <div className="price">$39<span>/month</span></div>
              </div>
              <div className="plan-features">
                <span>✓ .com domain included</span>
                <span>✓ Professional website</span>
                <span>✓ Mobile responsive</span>
                <span>✓ Basic templates</span>
                <span>✓ Email support</span>
              </div>
              <button className="plan-button">Start Basic</button>
            </div>

            <div className="pricing-card featured">
              <div className="plan-badge">Most Popular</div>
              <div className="plan-header">
                <h3>Pro</h3>
                <div className="price">$89<span>/month</span></div>
              </div>
              <div className="plan-features">
                <span>✓ Premium domain (.dev, .io)</span>
                <span>✓ AI content optimization</span>
                <span>✓ Advanced templates</span>
                <span>✓ Company research integration</span>
                <span>✓ Analytics dashboard</span>
                <span>✓ Priority support</span>
              </div>
              <button className="plan-button">Start Pro</button>
            </div>

            <div className="pricing-card">
              <div className="plan-header">
                <h3>Enterprise</h3>
                <div className="price">$219<span>/month</span></div>
              </div>
              <div className="plan-features">
                <span>✓ Multiple domains</span>
                <span>✓ White-label branding</span>
                <span>✓ Custom integrations</span>
                <span>✓ Dedicated support</span>
                <span>✓ Team collaboration</span>
              </div>
              <button className="plan-button">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>🚀 Resume Website Builder</h4>
              <p>Turn your resume into a professional website that gets interviews.</p>
            </div>
            <div className="footer-section">
              <h5>Product</h5>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#templates">Templates</a>
            </div>
            <div className="footer-section">
              <h5>Business Model</h5>
              <p>Domain costs included in service pricing for predictable revenue and better customer experience.</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Resume Website Builder. Built by Colin with Jarvis 🔮</p>
          </div>
        </div>
      </footer>
    </div>
  );

  return (
    <div className="App">
      {currentView === 'landing' && <LandingPage />}
      {currentView === 'builder' && (
        <div className="builder-container">
          <button 
            className="back-button"
            onClick={() => setCurrentView('landing')}
          >
            ← Back to Home
          </button>
          <ResumeBuilder 
            onComplete={setBuilderData}
            onBack={() => setCurrentView('landing')}
          />
        </div>
      )}
      {currentView === 'usage' && (
        <div className="usage-container">
          <button
            className="back-button"
            onClick={() => setCurrentView('landing')}
          >
            ← Back to Home
          </button>
          <UsageDashboard />
        </div>
      )}
      {currentView === 'dashboard' && user && (
        <Dashboard
          onCreateNew={() => setCurrentView('builder')}
          onBack={() => setCurrentView('landing')}
        />
      )}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;