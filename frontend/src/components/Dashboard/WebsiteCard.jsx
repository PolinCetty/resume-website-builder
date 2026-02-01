import React, { useState } from 'react';

const WebsiteCard = ({ site, onView, onDelete }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this website?')) return;
    setDeleting(true);
    await onDelete(site.id);
  };

  const formData = site.form_data || {};
  const domainData = site.domain_data || {};

  return (
    <div className="website-card">
      <div className="card-header">
        <h3>{formData.fullName || 'Untitled Website'}</h3>
        <span className={`status-badge status-${site.status}`}>
          {site.status}
        </span>
      </div>

      <div className="card-meta">
        <p className="target-info">
          {formData.targetRole} at {formData.targetCompany}
        </p>
        {site.domain && (
          <p className="domain-info">{site.domain}</p>
        )}
        <p className="date-info">
          Created: {new Date(site.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="card-preview">
        {showPreview && site.current_html ? (
          <iframe
            srcDoc={site.current_html}
            title="Website Preview"
            className="preview-frame"
            sandbox="allow-scripts"
          />
        ) : (
          <div className="preview-placeholder" onClick={() => setShowPreview(true)}>
            <span>Click to preview</span>
          </div>
        )}
      </div>

      <div className="card-actions">
        <button onClick={() => onView(site)} className="btn-view">
          View Details
        </button>
        <button
          onClick={() => {
            const blob = new Blob([site.current_html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${formData.fullName?.replace(/\s+/g, '-').toLowerCase() || 'website'}.html`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="btn-download"
        >
          Download
        </button>
        <button
          onClick={handleDelete}
          className="btn-delete"
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

export default WebsiteCard;
