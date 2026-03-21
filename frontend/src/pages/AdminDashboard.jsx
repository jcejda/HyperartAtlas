import { useState, useEffect, useCallback } from 'react';
import { get, post, put } from '../api/client';
import { getCategoryByValue } from '../utils/categories';
import categories from '../utils/categories';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [editFields, setEditFields] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchSubmissions = useCallback(async () => {
    const { data, error: err } = await get('/admin/submissions');
    if (err) {
      setError(err);
    } else {
      setSubmissions(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

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

    const { data, error: err } = await get(`/admin/submissions/${id}`);
    setDetailLoading(false);

    if (err) {
      setActionMessage(`Error loading detail: ${err}`);
    } else {
      setDetail(data);
      setEditFields({
        title: data.title || '',
        description: data.description || '',
        category: data.category || '',
      });
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    setActionMessage('');

    if (editFields.title !== detail.title || editFields.description !== detail.description || editFields.category !== detail.category) {
      const { error: editErr } = await put(`/admin/submissions/${id}`, {
        title: editFields.title,
        description: editFields.description,
        category: editFields.category,
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

  if (loading) {
    return <div className="loading">Loading submissions...</div>;
  }

  return (
    <div className="admin-dashboard content-container">
      <h1>Admin Dashboard</h1>
      <p className="admin-subtitle">Review pending Thomasson submissions.</p>

      {error && <div className="error-message">{error}</div>}

      {submissions.length === 0 && !error ? (
        <div className="empty-state">
          <p>No pending submissions to review.</p>
        </div>
      ) : (
        <div className="admin-submissions">
          {submissions.map((s) => {
            const cat = getCategoryByValue(s.category);
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
                    {s.primary_photo_url && (
                      <img
                        src={s.primary_photo_url}
                        alt=""
                        className="admin-thumb"
                      />
                    )}
                    <div className="admin-submission-info">
                      <span className="admin-submission-title">{title}</span>
                      <span className="admin-submission-meta">
                        <span
                          className="category-badge"
                          style={{ backgroundColor: cat.color }}
                        >
                          {cat.label}
                        </span>
                        {s.submitted_by_username && (
                          <span className="meta-user">by {s.submitted_by_username}</span>
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
                          <div className="form-group">
                            <label>Category</label>
                            <select
                              value={editFields.category}
                              onChange={(e) =>
                                setEditFields((prev) => ({ ...prev, category: e.target.value }))
                              }
                            >
                              {categories.map((c) => (
                                <option key={c.value} value={c.value}>
                                  {c.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="admin-location">
                            <strong>Location:</strong>{' '}
                            {detail.latitude?.toFixed(4)}, {detail.longitude?.toFixed(4)}
                          </div>
                        </div>

                        <div className="admin-actions">
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
