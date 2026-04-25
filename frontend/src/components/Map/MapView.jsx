import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, LayersControl, Rectangle, useMap } from 'react-leaflet';
import L from 'leaflet';
import MarkerCluster from './MarkerCluster';
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

function SetViewOnLoad({ thomassons }) {
  const map = useMap();
  const hasSet = useRef(false);

  useEffect(() => {
    if (!hasSet.current && thomassons.length > 0) {
      const avgLat = thomassons.reduce((sum, t) => sum + t.latitude, 0) / thomassons.length;
      const avgLng = thomassons.reduce((sum, t) => sum + t.longitude, 0) / thomassons.length;
      map.setView([avgLat, avgLng], map.getZoom());
      hasSet.current = true;
    }
  }, [thomassons, map]);

  return null;
}

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
        zoom={3}
        minZoom={2}
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={1.0}
        className="map-container"
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Street">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              noWrap={true}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              noWrap={true}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Topographic">
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
              noWrap={true}
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        {/* White overlays to mask "Map data not yet available" beyond world edges */}
        <Rectangle
          bounds={[[-90, -360], [90, -180]]}
          pathOptions={{ color: 'white', fillColor: 'white', fillOpacity: 1, stroke: false }}
          interactive={false}
        />
        <Rectangle
          bounds={[[-90, 180], [90, 360]]}
          pathOptions={{ color: 'white', fillColor: 'white', fillOpacity: 1, stroke: false }}
          interactive={false}
        />
        <MarkerCluster thomassons={thomassons} />
        <SetViewOnLoad thomassons={thomassons} />
      </MapContainer>
    </div>
  );
}
