// src/components/NominatimLocationPicker.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import './googlePlacesPicker.css'; // Reuse existing styles

const NominatimLocationPicker = ({ onLocationSelect, value }) => {
  const [search, setSearch] = useState(value?.address || '');
  const [showResults, setShowResults] = useState(false);

  const { data: places, isLoading } = useQuery({
    queryKey: ['nominatim', search],
    queryFn: async () => {
      if (!search.trim()) return [];
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&limit=5&addressdetails=1&countrycodes=in`
      );
      return res.json();
    },
    enabled: search.length > 2,
  });

  const handleSelect = (place) => {
    onLocationSelect({
      address: place.display_name,
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
      placeId: place.place_id,
    });
    setShowResults(false);
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=18&addressdetails=1`
      )
        .then(res => res.json())
        .then(place => {
          onLocationSelect({
            address: place.display_name,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setSearch(place.display_name);
        });
    });
  };

  return (
    <div className="places-container">
      <div className="input-wrapper">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowResults(true);
          }}
          placeholder="Enter delivery address (e.g., Erode, Tamil Nadu)"
          className="places-input"
        />
        <button 
          type="button"
          onClick={getCurrentLocation} 
          className="location-btn"
          title="Use current location"
        >
          📍
        </button>
      </div>
      
      {showResults && places?.length > 0 && (
        <div className="places-dropdown">
          {places.map((place) => (
            <div
              key={place.place_id}
              className="place-item"
              onClick={() => handleSelect(place)}
            >
              <div>{place.display_name}</div>
              <small>
                {place.address?.house_number} {place.address?.road}
              </small>
            </div>
          ))}
        </div>
      )}
      
      {isLoading && <div className="loading">🔍 Searching...</div>}
    </div>
  );
};

export default NominatimLocationPicker;
