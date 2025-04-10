/**
 * Property API Service
 * 
 * Handles integration with real estate data providers to fetch property listings
 * and details. Uses a combination of Google Places API for address lookup and
 * real estate data APIs for property information.
 */

// API keys should be stored in environment variables in a production app
const GOOGLE_MAPS_API_KEY = "AIzaSyDBNZVJH9BJEHyrdzl9dppYLCVXk-9LqgQ";

/**
 * Property listing type definition
 * @typedef {Object} PropertyListing
 * @property {string} address - Full property address
 * @property {number} price - Property price in USD
 * @property {number} bedrooms - Number of bedrooms
 * @property {number} bathrooms - Number of bathrooms
 * @property {number} squareFeet - Property size in square feet
 * @property {number} yearBuilt - Year the property was built
 * @property {string} propertyType - Type of property (House, Condo, etc.)
 * @property {string} state - State code (e.g., NY)
 * @property {string} county - County name
 * @property {number} lat - Latitude coordinate
 * @property {number} lng - Longitude coordinate
 * @property {string} imageUrl - URL to the primary property image
 * @property {string} listingUrl - URL to the original listing
 */

/**
 * Fetches property details based on an address
 * 
 * @param {string} address - The property address to search for
 * @param {Object} [addressDetails] - Optional pre-populated address details from Google Places
 * @returns {Promise<PropertyListing|null>} The property details or null if not found
 */
export const getPropertyByAddress = async (address, addressDetails = null) => {
  try {
    // If we have address details with coordinates, skip geocoding step
    let geocodeResult;
    
    if (addressDetails && addressDetails.lat && addressDetails.lng) {
      console.log("Using pre-populated address details:", addressDetails);
      
      // Create geocode result from address details
      geocodeResult = {
        lat: addressDetails.lat,
        lng: addressDetails.lng,
        formattedAddress: addressDetails.formattedAddress || address,
        state: addressDetails.state || '',
        county: addressDetails.county || '',
        city: addressDetails.city || '',
        zip: addressDetails.zip || ''
      };
      
      // If county is missing, try to obtain it
      if (!geocodeResult.county) {
        console.log("County missing, fetching from coordinates");
        geocodeResult.county = await getCountyFromCoordinates(geocodeResult.lat, geocodeResult.lng);
      }
    } else {
      // Otherwise, geocode the address to get precise location
      geocodeResult = await geocodeAddress(address);
    }
    
    if (!geocodeResult) {
      console.error("Failed to geocode address:", address);
      return null;
    }
    
    // In a production app, this would call a real estate API
    // For MVP, we'll use mock data enhanced with real geocoding
    const propertyData = await fetchPropertyData(geocodeResult);
    
    return propertyData;
  } catch (error) {
    console.error("Error fetching property data:", error);
    return null;
  }
};

/**
 * Fetches comparable properties near a given property
 * 
 * @param {PropertyListing} property - The base property to find comparables for
 * @param {number} [limit=5] - Maximum number of comparable properties to return
 * @returns {Promise<PropertyListing[]>} Array of comparable properties
 */
export const getComparableProperties = async (property, limit = 5) => {
  try {
    if (!property || !property.lat || !property.lng) {
      console.error("Invalid property for comparison");
      return [];
    }
    
    // In production, this would call a real estate API with filters for:
    // - Geographic proximity
    // - Similar price range
    // - Similar property characteristics (beds/baths/sqft)
    
    // For MVP, we'll use mock data with randomized variations
    const comparables = await fetchComparableProperties(property, limit);
    
    return comparables;
  } catch (error) {
    console.error("Error fetching comparable properties:", error);
    return [];
  }
};

/**
 * Get neighborhood data for a property
 * 
 * @param {Object} geocodeResult - The geocoded address information
 * @returns {Object} Neighborhood data
 */
