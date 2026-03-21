import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../api/client';
import { getCategoryByValue } from '../utils/categories';
import './MySubmissionsPage.css';

export default function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return <div className="loading">Loading submissions...</div>;
  }

  return (
    <div className="my-submissions-page content-container">
      <h1>My Submissions</h1>

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
                <th>Category</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
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
                      <span
                        className="category-badge"
                        style={{ backgroundColor: cat.color }}
                      >
                        {cat.label}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${s.status || 'pending'}`}>
                        {s.status || 'pending'}
                      </span>
                    </td>
                    <td className="submission-date">{date}</td>
                    <td>
                      <Link to={`/thomasson/${s.id}`} className="view-link">
                        View
                      </Link>
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
