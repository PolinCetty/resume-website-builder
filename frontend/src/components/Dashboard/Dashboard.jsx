import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import WebsiteCard from './WebsiteCard';
import './Dashboard.css';

const Dashboard = ({ onCreateNew, onBack }) => {
  const { user, profile } = useAuth();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);

  useEffect(() => {
    if (user) {
      fetchSites();
    }
  }, [user]);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSites(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (siteId) => {
    try {
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', siteId)
        .eq('user_id', user.id);

      if (error) throw error;
      setSites(sites.filter(s => s.id !== siteId));
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const websitesLimit = profile?.websites_limit || 1;
  const canCreateNew = sites.length < websitesLimit;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <button className="back-btn" onClick={onBack}>
          &larr; Back to Home
        </button>
        <h1>My Websites</h1>
        <div className="header-stats">
          <span className="stat">
            {sites.length} / {websitesLimit} websites
          </span>
          <span className="tier-badge">
            {profile?.subscription_tier || 'Free'} Plan
          </span>
        </div>
      </div>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      <div className="dashboard-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your websites...</p>
          </div>
        ) : sites.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h2>No websites yet</h2>
            <p>Create your first professional resume website to get started.</p>
            <button onClick={onCreateNew} className="create-btn">
              Create Your First Website
            </button>
          </div>
        ) : (
          <>
            <div className="dashboard-actions">
              {canCreateNew ? (
                <button onClick={onCreateNew} className="create-btn">
                  + Create New Website
                </button>
              ) : (
                <div className="limit-notice">
                  <p>You've reached your website limit.</p>
                  <button className="upgrade-btn">Upgrade Plan</button>
                </div>
              )}
            </div>

            <div className="websites-grid">
              {sites.map(site => (
                <WebsiteCard
                  key={site.id}
                  site={site}
                  onView={setSelectedSite}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {selectedSite && (
        <div className="site-detail-modal" onClick={() => setSelectedSite(null)}>
          <div className="site-detail" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedSite(null)}>
              &times;
            </button>
            <h2>{selectedSite.form_data?.fullName || 'Website Details'}</h2>

            <div className="detail-section">
              <h3>Target</h3>
              <p>{selectedSite.form_data?.targetRole} at {selectedSite.form_data?.targetCompany}</p>
            </div>

            {selectedSite.domain && (
              <div className="detail-section">
                <h3>Domain</h3>
                <p>{selectedSite.domain}</p>
              </div>
            )}

            <div className="detail-section">
              <h3>Status</h3>
              <span className={`status-badge status-${selectedSite.status}`}>
                {selectedSite.status}
              </span>
            </div>

            <div className="detail-section">
              <h3>Preview</h3>
              <iframe
                srcDoc={selectedSite.current_html}
                title="Full Preview"
                className="full-preview"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