const getNeighborhoodData = async (geocodeResult) => {
  // This would normally fetch real data from APIs like:
  // - Google Places API (for POIs)
  // - School district APIs
  // - Crime statistics APIs
  // - Census data
  
  // For now, generate plausible mock data based on location
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  
  const lat = geocodeResult.lat;
  const lng = geocodeResult.lng;
  
  // Different neighborhood profiles based on state
  const neighborhoodProfiles = {
    'NY': {
      name: geocodeResult.city || 'New York',
      medianIncome: 95000 + Math.floor(Math.random() * 40000),
      schoolRating: 7 + Math.floor(Math.random() * 3),
      crimeRate: 'Low to Moderate',
      nearbyAmenities: [
        { type: 'School', name: 'Lincoln Elementary', distance: 0.4 + Math.random() * 0.5 },
        { type: 'Park', name: 'Riverside Park', distance: 0.3 + Math.random() * 0.6 },
        { type: 'Grocery', name: 'Whole Foods Market', distance: 0.5 + Math.random() * 0.8 },
        { type: 'Restaurant', name: 'Trattoria Italiana', distance: 0.2 + Math.random() * 0.5 },
        { type: 'Transit', name: 'Metro Station', distance: 0.4 + Math.random() * 0.4 }
      ]
    },
    'NJ': {
      name: geocodeResult.city || 'Jersey City',
      medianIncome: 85000 + Math.floor(Math.random() * 35000),
      schoolRating: 6 + Math.floor(Math.random() * 4),
      crimeRate: 'Low',
      nearbyAmenities: [
        { type: 'School', name: 'Washington Middle School', distance: 0.6 + Math.random() * 0.6 },
        { type: 'Park', name: 'Liberty State Park', distance: 0.7 + Math.random() * 0.9 },
        { type: 'Grocery', name: 'ShopRite', distance: 0.4 + Math.random() * 0.6 },
        { type: 'Restaurant', name: 'Harbor View Cafe', distance: 0.3 + Math.random() * 0.4 },
        { type: 'Transit', name: 'PATH Station', distance: 0.5 + Math.random() * 0.7 }
      ]
    },
    'CT': {
      name: geocodeResult.city || 'Stamford',
      medianIncome: 90000 + Math.floor(Math.random() * 45000),
      schoolRating: 8 + Math.floor(Math.random() * 2),
      crimeRate: 'Very Low',
      nearbyAmenities: [
        { type: 'School', name: 'Greenwich Academy', distance: 0.8 + Math.random() * 0.7 },
        { type: 'Park', name: 'Mill River Park', distance: 0.5 + Math.random() * 0.6 },
        { type: 'Grocery', name: 'Fairway Market', distance: 0.6 + Math.random() * 0.7 },
        { type: 'Restaurant', name: 'Colony Grill', distance: 0.4 + Math.random() * 0.5 },
        { type: 'Transit', name: 'Metro-North Station', distance: 0.7 + Math.random() * 0.8 }
      ]
    }
  };
  
  // Select profile based on state, or default
  const profile = neighborhoodProfiles[geocodeResult.state] || neighborhoodProfiles['NY'];
  
  return {
    ...profile,
    population: 15000 + Math.floor(Math.random() * 25000),
    medianHomeValue: 450000 + Math.floor(Math.random() * 550000),
    medianAge: 32 + Math.floor(Math.random() * 10),
    homeOwnershipRate: 45 + Math.floor(Math.random() * 30) // 45-75%
  };
};

/**
 * Generate historical sales data for a property
 * 
 * @param {Object} geocodeResult - The geocoded address information
 * @returns {Array} Historical sales data
 */
