import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, LayersControl, Marker } from 'react-leaflet';
import { get } from '../api/client';
import { getCategoryByValue } from '../utils/categories';
import './ThomassonDetailPage.css';

export default function ThomassonDetailPage() {
  const { id } = useParams();
  const [thomasson, setThomasson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const photoCount = thomasson?.photos?.length || 0;

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && lightboxOpen) {
      setLightboxOpen(false);
      return;
    }
    if (photoCount <= 1) return;
    if (e.key === 'ArrowLeft') {
      setSelectedPhoto((prev) => (prev - 1 + photoCount) % photoCount);
    } else if (e.key === 'ArrowRight') {
      setSelectedPhoto((prev) => (prev + 1) % photoCount);
    }
  }, [photoCount, lightboxOpen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

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
  const title = thomasson.title || '';
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
              <div className="gallery-main" onClick={() => setLightboxOpen(true)} style={{ cursor: 'pointer' }}>
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
                    <Link to={`/categories#${thomasson.category}`} className="category-badge-link">
                      <span
                        className="category-badge"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.label}
                      </span>
                    </Link>
                  </td>
                </tr>
                {thomasson.submitter_username && (
                  <tr>
                    <th>Submitted by</th>
                    <td>{thomasson.submitter_username}</td>
                  </tr>
                )}
                {thomasson.discovery_date && (
                  <tr>
                    <th>Date of Discovery</th>
                    <td>{new Date(thomasson.discovery_date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
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
                    <a
                      href={`https://www.google.com/maps?q=${thomasson.latitude},${thomasson.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {thomasson.latitude.toFixed(4)}, {thomasson.longitude.toFixed(4)}
                    </a>
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
                <LayersControl position="topright">
                  <LayersControl.BaseLayer checked name="Street">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer name="Satellite">
                    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                  </LayersControl.BaseLayer>
                </LayersControl>
                <Marker position={[thomasson.latitude, thomasson.longitude]} />
              </MapContainer>
            </div>
          </div>
        </aside>
      </div>

      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
          <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>&times;</button>
          {photos.length > 1 && (
            <button
              className="lightbox-nav lightbox-prev"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPhoto((prev) => (prev - 1 + photos.length) % photos.length);
              }}
            >
              &#8249;
            </button>
          )}
          <img
            className="lightbox-image"
            src={photos[selectedPhoto]?.file_url || photos[selectedPhoto]}
            alt={`${title} - photo ${selectedPhoto + 1}`}
            onClick={(e) => e.stopPropagation()}
          />
          {photos.length > 1 && (
            <button
              className="lightbox-nav lightbox-next"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPhoto((prev) => (prev + 1) % photos.length);
              }}
            >
              &#8250;
            </button>
          )}
          <div className="lightbox-counter">{selectedPhoto + 1} / {photos.length}</div>
        </div>
      )}
    </div>
  );
}
