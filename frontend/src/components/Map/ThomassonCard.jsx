import { getCategoryByValue } from '../../utils/categories';
import { getThomassonUrl } from '../../utils/thomassonUrl';
import '../ThomassonCard.css';

export default function ThomassonCard({ thomasson }) {
  const category = getCategoryByValue(thomasson.category);
  const title = thomasson.title || '';
  const dateSource = thomasson.discovery_date || thomasson.created_at;
  const dateLabel = thomasson.discovery_date ? 'Discovered' : 'Cataloged';
  const date = dateSource
    ? new Date(thomasson.discovery_date ? dateSource + 'T00:00:00' : dateSource).toLocaleDateString('en-US', {
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
<div className="thomasson-card-meta">
          {thomasson.username && (
            <span className="meta-user">by {thomasson.username}</span>
          )}
          {date && <span className="meta-date">{dateLabel} {date}</span>}
        </div>
        <a href={getThomassonUrl(thomasson)} className="thomasson-card-link">
          View Details &rarr;
        </a>
      </div>
    </div>
  );
}