const getHistoricalSalesData = (geocodeResult) => {
  // This would normally fetch real data from public records or real estate APIs
  
  // For now, generate mock historical sales
  const currentYear = new Date().getFullYear();
  const numSales = Math.floor(Math.random() * 3) + 1; // 1-3 past sales
  const salesData = [];
  
  let lastPrice = 450000 + Math.floor(Math.random() * 300000); // Last sale price
  let lastYear = currentYear - Math.floor(Math.random() * 2) - 1; // 1-2 years ago
  
  for (let i = 0; i < numSales; i++) {
    salesData.push({
      date: `${lastYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      price: lastPrice,
      pricePerSqFt: Math.floor(lastPrice / 2000), // Assuming ~2000 sqft on average
      source: Math.random() > 0.5 ? 'County Records' : 'MLS Listing'
    });
    
    // Go back in time for next sale
    const yearGap = Math.floor(Math.random() * 5) + 3; // 3-7 years between sales
    lastYear -= yearGap;
    
    // Reduce price for older sales (accounting for appreciation)
    const appreciationRate = 0.03 + Math.random() * 0.02; // 3-5% annual appreciation
    lastPrice = Math.floor(lastPrice / Math.pow(1 + appreciationRate, yearGap));
  }
  
  return salesData;
};

/**
 * Get a Google Street View image for a location
 * 
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {string} Street View image URL or null if not available
 */
const getStreetViewImage = async (lat, lng) => {
  if (!lat || !lng || !GOOGLE_MAPS_API_KEY) return null;
  
  // Check if Street View is available at this location
  try {
    const checkUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(checkUrl);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.log('No Street View available for this location');
      return null;
    }
    
    // If available, return the Street View image URL
    return `https://maps.googleapis.com/maps/api/streetview?size=400x300&location=${lat},${lng}&fov=80&heading=70&pitch=0&key=${GOOGLE_MAPS_API_KEY}`;
  } catch (error) {
    console.error('Error checking Street View availability:', error);
    return null;
  }
};

/**
 * Generate price history for a property
 * 
 * @param {number} currentPrice - Current property price
 * @returns {Array} Price history data
 */
const generatePriceHistory = (currentPrice) => {
  const currentDate = new Date();
  const priceHistory = [];
  
  // Random listing history: initial listing + 0-2 price changes
  const numPriceChanges = Math.floor(Math.random() * 3);
  let lastPrice = currentPrice;
  let lastDate = new Date(currentDate);
  
  // If we have price changes, the current price is the result of those changes
  if (numPriceChanges > 0) {
    priceHistory.push({
      date: formatDate(currentDate),
      price: currentPrice,
      event: 'Price Changed'
    });
    
    // Generate price changes going backward in time
    for (let i = 0; i < numPriceChanges; i++) {
      // Move back 15-45 days for each change
      lastDate = new Date(lastDate.setDate(lastDate.getDate() - 15 - Math.floor(Math.random() * 30)));
      
      // Price was higher for a reduction, lower for an increase
      const priceChange = (Math.random() > 0.7) ? 1 + (Math.random() * 0.05) : 1 - (Math.random() * 0.05);
      lastPrice = Math.round((lastPrice / priceChange) / 1000) * 1000;
      
      priceHistory.push({
        date: formatDate(lastDate),
        price: lastPrice,
        event: priceChange > 1 ? 'Price Reduced' : 'Price Increased'
      });
    }
  }
  
  // Add the initial listing date (15-90 days before first price change or current date)
  lastDate = new Date(lastDate.setDate(lastDate.getDate() - 15 - Math.floor(Math.random() * 75)));
  const initialPrice = (numPriceChanges === 0) ? currentPrice : lastPrice;
  
  priceHistory.push({
    date: formatDate(lastDate),
    price: initialPrice,
    event: 'Listed'
  });
  
  // Sort from oldest to newest
  return priceHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
};

/**
 * Format a date as YYYY-MM-DD
 * 
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * Generate a random past date
 * 
 * @param {number} minYearsAgo - Minimum years ago
 * @param {number} maxYearsAgo - Maximum years ago
 * @returns {string} Formatted date string
 */
const getRandomPastDate = (minYearsAgo, maxYearsAgo) => {
  const today = new Date();
  const yearsAgo = minYearsAgo + Math.random() * (maxYearsAgo - minYearsAgo);
  const pastDate = new Date(today.getFullYear() - yearsAgo, 
                            Math.floor(Math.random() * 12), 
                            Math.floor(Math.random() * 28) + 1);
  return formatDate(pastDate);
};

/**
 * Geocodes an address to get location coordinates and address components
 * 
 * @param {string} address - The address to geocode
 * @returns {Promise<{lat: number, lng: number, formattedAddress: string, state: string, county: string, city: string, zip: string}|null>}
 */
export const geocodeAddress = async (address) => {
  if (!address) return null;
  
  try {
    // Use Google Maps Geocoding API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.warn(`Geocoding failed: ${data.status}`);
      return null;
    }
    
    const result = data.results[0];
    const location = result.geometry.location;
    
    // Extract address components
    let state = '';
    let county = '';
    let city = '';
    let zip = '';
    let street = '';
    
    for (const component of result.address_components) {
      // Extract standard components
      if (component.types.includes('administrative_area_level_1')) {
        state = component.short_name; // State code (e.g., NY)
      } else if (component.types.includes('administrative_area_level_2')) {
        county = component.long_name.replace(' County', ''); // County name
      } else if (component.types.includes('locality') || component.types.includes('sublocality')) {
        city = component.long_name; // City name
      } else if (component.types.includes('postal_code')) {
        zip = component.long_name; // ZIP code
      } else if (component.types.includes('route')) {
        street = component.long_name; // Street name
      }
    }
    
    // If county is missing, try to obtain it using reverse geocoding with lat/lng
    if (!county && location.lat && location.lng) {
      county = await getCountyFromCoordinates(location.lat, location.lng);
    }
    
    return {
      lat: location.lat,
      lng: location.lng,
      formattedAddress: result.formatted_address,
      state,
      county,
      city,
      zip,
      street
    };
  } catch (error) {
    console.error("Error geocoding address:", error);
    return null;
  }
};

/**
 * Get county name from coordinates using reverse geocoding
 * This is a fallback method when the standard geocoding doesn't return county
 * 
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>} - County name or empty string
 */
const getCountyFromCoordinates = async (lat, lng) => {
  if (!lat || !lng) return '';
  
  try {
    // Use reverse geocoding to get address components from coordinates
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&result_type=administrative_area_level_2&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      // Try another approach - get all results and filter
      const fullResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      const fullData = await fullResponse.json();
      
      if (fullData.status !== 'OK' || !fullData.results || fullData.results.length === 0) {
        return '';
      }
      
      // Look through all results for county information
      for (const result of fullData.results) {
        for (const component of result.address_components) {
          if (component.types.includes('administrative_area_level_2')) {
            return component.long_name.replace(' County', '');
          }
        }
      }
      
      return '';
    }
    
    // Extract county from the specific result
    for (const component of data.results[0].address_components) {
      if (component.types.includes('administrative_area_level_2')) {
        return component.long_name.replace(' County', '');
      }
    }
    
    return '';
  } catch (error) {
    console.error("Error getting county from coordinates:", error);
    return '';
  }
};

