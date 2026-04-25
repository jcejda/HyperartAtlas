import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { createRoot } from 'react-dom/client';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import ThomassonCard from './ThomassonCard';

export default function MarkerCluster({ thomassons }) {
  const map = useMap();
  const clusterRef = useRef(null);
  const rootsRef = useRef([]);

  useEffect(() => {
    if (clusterRef.current) {
      map.removeLayer(clusterRef.current);
    }
    rootsRef.current.forEach(root => root.unmount());
    rootsRef.current = [];

    const cluster = L.markerClusterGroup({
      chunkedLoading: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div class="marker-cluster-inner"><span>${count}</span></div>`,
          className: 'marker-cluster-blue',
          iconSize: L.point(40, 40),
        });
      },
    });

    thomassons.forEach(thomasson => {
      const marker = L.marker([thomasson.latitude, thomasson.longitude]);

      const container = document.createElement('div');
      const root = createRoot(container);
      root.render(<ThomassonCard thomasson={thomasson} />);
      rootsRef.current.push(root);

      marker.bindPopup(container, {
        minWidth: 250,
        maxWidth: 320,
        className: 'thomasson-popup',
      });

      cluster.addLayer(marker);
    });

    map.addLayer(cluster);
    clusterRef.current = cluster;

    return () => {
      map.removeLayer(cluster);
      rootsRef.current.forEach(root => root.unmount());
      rootsRef.current = [];
    };
  }, [thomassons, map]);

  return null;
}
