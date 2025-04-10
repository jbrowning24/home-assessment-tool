import React, { useState, useRef, useEffect } from 'react';
import './PropertySearch.css';

/**
 * PropertySearch component provides address autocomplete functionality
 * using Google Places API
 */
const PropertySearch = ({ onAddressSelect }) => {
  const [searchValue, setSearchValue] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  
  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!inputRef.current || !window.google) return;
    
    // If autocomplete already exists, don't recreate it
    if (autocompleteRef.current) return;
    
    // Create the autocomplete object
    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: ['us'] }, // Restrict to US addresses
      fields: ['address_components', 'formatted_address', 'geometry', 'name']
    });
    
    // Add listener for when a place is selected
    autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
    
    // Cleanup on unmount
    return () => {
      if (autocompleteRef.current && window.google) {
        // Remove listeners and cleanup
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [onAddressSelect]);
  
  // Handle place selection from autocomplete
  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();
    
    if (!place || !place.address_components) {
      console.warn('Incomplete place selected');
      return;
    }
    
    // Update the input value with the formatted address
    setSearchValue(place.formatted_address);
    
    // Extract place details before passing to parent
    const placeDetails = {
      formattedAddress: place.formatted_address,
      placeId: place.place_id,
      lat: place.geometry?.location.lat(),
      lng: place.geometry?.location.lng()
    };
    
    // Extract address components
    place.address_components.forEach(component => {
      const types = component.types;
      
      if (types.includes('administrative_area_level_1')) {
        placeDetails.state = component.short_name; // State code (e.g., NY)
      } else if (types.includes('administrative_area_level_2')) {
        placeDetails.county = component.long_name.replace(' County', ''); // County name
      } else if (types.includes('locality')) {
        placeDetails.city = component.long_name; // City name
      } else if (types.includes('postal_code')) {
        placeDetails.zip = component.long_name; // ZIP code
      }
    });
    
    // Call the parent's onAddressSelect callback with full details
    if (onAddressSelect) {
      onAddressSelect(place.formatted_address, placeDetails);
    }
  };
  
  return (
    <div className="property-search">
      <div className={`search-container ${isSearchFocused ? 'focused' : ''}`}>
        <i className="search-icon">🔍</i>
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Enter a property address to analyze..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
        {searchValue && (
          <button 
            className="clear-button"
            onClick={() => {
              setSearchValue('');
              if (inputRef.current) {
                inputRef.current.focus();
              }
            }}
          >
            ✕
          </button>
        )}
      </div>
      
      <div className="search-help-text">
        Search for any property address in the US to analyze its investment potential
      </div>
    </div>
  );
};

export default PropertySearch;