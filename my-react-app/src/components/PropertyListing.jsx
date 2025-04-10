import React, { useState } from 'react';
import './PropertyListing.css';

/**
 * PropertyListing component displays details for a single property
 * 
 * @param {Object} props Component props
 * @param {Object} props.property The property data to display
 * @param {boolean} props.isSelected Whether this property is currently selected
 * @param {Function} props.onSelect Callback when property is selected
 * @param {Function} props.onAnalyze Callback to analyze this property
 */
const PropertyListing = ({ 
  property, 
  isSelected = false, 
  onSelect = () => {}, 
  onAnalyze = () => {}
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  if (!property) return null;
  
  const {
    address,
    price,
    bedrooms,
    bathrooms,
    squareFeet,
    yearBuilt,
    propertyType,
    imageUrl,
    neighborhood,
    walkScore,
    transitScore,
    historicalSales,
    lastSold,
    floodRisk,
    priceHistory
  } = property;
  
  // Format price with commas
  const formattedPrice = price?.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }) || 'Price unknown';
  
  const toggleDetails = (e) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  };
  
  return (
    <div 
      className={`property-listing ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(property)}
    >
      <div className="property-image">
        {imageUrl ? (
          <img src={imageUrl} alt={address} />
        ) : (
          <div className="image-placeholder">No Image</div>
        )}
      </div>
      
      <div className="property-details">
        <h3 className="property-price">{formattedPrice}</h3>
        <p className="property-address">{address}</p>
        
        <div className="property-specs">
          <span>{bedrooms} bd</span>
          <span className="separator">|</span>
          <span>{bathrooms} ba</span>
          <span className="separator">|</span>
          <span>{squareFeet?.toLocaleString()} sqft</span>
          {yearBuilt && (
            <>
              <span className="separator">|</span>
              <span>Built {yearBuilt}</span>
            </>
          )}
          {propertyType && (
            <>
              <span className="separator">|</span>
              <span>{propertyType}</span>
            </>
          )}
        </div>
        
        {neighborhood && (
          <div className="property-scores">
            {walkScore && <span className="score">Walk Score: {walkScore}</span>}
            {transitScore && <span className="score">Transit Score: {transitScore}</span>}
            {floodRisk && <span className="score">Flood Risk: {floodRisk}</span>}
          </div>
        )}
        
        {showDetails && (
          <div className="property-extended-details">
            {neighborhood && (
              <div className="neighborhood-info">
                <h4>Neighborhood: {neighborhood.name}</h4>
                <div className="neighborhood-details">
                  <p>Median Income: ${neighborhood.medianIncome?.toLocaleString()}</p>
                  <p>School Rating: {neighborhood.schoolRating}/10</p>
                  <p>Crime Rate: {neighborhood.crimeRate}</p>
                </div>
                
                {neighborhood.nearbyAmenities && neighborhood.nearbyAmenities.length > 0 && (
                  <div className="nearby-amenities">
                    <h5>Nearby Amenities:</h5>
                    <ul>
                      {neighborhood.nearbyAmenities.map((amenity, index) => (
                        <li key={index}>{amenity.type}: {amenity.name} ({amenity.distance.toFixed(1)} mi)</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {historicalSales && historicalSales.length > 0 && (
              <div className="sales-history">
                <h4>Sales History</h4>
                <ul>
                  {historicalSales.map((sale, index) => (
                    <li key={index}>
                      {sale.date}: ${sale.price.toLocaleString()} (${sale.pricePerSqFt}/sqft) 
                      - {sale.source}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {lastSold && (
              <div className="last-sold">
                <p>Last sold on {lastSold.date} for ${lastSold.price.toLocaleString()}</p>
              </div>
            )}
          </div>
        )}
        
        <div className="property-actions">
          <button 
            className="details-button"
            onClick={toggleDetails}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
          <button 
            className="analyze-button"
            onClick={(e) => {
              e.stopPropagation();
              onAnalyze(property);
            }}
          >
            Analyze Investment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyListing;