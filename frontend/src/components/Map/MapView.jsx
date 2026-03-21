import { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import ThomassonMarker from './ThomassonMarker';
import { get } from '../../api/client';
import './MapView.css';

/* Fix default Leaflet marker icons (Vite/Webpack bundling issue) */
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default function MapView() {
  const [thomassons, setThomassons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchThomassons() {
      const { data, error: err } = await get('/thomassons/');
      if (err) {
        setError(err);
      } else {
        setThomassons(data || []);
      }
      setLoading(false);
    }
    fetchThomassons();
  }, []);

  return (
    <div className="map-wrapper">
      {loading && <div className="map-loading-overlay">Loading map data...</div>}
      {error && (
        <div className="map-error-banner">
          Could not load Thomasson data. The map is shown without markers.
        </div>
      )}
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={1}
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={1.0}
        className="map-container"
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap={true}
        />
        {thomassons.map((t) => (
          <ThomassonMarker key={t.id} thomasson={t} />
        ))}
      </MapContainer>
    </div>
  );
}
