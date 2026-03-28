import { useState, useEffect, useCallback } from 'react';
import { get, post, put, del } from '../api/client';
import './AdminDashboard.css';

const STATUS_TABS = [
  { key: 'pending_review', label: 'Pending Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending_review');
  const [expandedId, setExpandedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [editFields, setEditFields] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchSubmissions = useCallback(async (status) => {
    setLoading(true);
    setError(null);
    setExpandedId(null);
    setDetail(null);
    setActionMessage('');
    const { data, error: err } = await get(`/admin/submissions?status=${status}`);
    if (err) {
      setError(err);
    } else {
      setSubmissions(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSubmissions(activeTab);
  }, [activeTab, fetchSubmissions]);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
      return;
    }

    setExpandedId(id);
    setDetail(null);
    setDetailLoading(true);
    setRejectNote('');
    setActionMessage('');
    setConfirmDelete(null);

    const { data, error: err } = await get(`/admin/submissions/${id}`);
    setDetailLoading(false);

    if (err) {
      setActionMessage(`Error loading detail: ${err}`);
    } else {
      setDetail(data);
      setEditFields({
        title: data.title || '',
        description: data.description || '',
      });
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    setActionMessage('');

    if (editFields.title !== detail.title || editFields.description !== detail.description) {
      const { error: editErr } = await put(`/admin/submissions/${id}`, {
        title: editFields.title,
        description: editFields.description,
      });
      if (editErr) {
        setActionMessage(`Error updating fields: ${editErr}`);
        setActionLoading(false);
        return;
      }
    }

    const { error: err } = await post(`/admin/submissions/${id}/approve`);
    setActionLoading(false);

    if (err) {
      setActionMessage(`Error approving: ${err}`);
    } else {
      setActionMessage('Submission approved.');
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      setExpandedId(null);
      setDetail(null);
    }
  };

  const handleReject = async (id) => {
    if (!rejectNote.trim()) {
      setActionMessage('Please provide a reason for rejection.');
      return;
    }

    setActionLoading(true);
    setActionMessage('');

    const { error: err } = await post(`/admin/submissions/${id}/reject`, {
      review_note: rejectNote.trim(),
    });
    setActionLoading(false);

    if (err) {
      setActionMessage(`Error rejecting: ${err}`);
    } else {
      setActionMessage('Submission rejected.');
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      setExpandedId(null);
      setDetail(null);
    }
  };

  const handleDelete = async (id) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }

    setActionLoading(true);
    setActionMessage('');

    const { error: err } = await del(`/admin/submissions/${id}`);
    setActionLoading(false);

    if (err) {
      setActionMessage(`Error deleting: ${err}`);
    } else {
      setActionMessage('Submission deleted.');
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      setExpandedId(null);
      setDetail(null);
    }
    setConfirmDelete(null);
  };

  return (
    <div className="admin-dashboard content-container">
      <h1>Admin Dashboard</h1>
      <p className="admin-subtitle">Manage Thomasson submissions.</p>

      <div className="admin-tabs">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`admin-tab ${activeTab === tab.key ? 'admin-tab--active' : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading submissions...</div>
      ) : submissions.length === 0 && !error ? (
        <div className="empty-state">
          <p>No {STATUS_TABS.find((t) => t.key === activeTab)?.label.toLowerCase()} submissions.</p>
        </div>
      ) : (
        <div className="admin-submissions">
          {submissions.map((s) => {
            const title = s.title || 'Untitled';
            const date = s.created_at
              ? new Date(s.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : '';
            const isExpanded = expandedId === s.id;

            return (
              <div key={s.id} className={`admin-submission-card ${isExpanded ? 'expanded' : ''}`}>
                <button
                  className="admin-submission-header"
                  onClick={() => handleExpand(s.id)}
                >
                  <div className="admin-submission-left">
                    {s.photos?.[0]?.file_url && (
                      <img
                        src={s.photos[0].file_url}
                        alt=""
                        className="admin-thumb"
                      />
                    )}
                    <div className="admin-submission-info">
                      <span className="admin-submission-title">{title}</span>
                      <span className="admin-submission-meta">
                        {s.submitter_username && (
                          <span className="meta-user">by {s.submitter_username}</span>
                        )}
                        {date && <span className="meta-date">{date}</span>}
                      </span>
                    </div>
                  </div>
                  <span className="expand-icon">{isExpanded ? '\u25B2' : '\u25BC'}</span>
                </button>

                {isExpanded && (
                  <div className="admin-submission-detail">
                    {detailLoading ? (
                      <div className="loading">Loading details...</div>
                    ) : detail ? (
                      <>
                        {detail.photos && detail.photos.length > 0 && (
                          <div className="admin-photos">
                            {detail.photos.map((photo, i) => (
                              <img
                                key={i}
                                src={photo.file_url || photo}
                                alt={`Photo ${i + 1}`}
                                className="admin-photo"
                              />
                            ))}
                          </div>
                        )}

                        {activeTab === 'pending_review' && (
                          <div className="admin-edit-section">
                            <h3>Edit before approving</h3>
                            <div className="form-group">
                              <label>Title</label>
                              <input
                                type="text"
                                value={editFields.title}
                                onChange={(e) =>
                                  setEditFields((prev) => ({ ...prev, title: e.target.value }))
                                }
                              />
                            </div>
                            <div className="form-group">
                              <label>Description</label>
                              <textarea
                                value={editFields.description}
                                onChange={(e) =>
                                  setEditFields((prev) => ({ ...prev, description: e.target.value }))
                                }
                              />
                            </div>
                            <div className="admin-location">
                              <strong>Location:</strong>{' '}
                              {detail.latitude?.toFixed(4)}, {detail.longitude?.toFixed(4)}
                            </div>
                          </div>
                        )}

                        {activeTab !== 'pending_review' && (
                          <div className="admin-readonly-info">
                            <div className="admin-location">
                              <strong>Location:</strong>{' '}
                              {detail.latitude?.toFixed(4)}, {detail.longitude?.toFixed(4)}
                            </div>
                            {detail.description && (
                              <div className="admin-description">
                                <strong>Description:</strong>
                                <p>{detail.description}</p>
                              </div>
                            )}
                            {detail.review_note && (
                              <div className="admin-review-note">
                                <strong>Review note:</strong>
                                <p>{detail.review_note}</p>
                              </div>
                            )}
                            {detail.reviewer_username && (
                              <div className="admin-reviewer">
                                <strong>Reviewed by:</strong> {detail.reviewer_username}
                                {detail.reviewed_at && (
                                  <span> on {new Date(detail.reviewed_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="admin-actions">
                          {activeTab === 'pending_review' && (
                            <>
                              <div className="admin-actions-row">
                                <button
                                  className="btn btn-success"
                                  onClick={() => handleApprove(s.id)}
                                  disabled={actionLoading}
                                >
                                  {actionLoading ? 'Processing...' : 'Approve'}
                                </button>
                              </div>

                              <div className="admin-reject-section">
                                <label className="reject-label">Rejection note:</label>
                                <textarea
                                  className="reject-textarea"
                                  value={rejectNote}
                                  onChange={(e) => setRejectNote(e.target.value)}
                                  placeholder="Reason for rejection (required)..."
                                  rows={2}
                                />
                                <button
                                  className="btn btn-danger"
                                  onClick={() => handleReject(s.id)}
                                  disabled={actionLoading}
                                >
                                  Reject
                                </button>
                              </div>
                            </>
                          )}

                          <div className="admin-delete-section">
                            <button
                              className="btn btn-danger"
                              onClick={() => handleDelete(s.id)}
                              disabled={actionLoading}
                            >
                              {confirmDelete === s.id
                                ? 'Click again to confirm deletion'
                                : 'Delete Submission'}
                            </button>
                            {confirmDelete === s.id && (
                              <button
                                className="btn btn-secondary"
                                onClick={() => setConfirmDelete(null)}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>

                        {actionMessage && (
                          <div
                            className={
                              actionMessage.startsWith('Error')
                                ? 'error-message'
                                : 'success-message'
                            }
                          >
                            {actionMessage}
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
