import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * OrderTrackingMap
 *
 * Props:
 * - warehouse: { lat, lng }
 * - delivery: { lat, lng }
 * - status: current order status string
 * - driverLocation (optional): { lat, lng }
 */
const OrderTrackingMap = ({ warehouse, delivery, status, driverLocation }) => {
  const mapRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const currentProgressRef = useRef(0);

  useEffect(() => {
    if (!warehouse || !delivery) return;
    if (!warehouse.lat || !warehouse.lng || !delivery.lat || !delivery.lng) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
    }).setView([warehouse.lat, warehouse.lng], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Warehouse marker
    L.marker([warehouse.lat, warehouse.lng])
      .addTo(map)
      .bindPopup('<b>Warehouse</b>')
      .openPopup();

    // Delivery marker
    L.marker([delivery.lat, delivery.lng])
      .addTo(map)
      .bindPopup('<b>Delivery Address</b>');

    // Fit bounds
    const bounds = L.latLngBounds(
      [warehouse.lat, warehouse.lng],
      [delivery.lat, delivery.lng]
    );
    map.fitBounds(bounds, { padding: [40, 40] });

    // Driver marker (animated along straight line for now)
    const initialLat = driverLocation?.lat || warehouse.lat;
    const initialLng = driverLocation?.lng || warehouse.lng;

    const driverMarker = L.marker([initialLat, initialLng], {
      zIndexOffset: 1000,
    }).addTo(map);
    driverMarkerRef.current = driverMarker;

    // Cleanup on unmount
    return () => {
      map.remove();
    };
  }, [warehouse, delivery, driverLocation]);

  // Update driver position either from live driverLocation, or status-based simulation
  useEffect(() => {
    if (!driverMarkerRef.current || !warehouse || !delivery) return;

    // If we have a live driver location that is actively moving, place marker exactly there
    // If it's identical to the warehouse, it implies it hasn't moved, so fall back to simulation
    if (driverLocation && driverLocation.lat && driverLocation.lng && 
       !(driverLocation.lat === warehouse.lat && driverLocation.lng === warehouse.lng)) {
      driverMarkerRef.current.setLatLng([driverLocation.lat, driverLocation.lng]);
      return;
    }

    // Fallback: simulate along straight route based on status
    const progressByStatus = {
      pending: 0.05,
      processing: 0.2,
      shipped: 0.7,
      delivered: 1,
      cancelled: 0,
      payment_failed: 0,
    };

    const targetProgress = progressByStatus[status] ?? 0;
    const step = 0.015; // smooth animation step

    const intervalId = setInterval(() => {
      if (Math.abs(currentProgressRef.current - targetProgress) < step) {
        currentProgressRef.current = targetProgress;
        clearInterval(intervalId);
      } else if (currentProgressRef.current < targetProgress) {
        currentProgressRef.current += step;
      } else {
        currentProgressRef.current -= step;
      }

      const lat = warehouse.lat + (delivery.lat - warehouse.lat) * currentProgressRef.current;
      const lng = warehouse.lng + (delivery.lng - warehouse.lng) * currentProgressRef.current;

      driverMarkerRef.current.setLatLng([lat, lng]);
    }, 100);

    return () => clearInterval(intervalId);
  }, [status, warehouse.lat, warehouse.lng, delivery.lat, delivery.lng, driverLocation]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '280px', borderRadius: '12px', overflow: 'hidden' }}
    />
  );
};

export default OrderTrackingMap;
