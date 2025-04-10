import React, { useEffect, useRef } from 'react';

/**
 * AddressAutocomplete component using Google Places API
 * 
 * @param {Object} props
 * @param {string} props.value - Current input value
 * @param {Function} props.onChange - Function to call when input changes
 * @param {Function} props.onSelect - Function to call when address is selected with enhanced data
 * @param {string} props.placeholder - Input placeholder text
 * @param {string} props.id - Input element ID
 * @param {string} props.className - CSS class names
 */
const AddressAutocomplete = ({ 
  value, 
  onChange, 
  onSelect, 
  placeholder = "Enter a property address",
  id = "address-autocomplete",
  className = "",
}) => {
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
  }, [onSelect]);
  
  // Handle place selection
  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();
    
    if (!place || !place.address_components) {
      console.warn('Incomplete place selected');
      return;
    }
    
    // Extract address components
    let addressData = {
      formattedAddress: place.formatted_address,
      lat: place.geometry?.location.lat(),
      lng: place.geometry?.location.lng(),
      state: '',
      county: '',
      city: '',
      street: '',
      zip: ''
    };
    
    // Process address components
    place.address_components.forEach(component => {
      const types = component.types;
      
      if (types.includes('administrative_area_level_1')) {
        addressData.state = component.short_name; // State code (e.g., NY, NJ, CT)
      } else if (types.includes('administrative_area_level_2')) {
        addressData.county = component.long_name.replace(' County', '');
      } else if (types.includes('locality')) {
        addressData.city = component.long_name;
      } else if (types.includes('route')) {
        addressData.street = component.long_name;
      } else if (types.includes('postal_code')) {
        addressData.zip = component.long_name;
      }
    });
    
    // Call the onSelect callback with all extracted data
    if (onSelect) {
      onSelect(place.formatted_address, addressData);
    }
  };
  
  // Handle input changes
  const handleInputChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      id={id}
      className={`address-autocomplete ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={handleInputChange}
      autoComplete="off"
    />
  );
};

export default AddressAutocomplete;