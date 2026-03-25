import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../utils/api';

const DriverDemo = () => {
  const { orderId } = useParams();
  const [status, setStatus] = useState('Waiting for location permission...');
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setStatus('Geolocation is not supported on this device.');
      return;
    }

    setStatus('Requesting location permission...');

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        setStatus('Sending live location to server...');

        try {
          await api.updateDriverLocation(orderId, { latitude, longitude });
          setStatus('Location updated. Tracking is live.');
        } catch (err) {
          console.error('Failed to update driver location:', err);
          setStatus(err.message || 'Failed to update driver location');
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setStatus(error.message || 'Failed to get location');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 20000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [orderId]);

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1rem' }}>Driver Live Tracking Demo</h1>
      <p style={{ marginBottom: '1rem' }}>
        Order ID: <strong>{orderId}</strong>
      </p>
      <p style={{ marginBottom: '1rem' }}>{status}</p>
      {coords && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          background: '#f9fafb',
          fontSize: '0.9rem',
        }}>
          <div><strong>Latitude:</strong> {coords.latitude.toFixed(6)}</div>
          <div><strong>Longitude:</strong> {coords.longitude.toFixed(6)}</div>
          <div style={{ marginTop: '0.5rem', color: '#6b7280' }}>
            Keep this page open on the driver phone while delivering.
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDemo;
