import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DeliveryLocationMap = ({ onLocationSelect, initialLocation = null }) => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const searchTimeoutRef = useRef(null);
  
  // Edit mode states
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editStreet, setEditStreet] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editZipCode, setEditZipCode] = useState('');
  const [editCountry, setEditCountry] = useState('');

  // Reverse geocode coordinates to get address
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      
      if (data && data.address) {
        const address = {
          street: data.address.road || data.address.street || '',
          city: data.address.city || data.address.town || data.address.village || '',
          district: data.address.county || '',
          state: data.address.state || '',
          zipCode: data.address.postcode || '',
          country: data.address.country || '',
          displayName: data.display_name || ''
        };
        setSelectedAddress(address);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  // Reverse geocode when selected location changes
  useEffect(() => {
    if (selectedLocation?.lat && selectedLocation?.lng) {
      reverseGeocode(selectedLocation.lat, selectedLocation.lng);
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    const map = L.map(mapContainer.current).setView([20.5937, 78.9629], 5); // Center on India

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstance.current = map;

    // If initial location provided, add marker
    if (initialLocation?.lat && initialLocation?.lng) {
      const marker = L.marker([initialLocation.lat, initialLocation.lng], {
        draggable: true,
      }).addTo(map);
      markerRef.current = marker;
      map.setView([initialLocation.lat, initialLocation.lng], 13);

      marker.on('dragend', () => {
        const { lat, lng } = marker.getLatLng();
        handleLocationSelect(lat, lng, marker);
      });
    }

    // Handle map clicks to add/move marker
    const handleMapClick = (e) => {
      const { lat, lng } = e.latlng;
      handleLocationSelect(lat, lng, null);
    };

    const handleLocationSelect = (lat, lng, existingMarker) => {
      // Remove existing marker
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }

      // Add new marker
      const marker = L.marker([lat, lng], {
        draggable: true,
      }).addTo(map);

      markerRef.current = marker;

      // Handle marker drag
      marker.on('dragend', () => {
        const { lat: newLat, lng: newLng } = marker.getLatLng();
        handleLocationSelect(newLat, newLng, marker);
      });

      // Update state and notify parent
      const locationData = { lat, lng };
      setSelectedLocation(locationData);
      if (onLocationSelect) {
        onLocationSelect(locationData);
      }
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  const handleGetCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (mapInstance.current) {
            // Remove existing marker
            if (markerRef.current) {
              mapInstance.current.removeLayer(markerRef.current);
            }

            // Add marker at current location
            const marker = L.marker([latitude, longitude], {
              draggable: true,
            }).addTo(mapInstance.current);

            markerRef.current = marker;
            mapInstance.current.setView([latitude, longitude], 13);

            // Handle marker drag
            marker.on('dragend', () => {
              const { lat, lng } = marker.getLatLng();
              setSelectedLocation({ lat, lng });
              if (onLocationSelect) {
                onLocationSelect({ lat, lng });
              }
            });

            setSelectedLocation({ lat: latitude, lng: longitude });
            if (onLocationSelect) {
              onLocationSelect({ lat: latitude, lng: longitude });
            }
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to access your location. Please check browser permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // Handle address search
  const handleSearchAddress = (query) => {
    setSearchQuery(query);
    setSuggestions([]);

    if (query.trim().length < 2) {
      return;
    }

    setIsLoadingSuggestions(true);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce the search request
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in&addressdetails=1`
        );
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Error searching addresses:', error);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 500);
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);

    if (mapInstance.current) {
      // Remove existing marker
      if (markerRef.current) {
        mapInstance.current.removeLayer(markerRef.current);
      }

      // Add new marker
      const marker = L.marker([lat, lng], {
        draggable: true,
      }).addTo(mapInstance.current);

      markerRef.current = marker;
      mapInstance.current.setView([lat, lng], 13);

      // Handle marker drag
      marker.on('dragend', () => {
        const { lat: newLat, lng: newLng } = marker.getLatLng();
        setSelectedLocation({ lat: newLat, lng: newLng });
        if (onLocationSelect) {
          onLocationSelect({ lat: newLat, lng: newLng });
        }
      });

      setSelectedLocation({ lat, lng });
      if (onLocationSelect) {
        onLocationSelect({ lat, lng });
      }
    }

    // Clear search
    setSearchQuery('');
    setSuggestions([]);
  };

  // Handle entering edit mode
  const handleEditAddress = () => {
    if (selectedAddress) {
      setEditStreet(selectedAddress.street || '');
      setEditCity(selectedAddress.city || selectedAddress.district || '');
      setEditState(selectedAddress.state || '');
      setEditZipCode(selectedAddress.zipCode || '');
      setEditCountry(selectedAddress.country || 'India');
      setIsEditingAddress(true);
    }
  };

  // Handle saving edited address
  const handleSaveAddress = () => {
    const updatedAddress = {
      street: editStreet,
      city: editCity,
      district: editCity,
      state: editState,
      zipCode: editZipCode,
      country: editCountry,
      displayName: `${editStreet}, ${editCity}, ${editState} ${editZipCode}, ${editCountry}`
    };
    
    setSelectedAddress(updatedAddress);
    setIsEditingAddress(false);
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setIsEditingAddress(false);
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {/* Search Box */}
      <div style={{ marginBottom: '1rem', position: 'relative' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchAddress(e.target.value)}
          placeholder="Search address (e.g., 'Erode', 'Chennai Railway Station')"
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            fontSize: '0.95rem',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#4f46e5')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
        />

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              border: '1px solid #e5e7eb',
              borderTop: 'none',
              borderRadius: '0 0 8px 8px',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
            }}
          >
            {suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectSuggestion(suggestion)}
                style={{
                  padding: '0.75rem 1rem',
                  borderBottom: idx < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  backgroundColor: '#ffffff',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              >
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', fontWeight: '500', color: '#1f2937' }}>
                  {suggestion.name || suggestion.display_name?.split(',')[0] || 'Location'}
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
                  {suggestion.display_name}
                </p>
              </div>
            ))}
          </div>
        )}

        {isLoadingSuggestions && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
            Searching...
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
          Select Delivery Location on Map
        </h4>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          style={{
            padding: '0.5rem 1rem',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#059669')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#10b981')}
        >
          📍 Use My Location
        </button>
      </div>

      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: '400px',
          borderRadius: '8px',
          border: '2px solid #e5e7eb',
          overflow: 'hidden',
          marginBottom: '1rem',
        }}
      />

      {selectedLocation && (
        <div style={{ marginTop: '1rem' }}>
          {selectedAddress && !isEditingAddress && (
            <div
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
                padding: '1.25rem',
                borderRadius: '8px',
                border: '2px solid #0d9488',
                marginBottom: '1rem',
                color: 'white'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>📍</span>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>Selected Delivery Address</h4>
                </div>
                <button
                  type="button"
                  onClick={handleEditAddress}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: '2px solid white',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
                >
                  ✏️ Edit
                </button>
              </div>
              
              <div style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                {selectedAddress.street && (
                  <p style={{ margin: '0.25rem 0' }}>
                    <strong>Street:</strong> {selectedAddress.street}
                  </p>
                )}
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Area:</strong> {selectedAddress.city || selectedAddress.district || 'N/A'}
                </p>
                {selectedAddress.state && (
                  <p style={{ margin: '0.25rem 0' }}>
                    <strong>State:</strong> {selectedAddress.state}
                  </p>
                )}
                {selectedAddress.zipCode && (
                  <p style={{ margin: '0.25rem 0' }}>
                    <strong>Postal Code:</strong> {selectedAddress.zipCode}
                  </p>
                )}
                {selectedAddress.country && (
                  <p style={{ margin: '0.25rem 0' }}>
                    <strong>Country:</strong> {selectedAddress.country}
                  </p>
                )}
              </div>
            </div>
          )}

          {selectedAddress && isEditingAddress && (
            <div
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
                padding: '1.25rem',
                borderRadius: '8px',
                border: '2px solid #0d9488',
                marginBottom: '1rem',
                color: 'white'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.25rem' }}>✏️</span>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>Edit Delivery Address</h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={editStreet}
                    onChange={(e) => setEditStreet(e.target.value)}
                    placeholder="Street address"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                    City / Area
                  </label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="City or area"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                    State
                  </label>
                  <input
                    type="text"
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    placeholder="State"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={editZipCode}
                    onChange={(e) => setEditZipCode(e.target.value)}
                    placeholder="Postal code"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                    Country
                  </label>
                  <input
                    type="text"
                    value={editCountry}
                    onChange={(e) => setEditCountry(e.target.value)}
                    placeholder="Country"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: '2px solid white',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAddress}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'white',
                    color: '#0d9488',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  ✓ Save Address
                </button>
              </div>
            </div>
          )}

          <div
            style={{
              background: '#f3f4f6',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '0.875rem',
            }}
          >
            <p style={{ margin: '0 0 0.5rem 0', color: '#4b5563' }}>
              <strong>Latitude:</strong> {selectedLocation.lat.toFixed(6)}
            </p>
            <p style={{ margin: '0 0 0.5rem 0', color: '#4b5563' }}>
              <strong>Longitude:</strong> {selectedLocation.lng.toFixed(6)}
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>
              Click on the map to adjust location or drag the marker
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryLocationMap;
