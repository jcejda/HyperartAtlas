import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { get, del } from '../api/client';
import { getThomassonUrl } from '../utils/thomassonUrl';
import './MySubmissionsPage.css';

export default function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    async function fetchSubmissions() {
      const { data, error: err } = await get('/thomassons/my-submissions');
      if (err) {
        setError(err);
      } else {
        setSubmissions(data || []);
      }
      setLoading(false);
    }
    fetchSubmissions();
  }, []);

  const handleDelete = async (id) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }
    const { error: err } = await del(`/thomassons/${id}`);
    if (err) {
      setActionMessage(`Error deleting: ${err}`);
    } else {
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      setActionMessage('Submission deleted.');
    }
    setConfirmDelete(null);
    setTimeout(() => setActionMessage(null), 3000);
  };

  if (loading) {
    return <div className="loading">Loading submissions...</div>;
  }

  return (
    <div className="my-submissions-page content-container">
      <h1>My Submissions</h1>

      {actionMessage && <div className="action-message">{actionMessage}</div>}
      {error && <div className="error-message">{error}</div>}

      {submissions.length === 0 && !error ? (
        <div className="empty-state">
          <p>You haven&apos;t submitted any Thomassons yet.</p>
          <Link to="/submit" className="btn btn-primary">
            Submit your first sighting
          </Link>
        </div>
      ) : (
        <div className="submissions-list">
          <table className="submissions-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => {
                const title = s.title || 'Untitled';
                const date = s.created_at
                  ? new Date(s.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : '';

                return (
                  <tr key={s.id}>
                    <td className="submission-title-cell">
                      {s.primary_photo_url && (
                        <img
                          src={s.primary_photo_url}
                          alt=""
                          className="submission-thumb"
                        />
                      )}
                      <span>{title}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${s.status || 'pending'}`}>
                        {s.status || 'pending'}
                      </span>
                    </td>
                    <td className="submission-date">{date}</td>
                    <td>
                      <div className="submission-actions">
                        <Link to={getThomassonUrl(s)} className="view-link">
                          View
                        </Link>
                        <span className="delete-action">
                          <button
                            className="btn-delete-submission"
                            onClick={() => handleDelete(s.id)}
                          >
                            {confirmDelete === s.id ? 'Confirm Delete' : 'Delete'}
                          </button>
                          {confirmDelete === s.id && (
                            <button
                              className="btn-cancel-delete"
                              onClick={() => setConfirmDelete(null)}
                            >
                              Cancel
                            </button>
                          )}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
