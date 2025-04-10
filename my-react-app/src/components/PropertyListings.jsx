import React, { useState, useEffect } from 'react';
import PropertyListing from './PropertyListing';
import { getPropertyByAddress, getComparableProperties } from '../services/propertyApi';
import './PropertyListings.css';

/**
 * PropertyListings component displays a list of property listings
 * and handles property search and selection
 */
const PropertyListings = ({ 
  onSelectProperty, 
  onAnalyzeProperty,
  selectedAddress,
  addressDetails // New prop to receive address details from parent
}) => {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showComparables, setShowComparables] = useState(false);
  
  // When an address is selected from the autocomplete
  useEffect(() => {
    if (!selectedAddress) return;
    
    const fetchPropertyData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // If we have address details with coordinates, pass them to optimize the API call
        const property = addressDetails && addressDetails.lat && addressDetails.lng 
          ? await getPropertyByAddress(selectedAddress, addressDetails) 
          : await getPropertyByAddress(selectedAddress);
        
        if (property) {
          setProperties([property]);
          setSelectedProperty(property);
          
          // Don't automatically call the parent handler
          // Let the user explicitly select the property
        } else {
          setError('No property found at this address');
          setProperties([]);
        }
      } catch (err) {
        setError('Error fetching property data');
        console.error(err);
        setProperties([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPropertyData();
  }, [selectedAddress, addressDetails]);
  
  // Handler for finding comparable properties
  const handleFindComparables = async () => {
    if (!selectedProperty) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const comparables = await getComparableProperties(selectedProperty);
      
      // Add comparables to the properties list
      setProperties([selectedProperty, ...comparables]);
      setShowComparables(true);
    } catch (err) {
      setError('Error finding comparable properties');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handler for selecting a property from the list
  const handleSelectProperty = (property) => {
    setSelectedProperty(property);
    
    // Call parent component's handler
    if (onSelectProperty) {
      onSelectProperty(property);
    }
  };
  
  // Handler for analyzing a property
  const handleAnalyzeProperty = (property) => {
    if (onAnalyzeProperty) {
      onAnalyzeProperty(property);
    }
  };
  
  return (
    <div className="property-listings">
      {error && <div className="error-message">{error}</div>}
      
      {isLoading ? (
        <div className="loading-indicator">Loading property data...</div>
      ) : (
        <>
          {properties.length > 0 ? (
            <>
              <div className="listings-header">
                <h2>{showComparables ? 'Property & Comparables' : 'Property Details'}</h2>
                
                {properties.length === 1 && selectedProperty && (
                  <button 
                    className="find-comparables-button" 
                    onClick={handleFindComparables}
                  >
                    Find Comparable Properties
                  </button>
                )}
              </div>
              
              <div className="listings-container">
                {properties.map((property, index) => (
                  <PropertyListing
                    key={`${property.address}-${index}`}
                    property={property}
                    isSelected={selectedProperty && selectedProperty.address === property.address}
                    onSelect={handleSelectProperty}
                    onAnalyze={handleAnalyzeProperty}
                  />
                ))}
              </div>
            </>
          ) : (
            selectedAddress && (
              <div className="no-properties-message">
                No properties found matching this address. Try a different address.
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default PropertyListings;