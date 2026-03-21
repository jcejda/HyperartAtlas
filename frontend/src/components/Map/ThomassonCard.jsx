import { Link } from 'react-router-dom';
import { getCategoryByValue } from '../../utils/categories';
import '../ThomassonCard.css';

export default function ThomassonCard({ thomasson }) {
  const category = getCategoryByValue(thomasson.category);
  const title = thomasson.title || 'Untitled Thomasson';
  const date = thomasson.created_at
    ? new Date(thomasson.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <div className="thomasson-card">
      {thomasson.primary_photo_url && (
        <div className="thomasson-card-image">
          <img src={thomasson.primary_photo_url} alt={title} />
        </div>
      )}
      <div className="thomasson-card-body">
        <h3 className="thomasson-card-title">{title}</h3>
        <span
          className="category-badge"
          style={{ backgroundColor: category.color }}
        >
          {category.label}
        </span>
        <div className="thomasson-card-meta">
          {thomasson.submitted_by_username && (
            <span className="meta-user">by {thomasson.submitted_by_username}</span>
          )}
          {date && <span className="meta-date">{date}</span>}
        </div>
        <Link to={`/thomasson/${thomasson.id}`} className="thomasson-card-link">
          View Details &rarr;
        </Link>
      </div>
    </div>
  );
}