/**
 * Mock function to fetch property data (simulates a real estate API)
 * In a production app, this would be replaced with a real API call
 * 
 * @param {Object} geocodeResult - The geocoded address information
 * @returns {Promise<PropertyListing>}
 */
const fetchPropertyData = async (geocodeResult) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Determine price range based on location (mock logic)
  let basePrice = 500000; // Default base price
  
  // Adjust base price by state (mock data)
  const statePriceFactors = {
    'NY': 1.5,
    'NJ': 1.2,
    'CT': 1.3,
    'CA': 2.0,
    'TX': 0.8,
    'FL': 0.9
  };
  
  if (geocodeResult.state && statePriceFactors[geocodeResult.state]) {
    basePrice *= statePriceFactors[geocodeResult.state];
  }
  
  // Create randomized property details
  const bedrooms = Math.floor(Math.random() * 3) + 2; // 2-4 bedrooms
  const bathrooms = Math.floor(Math.random() * 3) + 1.5; // 1.5-3.5 bathrooms
  const squareFeet = Math.floor(Math.random() * 1000) + 1500; // 1500-2500 sq ft
  
  // Adjust price based on property features
  const pricePerSqFt = basePrice / 2000; // Base price is for a 2000 sq ft home
  const adjustedPrice = Math.round(pricePerSqFt * squareFeet * (1 + (bedrooms - 3) * 0.1));
  
  // Round price to nearest $1000
  const price = Math.round(adjustedPrice / 1000) * 1000;
  
  // Get Street View image URL
  const streetViewUrl = await getStreetViewImage(geocodeResult.lat, geocodeResult.lng);
  
  // Get neighborhood data
  const neighborhoodData = await getNeighborhoodData(geocodeResult);
  
  // Get historical sales data
  const historicalSalesData = getHistoricalSalesData(geocodeResult);
  
  return {
    address: geocodeResult.formattedAddress,
    price,
    bedrooms,
    bathrooms,
    squareFeet,
    yearBuilt: Math.floor(Math.random() * 50) + 1970, // 1970-2020
    propertyType: Math.random() > 0.3 ? 'Single Family Home' : 'Condo',
    state: geocodeResult.state,
    county: geocodeResult.county,
    lat: geocodeResult.lat,
    lng: geocodeResult.lng,
    imageUrl: streetViewUrl || `https://picsum.photos/seed/${encodeURIComponent(geocodeResult.formattedAddress)}/400/300`,
    listingUrl: '#', // Placeholder for real listing URL
    neighborhood: neighborhoodData,
    historicalSales: historicalSalesData,
    walkScore: Math.floor(Math.random() * 70) + 30, // 30-100 walk score
    transitScore: Math.floor(Math.random() * 60) + 20, // 20-80 transit score
    priceHistory: generatePriceHistory(price),
    estimatedValue: price * (1 + (Math.random() * 0.10 - 0.05)), // ±5% of listing price
    taxAssessment: price * 0.85, // Assessed at 85% of market value (mock)
    floodRisk: ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)],
    lastSold: {
      date: getRandomPastDate(1, 10),
      price: price * (0.7 + Math.random() * 0.2) // 70-90% of current price
    }
  };
};

