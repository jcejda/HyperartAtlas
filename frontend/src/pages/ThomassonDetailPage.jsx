import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { get } from '../api/client';
import { getCategoryByValue } from '../utils/categories';
import './ThomassonDetailPage.css';

export default function ThomassonDetailPage() {
  const { id } = useParams();
  const [thomasson, setThomasson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  useEffect(() => {
    async function fetchDetail() {
      const { data, error: err } = await get(`/thomassons/${id}`);
      if (err) {
        setError(err);
      } else {
        setThomasson(data);
      }
      setLoading(false);
    }
    fetchDetail();
  }, [id]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="content-container">
        <div className="error-message">{error}</div>
        <Link to="/">&larr; Back to map</Link>
      </div>
    );
  }

  if (!thomasson) {
    return (
      <div className="content-container">
        <p>Thomasson not found.</p>
        <Link to="/">&larr; Back to map</Link>
      </div>
    );
  }

  const category = getCategoryByValue(thomasson.category);
  const title = thomasson.title || 'Untitled Thomasson';
  const photos = thomasson.photos || [];
  const date = thomasson.created_at
    ? new Date(thomasson.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="detail-page content-container">
      <nav className="detail-breadcrumb">
        <Link to="/">Map</Link>
        <span className="breadcrumb-sep">/</span>
        <span>{title}</span>
      </nav>

      <div className="detail-layout">
        <main className="detail-main">
          <h1>{title}</h1>

          {photos.length > 0 && (
            <div className="detail-gallery">
              <div className="gallery-main">
                <img
                  src={photos[selectedPhoto]?.file_url || photos[selectedPhoto]}
                  alt={`${title} - photo ${selectedPhoto + 1}`}
                />
              </div>
              {photos.length > 1 && (
                <div className="gallery-thumbs">
                  {photos.map((photo, i) => (
                    <button
                      key={i}
                      className={`gallery-thumb ${i === selectedPhoto ? 'gallery-thumb--active' : ''}`}
                      onClick={() => setSelectedPhoto(i)}
                    >
                      <img
                        src={photo.file_url || photo}
                        alt={`Thumbnail ${i + 1}`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {thomasson.description && (
            <section className="detail-description">
              <h2>Description</h2>
              <p>{thomasson.description}</p>
            </section>
          )}
        </main>

        <aside className="detail-sidebar">
          <div className="infobox">
            <div className="infobox-header">{title}</div>
            <table className="infobox-table">
              <tbody>
                <tr>
                  <th>Category</th>
                  <td>
                    <span
                      className="category-badge"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.label}
                    </span>
                  </td>
                </tr>
                {thomasson.submitted_by_username && (
                  <tr>
                    <th>Submitted by</th>
                    <td>{thomasson.submitted_by_username}</td>
                  </tr>
                )}
                {date && (
                  <tr>
                    <th>Date Cataloged</th>
                    <td>{date}</td>
                  </tr>
                )}
                <tr>
                  <th>Coordinates</th>
                  <td>
                    {thomasson.latitude.toFixed(4)}, {thomasson.longitude.toFixed(4)}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="infobox-map">
              <MapContainer
                center={[thomasson.latitude, thomasson.longitude]}
                zoom={15}
                className="infobox-map-container"
                scrollWheelZoom={true}
                dragging={true}
                zoomControl={true}
                attributionControl={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[thomasson.latitude, thomasson.longitude]} />
              </MapContainer>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
