import { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { post } from '../api/client';
import { useAuth } from '../context/AuthContext';
import categories from '../utils/categories';
import './SubmitPage.css';

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
}

function SubmitPageLogin() {
  return (
    <div className="submit-page content-container">
      <h1>Submit a Thomasson</h1>
      <p>You need to be logged in to submit a Thomasson sighting.</p>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
        <Link to="/login" className="btn btn-primary">Log in</Link>
        <Link to="/signup" className="btn">Sign up</Link>
      </div>
    </div>
  );
}

export default function SubmitPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="submit-page container">
        <h1>Submit a Thomasson</h1>
        <p>You need to be logged in to submit a Thomasson sighting.</p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <Link to="/login" className="btn btn-primary">Log in</Link>
          <Link to="/signup" className="btn">Sign up</Link>
        </div>
      </div>
    );
  }

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [position, setPosition] = useState(null);
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  const [locationMode, setLocationMode] = useState('map');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handlePositionFromMap = useCallback((pos) => {
    setPosition(pos);
    setLatInput(pos[0].toFixed(6));
    setLngInput(pos[1].toFixed(6));
  }, []);

  const handleLatLngChange = () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      setPosition([lat, lng]);
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (files.length + selected.length > 10) {
      setError('Maximum 10 photos allowed.');
      return;
    }

    const newFiles = [...files, ...selected];
    setFiles(newFiles);

    const newPreviews = selected.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
    setError('');
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Description is required.');
      return;
    }
    if (!category) {
      setError('Please select a category.');
      return;
    }
    if (files.length === 0) {
      setError('At least one photo is required.');
      return;
    }

    let lat, lng;
    if (locationMode === 'map') {
      if (!position) {
        setError('Please click on the map to set a location.');
        return;
      }
      lat = position[0];
      lng = position[1];
    } else {
      lat = parseFloat(latInput);
      lng = parseFloat(lngInput);
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        setError('Please enter valid coordinates (lat: -90 to 90, lng: -180 to 180).');
        return;
      }
    }

    const formData = new FormData();
    if (title.trim()) formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('category', category);
    formData.append('latitude', lat);
    formData.append('longitude', lng);
    files.forEach((file) => formData.append('photos', file));

    setSubmitting(true);
    const { data, error: submitError } = await post('/thomassons/', formData);
    setSubmitting(false);

    if (submitError) {
      setError(submitError);
    } else {
      navigate('/my-submissions', { replace: true });
    }
  };

  return (
    <div className="submit-page content-container">
      <h1>Submit a Thomasson</h1>
      <p className="submit-intro">
        Found a useless architectural relic? Share it with the world. Your submission will be
        reviewed by a moderator before appearing on the map.
      </p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="submit-form">
        <div className="form-group">
          <label htmlFor="title">Title (optional)</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Staircase to Nowhere on 5th Ave"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you found, where it is, and why it qualifies as a Thomasson..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select a category...</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="location-fieldset">
          <legend>Location *</legend>

          <div className="location-mode-toggle">
            <button
              type="button"
              className={`btn ${locationMode === 'map' ? 'btn-primary' : ''}`}
              onClick={() => setLocationMode('map')}
            >
              Pick on map
            </button>
            <button
              type="button"
              className={`btn ${locationMode === 'manual' ? 'btn-primary' : ''}`}
              onClick={() => setLocationMode('manual')}
            >
              Enter coordinates
            </button>
          </div>

          {locationMode === 'map' && (
            <div className="location-map-picker">
              <p className="hint">Click on the map to place a pin at the Thomasson location.</p>
              <div className="picker-map-container">
                <MapContainer
                  center={position || [35.68, 139.76]}
                  zoom={position ? 15 : 3}
                  className="picker-map"
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPicker position={position} setPosition={handlePositionFromMap} />
                </MapContainer>
              </div>
              {position && (
                <p className="location-coords">
                  Selected: {position[0].toFixed(6)}, {position[1].toFixed(6)}
                </p>
              )}
            </div>
          )}

          {locationMode === 'manual' && (
            <div className="location-manual">
              <div className="coord-inputs">
                <div className="form-group">
                  <label htmlFor="latitude">Latitude</label>
                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    min="-90"
                    max="90"
                    value={latInput}
                    onChange={(e) => setLatInput(e.target.value)}
                    onBlur={handleLatLngChange}
                    placeholder="e.g., 35.6812"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="longitude">Longitude</label>
                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    min="-180"
                    max="180"
                    value={lngInput}
                    onChange={(e) => setLngInput(e.target.value)}
                    onBlur={handleLatLngChange}
                    placeholder="e.g., 139.7671"
                  />
                </div>
              </div>
            </div>
          )}
        </fieldset>

        <div className="form-group">
          <label>Photos * (1-10 images)</label>
          <div className="photo-upload-area">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="file-input-hidden"
            />
            <button
              type="button"
              className="btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={files.length >= 10}
            >
              {files.length === 0 ? 'Choose photos' : 'Add more photos'}
            </button>
            <span className="hint">{files.length}/10 photos selected</span>
          </div>

          {previews.length > 0 && (
            <div className="photo-previews">
              {previews.map((src, i) => (
                <div key={i} className="preview-thumb">
                  <img src={src} alt={`Preview ${i + 1}`} />
                  <button
                    type="button"
                    className="preview-remove"
                    onClick={() => removeFile(i)}
                    aria-label={`Remove photo ${i + 1}`}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary submit-btn" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit for review'}
        </button>
      </form>
    </div>
  );
}