/**
 * Mock function to fetch comparable properties (simulates a real estate API)
 * In a production app, this would be replaced with a real API call
 * 
 * @param {PropertyListing} property - The base property
 * @param {number} limit - Maximum number of comparable properties
 * @returns {Promise<PropertyListing[]>}
 */
const fetchComparableProperties = async (property, limit) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const comparables = [];
  
  // Generate mock comparable properties with similar characteristics
  for (let i = 0; i < limit; i++) {
    // Create small variations in location (within ~1 mile)
    const latVariation = (Math.random() - 0.5) * 0.02;
    const lngVariation = (Math.random() - 0.5) * 0.02;
    
    // Create variations in property details
    const priceVariation = Math.random() * 0.2 - 0.1; // -10% to +10%
    const sqftVariation = Math.random() * 0.15 - 0.05; // -5% to +10%
    const bedVariation = Math.floor(Math.random() * 3) - 1; // -1 to +1 bedrooms
    
    const bedrooms = Math.max(1, property.bedrooms + bedVariation);
    const bathrooms = bedrooms - 0.5 + Math.random();
    const squareFeet = Math.round(property.squareFeet * (1 + sqftVariation));
    const price = Math.round(property.price * (1 + priceVariation) / 1000) * 1000;
    
    // Create a mock address for the comparable property
    const streetNumber = Math.floor(Math.random() * 100) + 100;
    const streets = ['Maple St', 'Oak Ave', 'Cedar Ln', 'Pine Dr', 'Elm Rd', 'Willow Way'];
    const street = streets[Math.floor(Math.random() * streets.length)];
    
    // Extract city and state from the original address
    const addressParts = property.address.split(',');
    const cityStateZip = addressParts.length > 1 ? addressParts[addressParts.length - 2] : '';
    
    const mockAddress = `${streetNumber} ${street}, ${cityStateZip}, ${property.state}`;
    
    comparables.push({
      address: mockAddress,
      price,
      bedrooms,
      bathrooms: parseFloat(bathrooms.toFixed(1)),
      squareFeet,
      yearBuilt: property.yearBuilt + Math.floor(Math.random() * 10) - 5,
      propertyType: property.propertyType,
      state: property.state,
      county: property.county,
      lat: property.lat + latVariation,
      lng: property.lng + lngVariation,
      imageUrl: `https://picsum.photos/seed/${mockAddress}/400/300`,
      listingUrl: '#',
      isComparable: true
    });
  }
  
  return comparables;
};