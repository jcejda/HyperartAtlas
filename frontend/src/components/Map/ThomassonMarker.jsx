import { Marker, Popup } from 'react-leaflet';
import ThomassonCard from './ThomassonCard';

export default function ThomassonMarker({ thomasson }) {
  const position = [thomasson.latitude, thomasson.longitude];

  return (
    <Marker position={position}>
      <Popup minWidth={250} maxWidth={320} className="thomasson-popup">
        <ThomassonCard thomasson={thomasson} />
      </Popup>
    </Marker>
  );
}
