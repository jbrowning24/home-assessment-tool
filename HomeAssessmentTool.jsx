import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HomeAssessmentTool = () => {
  // Form data with default values
  const [formData, setFormData] = useState({
    state: 'NJ',
    county: '',
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 2000,
    yearBuilt: 1979,
    distanceToTrainStation: 15,
    distanceToGrandCentral: 90,
    schoolRating: 7,
    propertyTaxes: 15000,
    hoa: 0,
    renovationBudget: 0,
    purchasePrice: 600000,
    downPayment: 300000,
    mortgageRate: 6.59,
    appreciationRate: 3,
    holdingPeriod: 10,
    maintenanceCostPerSqFt: 1.5, // New: annual maintenance cost per sq ft
    monthlyRentalIncomePerSqFt: 1.8, // New: monthly rental income per sq ft
    vacancyRate: 4, // New: vacancy rate in percentage
    sellingCosts: 6, // New: selling costs as percentage of sale price
  });

  // State for comparison mode
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [comparisonProperties, setComparisonProperties] = useState([]);
  const [savedProperties, setSavedProperties] = useState([]);

  // State for listing parser
  const [listingText, setListingText] = useState('');
  const [parsingStatus, setParsingStatus] = useState('');
  
  // State for results
  const [results, setResults] = useState(null);

  // State for form validation
  const [formErrors, setFormErrors] = useState({});
  
  // County data by state
  const counties = {
    'NJ': ['Bergen', 'Essex', 'Middlesex', 'Morris', 'Union', 'Somerset', 'Monmouth', 'Hunterdon', 'Passaic', 'Hudson'],
    'NY': ['Westchester', 'Nassau', 'Suffolk', 'Rockland', 'Putnam', 'Orange', 'Dutchess', 'Ulster', 'Sullivan'],
    'CT': ['Fairfield', 'New Haven', 'Hartford', 'Litchfield', 'Middlesex', 'New London', 'Tolland', 'Windham']
  };
  
  // Property tax rates by state and county
  const taxRates = {
    'NJ': {
      'Bergen': 2.15,
      'Essex': 2.76,
      'Middlesex': 2.29,
      'Morris': 2.19,
      'Union': 2.32,
      'Somerset': 2.08,
      'Monmouth': 2.04,
      'Hunterdon': 2.42,
      'Passaic': 3.05,
      'Hudson': 2.11
    },
    'NY': {
      'Westchester': 1.62,
      'Nassau': 1.98,
      'Suffolk': 1.69,
      'Rockland': 1.84,
      'Putnam': 1.71,
      'Orange': 1.63,
      'Dutchess': 1.55,
      'Ulster': 1.77,
      'Sullivan': 1.52
    },
    'CT': {
      'Fairfield': 1.83,
      'New Haven': 2.38,
      'Hartford': 2.40,
      'Litchfield': 1.60,
      'Middlesex': 1.82,
      'New London': 2.14,
      'Tolland': 2.05,
      'Windham': 1.93
    }
  };
  
  // School rankings
  const schoolRankings = {
    'NJ': {
      'Bergen': 30.5,
      'Essex': 48.4,
      'Middlesex': 59.7,
      'Morris': 39.8,
      'Union': 35.4,
      'Somerset': 26.8,
      'Monmouth': 32.5,
      'Hunterdon': 17.2,
      'Passaic': 62.3,
      'Hudson': 54.6
    },
    'NY': {
      'Westchester': 15.3,
      'Nassau': 18.7,
      'Suffolk': 36.2,
      'Rockland': 42.1,
      'Putnam': 44.6,
      'Orange': 48.9,
      'Dutchess': 46.2,
      'Ulster': 58.7,
      'Sullivan': 62.4
    },
    'CT': {
      'Fairfield': 28.4,
      'New Haven': 61.3,
      'Litchfield': 66.8,
      'Hartford': 71.2,
      'Middlesex': 64.5,
      'New London': 72.6,
      'Tolland': 58.3,
      'Windham': 76.4
    }
  };

  // Historical appreciation rates
  const historicalAppreciation = {
    'NJ': {
      'Bergen': 3.8,
      'Essex': 4.2,
      'Middlesex': 3.6,
      'Morris': 3.7,
      'Union': 3.5,
      'Somerset': 3.6,
      'Monmouth': 4.0,
      'Hunterdon': 3.2,
      'Passaic': 3.1,
      'Hudson': 4.5
    },
    'NY': {
      'Westchester': 4.1,
      'Nassau': 3.9,
      'Suffolk': 3.5,
      'Rockland': 3.7,
      'Putnam': 3.2,
      'Orange': 3.0,
      'Dutchess': 2.9,
      'Ulster': 2.8,
      'Sullivan': 2.5
    },
    'CT': {
      'Fairfield': 3.6,
      'New Haven': 2.8,
      'Hartford': 2.5,
      'Litchfield': 2.3,
      'Middlesex': 2.7,
      'New London': 2.4,
      'Tolland': 2.2,
      'Windham': 2.0
    }
  };

  // Town data with commute times to Grand Central
  const commuteTimes = {
    'NY': {
      'Westchester': {
        'White Plains': 35,
        'Scarsdale': 38,
        'Rye': 42,
        'Harrison': 40,
        'Mamaroneck': 36,
        'Larchmont': 34,
        'New Rochelle': 32,
        'Bronxville': 28,
        'Yonkers': 25,
        'Tarrytown': 42,
        'Irvington': 45,
        'Dobbs Ferry': 43,
        'Ardsley': 46,
        'Hastings-on-Hudson': 40,
        'Mount Kisco': 60,
        'Bedford': 67,
        'Katonah': 63,
        'Chappaqua': 53,
        'Pleasantville': 55
      }
    },
    'NJ': {
      'Bergen': {
        'Ridgewood': 50,
        'Glen Rock': 47,
        'Fair Lawn': 42,
        'Paramus': 45,
        'Teaneck': 35,
        'Englewood': 32,
        'Fort Lee': 25,
        'Closter': 45,
        'Tenafly': 40,
        'Westwood': 55
      },
      'Essex': {
        'Montclair': 40,
        'Glen Ridge': 38,
        'Bloomfield': 35,
        'South Orange': 33,
        'Maplewood': 32,
        'Millburn': 30,
        'Short Hills': 32,
        'Livingston': 45,
        'West Orange': 47
      }
    },
    'CT': {
      'Fairfield': {
        'Greenwich': 45,
        'Stamford': 52,
        'Darien': 58,
        'New Canaan': 65,
        'Norwalk': 70,
        'Westport': 75,
        'Fairfield': 82,
        'Wilton': 78,
        'Ridgefield': 86
      }
    }
  };

  // Load saved properties from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('savedProperties');
    if (savedData) {
      try {
        setSavedProperties(JSON.parse(savedData));
      } catch (e) {
        console.error('Error loading saved properties:', e);
      }
    }
  }, []);

  // Save properties to localStorage whenever savedProperties changes
  useEffect(() => {
    if (savedProperties.length > 0) {
      localStorage.setItem('savedProperties', JSON.stringify(savedProperties));
    }
  }, [savedProperties]);

  // Function to parse a property listing
  const parseListingText = () => {
    const extractData = {};
    
    try {
      setParsingStatus('Parsing property listing...');
      
      // Extract purchase price - look for dollar amounts
      const priceRegex = /(?:\$|USD|asking|price|listed for|listed at|selling for)\s*(\d{3}(?:,\d{3})+|\d{1,3}(?:,\d{3}){1,}(?:\.\d+)?|\d{4,}(?:\.\d+)?)/i;
      const priceMatch = listingText.match(priceRegex);
      if (priceMatch && priceMatch[1]) {
        extractData.purchasePrice = Number(priceMatch[1].replace(/,/g, ''));
      }
      
      // Extract address including state
      const addressRegex = /([^,]+),\s*([^,]+),\s*([A-Z]{2})\s*(\d{5}(?:-\d{4})?)/;
      const addressMatch = listingText.match(addressRegex);
      if (addressMatch && addressMatch[3]) {
        const stateCode = addressMatch[3];
        // Only set state if it's in our tri-state area
        if (['NJ', 'NY', 'CT'].includes(stateCode)) {
          extractData.state = stateCode;
        }
      }
      
      // Extract county using multiple approaches
      // First check explicit format like "County: Westchester"
      const countyRegexExplicit = /(?:county|region):\s*([a-zA-Z\s]+)/i;
      const countyMatchExplicit = listingText.match(countyRegexExplicit);
      
      if (countyMatchExplicit && countyMatchExplicit[1]) {
        extractData.county = countyMatchExplicit[1].trim();
      } else {
        // Check for county mentions in the text
        if (extractData.state) {
          const potentialCounties = counties[extractData.state] || [];
          for (const county of potentialCounties) {
            const countyRegex = new RegExp(`\\b${county}\\b`, 'i');
            if (countyRegex.test(listingText)) {
              extractData.county = county;
              break;
            }
          }
        }
        
        // If still no county but we have state NY, try to detect Westchester towns
        if (extractData.state === 'NY' && !extractData.county) {
          const westchesterTowns = Object.keys(commuteTimes['NY']['Westchester'] || {});
          for (const town of westchesterTowns) {
            if (listingText.includes(town) || new RegExp(`\\b${town}\\b`, 'i').test(listingText)) {
              extractData.county = 'Westchester';
              
              // Also set commute time if available
              if (commuteTimes['NY']['Westchester'][town]) {
                extractData.distanceToGrandCentral = commuteTimes['NY']['Westchester'][town];
              }
              break;
            }
          }
        }
        
        // Try the same for NJ counties
        if (extractData.state === 'NJ' && !extractData.county) {
          for (const county of Object.keys(commuteTimes['NJ'] || {})) {
            const towns = Object.keys(commuteTimes['NJ'][county] || {});
            for (const town of towns) {
              if (listingText.includes(town) || new RegExp(`\\b${town}\\b`, 'i').test(listingText)) {
                extractData.county = county;
                
                // Also set commute time if available
                if (commuteTimes['NJ'][county][town]) {
                  extractData.distanceToGrandCentral = commuteTimes['NJ'][county][town];
                }
                break;
              }
            }
            if (extractData.county) break;
          }
        }
        
        // Try the same for CT counties
        if (extractData.state === 'CT' && !extractData.county) {
          for (const county of Object.keys(commuteTimes['CT'] || {})) {
            const towns = Object.keys(commuteTimes['CT'][county] || {});
            for (const town of towns) {
              if (listingText.includes(town) || new RegExp(`\\b${town}\\b`, 'i').test(listingText)) {
                extractData.county = county;
                
                // Also set commute time if available
                if (commuteTimes['CT'][county][town]) {
                  extractData.distanceToGrandCentral = commuteTimes['CT'][county][town];
                }
                break;
              }
            }
            if (extractData.county) break;
          }
        }
      }
      
      // Extract bedrooms using various patterns
      const bedroomsRegexes = [
        /(\d+)\s*(?:bed|beds|bedroom|bedrooms)(?:\s*:|:)?/i,
        /(?:bedroom|bedrooms|beds)(?:\s*:|:)\s*(\d+)/i,
        /(\d+)br/i,
        /br:?\s*(\d+)/i,
        /(\d+)\s*bed/i
      ];
      
      for (const regex of bedroomsRegexes) {
        const match = listingText.match(regex);
        if (match && match[1] && !isNaN(Number(match[1]))) {
          extractData.bedrooms = Number(match[1]);
          break;
        }
      }
      
      // Extract bathrooms using similar patterns
      const bathroomsRegexes = [
        /(\d+(?:\.\d+)?)\s*(?:bath|baths|bathroom|bathrooms)(?:\s*:|:)?/i,
        /(?:bathroom|bathrooms|baths)(?:\s*:|:)\s*(\d+(?:\.\d+)?)/i,
        /(\d+(?:\.\d+)?)\s*ba/i,
        /ba:?\s*(\d+(?:\.\d+)?)/i
      ];
      
      for (const regex of bathroomsRegexes) {
        const match = listingText.match(regex);
        if (match && match[1] && !isNaN(Number(match[1]))) {
          extractData.bathrooms = Number(match[1]);
          break;
        }
      }
      
      // Extract square footage using multiple patterns
      const sqftRegexes = [
        /(\d+(?:,\d+)?)\s*sq(?:\.|\s)?(?:ft|feet)/i,
        /(\d+(?:,\d+)?)\s*(?:square feet|square foot|sf)/i,
        /(?:square footage|total interior livable area|living area)(?:\s*:|:)\s*(\d+(?:,\d+)?)/i,
        /(?:sqft|sq\. ft\.|sq ft)(?:\s*:|:)?\s*(\d+(?:,\d+)?)/i
      ];
      
      for (const regex of sqftRegexes) {
        const match = listingText.match(regex);
        if (match && match[1]) {
          extractData.squareFeet = Number(match[1].replace(/,/g, ''));
          break;
        }
      }
      
      // Extract year built
      const yearBuiltRegexes = [
        /built in (\d{4})/i,
        /year built(?:\s*:|:)\s*(\d{4})/i,
        /constructed in (\d{4})/i,
        /(\d{4}) built/i,
        /built:? (\d{4})/i
      ];
      
      for (const regex of yearBuiltRegexes) {
        const match = listingText.match(regex);
        if (match && match[1] && !isNaN(Number(match[1]))) {
          const year = Number(match[1]);
          if (year > 1800 && year <= new Date().getFullYear()) {
            extractData.yearBuilt = year;
            break;
          }
        }
      }
      
      // Extract property taxes using multiple formats
      const taxesRegexes = [
        /annual tax(?:\s*amount)?(?:\s*:|:)?\s*\$?(\d+(?:,\d+)?(?:\.\d+)?)/i,
        /property tax(?:es)?(?:\s*:|:)?\s*\$?(\d+(?:,\d+)?(?:\.\d+)?)/i,
        /(?:taxes|tax|annual taxes):?\s*\$?(\d+(?:,\d+)?(?:\.\d+)?)/i,
        /tax:?\s*\$?(\d+(?:,\d+)?(?:\.\d+)?)(?: annually| per year)/i
      ];
      
      for (const regex of taxesRegexes) {
        const match = listingText.match(regex);
        if (match && match[1]) {
          extractData.propertyTaxes = Number(match[1].replace(/,/g, ''));
          break;
        }
      }
      
      // Extract HOA fees
      const hoaRegexes = [
        /hoa(?:\s*fees)?(?:\s*:|:)?\s*\$?(\d+(?:,\d+)?(?:\.\d+)?)(?: per month| monthly| per mo)/i,
        /(?:monthly )?(?:hoa|association|maintenance) fee(?:s)?(?:\s*:|:)?\s*\$?(\d+(?:,\d+)?(?:\.\d+)?)/i,
        /(?:monthly|common) charges:?\s*\$?(\d+(?:,\d+)?(?:\.\d+)?)/i
      ];
      
      for (const regex of hoaRegexes) {
        const match = listingText.match(regex);
        if (match && match[1]) {
          extractData.hoa = Number(match[1].replace(/,/g, ''));
          break;
        }
      }
      
      // Extract school ratings
      const schoolRegexes = [
        /(?:greatschools|school) rating\s*(?:\s*:|:)?\s*(\d+)(?:\s*\/\s*10)?/i,
        /schools rated (\d+)(?:\s*\/\s*10)?/i,
        /(\d+)(?:\s*\/\s*10) rated schools/i,
        /school score:? (\d+)/i
      ];
      
      for (const regex of schoolRegexes) {
        const match = listingText.match(regex);
        if (match && match[1] && !isNaN(Number(match[1]))) {
          extractData.schoolRating = Number(match[1]);
          break;
        }
      }
      
      // Extract commute time to train station
      const trainRegexes = [
        /(\d+)[\s-]*(?:min|minute|minutes)[\s-]*(?:to|from)[\s-]*(?:train|station|metro|transit)/i,
        /(?:train|station|metro|transit)[\s-]*(?:is|in)[\s-]*(\d+)[\s-]*(?:min|minute|minutes)/i,
        /(\d+)[\s-]*(?:min|minute|minutes)[\s-]*walk[\s-]*(?:to|from)[\s-]*(?:train|station)/i
      ];
      
      for (const regex of trainRegexes) {
        const match = listingText.match(regex);
        if (match && match[1] && !isNaN(Number(match[1]))) {
          extractData.distanceToTrainStation = Number(match[1]);
          break;
        }
      }
      
      // Extract commute time to Grand Central if not already set from town detection
      if (!extractData.distanceToGrandCentral) {
        const gctRegexes = [
          /(\d+)[\s-]*(?:min|minute|minutes)[\s-]*(?:to|from)[\s-]*(?:Grand Central|GCT|NYC|Manhattan|New York)/i,
          /(?:Grand Central|GCT|NYC|Manhattan|New York)[\s-]*(?:in|is)[\s-]*(\d+)[\s-]*(?:min|minute|minutes)/i,
          /commute to nyc:? (\d+)[\s-]*(?:min|minute|minutes)/i
        ];
        
        for (const regex of gctRegexes) {
          const match = listingText.match(regex);
          if (match && match[1] && !isNaN(Number(match[1]))) {
            extractData.distanceToGrandCentral = Number(match[1]);
            break;
          }
        }
      }
      
      // Create new form data with extracted information
      const updatedFormData = { ...formData };
      
      // Apply all valid extracted data to the form
      Object.keys(extractData).forEach(key => {
        // Only update if the value is valid
        if (extractData[key] !== undefined && extractData[key] !== null && 
            (typeof extractData[key] !== 'number' || !isNaN(extractData[key]))) {
          updatedFormData[key] = extractData[key];
        }
      });
      
      // Update property taxes if state and county were detected but taxes weren't in listing
      if (extractData.state && extractData.county && !extractData.propertyTaxes && 
          taxRates[extractData.state]?.[extractData.county] && extractData.purchasePrice) {
        updatedFormData.propertyTaxes = Math.round(extractData.purchasePrice * 
          taxRates[extractData.state][extractData.county] / 100);
      }
      
      // Set appreciation rate based on historical data if available
      if (extractData.state && extractData.county && 
          historicalAppreciation[extractData.state]?.[extractData.county]) {
        updatedFormData.appreciationRate = historicalAppreciation[extractData.state][extractData.county];
      }
      
      // Log results for debugging
      console.log('Extracted data:', extractData);
      
      // Update form data
      setFormData(updatedFormData);
      setParsingStatus('Listing parsed successfully!');
      
      // Success notification
      toast.success('Listing parsed successfully!');
      
      // Clear the listing text and status after a delay
      setTimeout(() => {
        setParsingStatus('');
        setListingText('');
      }, 3000);
      
    } catch (error) {
      console.error('Error parsing listing:', error);
      setParsingStatus('Error parsing listing. Please try again.');
      toast.error('Error parsing listing. Please try again.');
    }
  };

  // Function to handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let updatedValue = value;
    if (name !== 'state' && name !== 'county') {
      updatedValue = value === '' ? '' : Number(value);
    }
    
    let updatedFormData = {
      ...formData,
      [name]: updatedValue
    };
    
    // Reset county when state changes
    if (name === 'state') {
      updatedFormData.county = '';
    }
    
    // Update property taxes based on county
    if ((name === 'county' || name === 'purchasePrice') && 
        updatedFormData.county && 
        taxRates[updatedFormData.state]?.[updatedFormData.county]) {
      const rate = taxRates[updatedFormData.state][updatedFormData.county];
      updatedFormData.propertyTaxes = Math.round(updatedFormData.purchasePrice * rate / 100);
    }
    
    // Update appreciation rate based on historical data
    if (name === 'county' && 
        historicalAppreciation[updatedFormData.state]?.[updatedFormData.county]) {
      updatedFormData.appreciationRate = historicalAppreciation[updatedFormData.state][updatedFormData.county];
    }
    
    setFormData(updatedFormData);
  };

  // Function to validate the form
  const validateForm = () => {
    const errors = {};
    
    // Required fields
    if (!formData.state) errors.state = "State is required";
    if (!formData.county) errors.county = "County is required";
    if (!formData.purchasePrice || formData.purchasePrice <= 0) errors.purchasePrice = "Purchase price must be greater than 0";
    if (!formData.downPayment || formData.downPayment <= 0) errors.downPayment = "Down payment must be greater than 0";
    if (formData.downPayment >= formData.purchasePrice) errors.downPayment = "Down payment must be less than purchase price";
    if (!formData.mortgageRate || formData.mortgageRate <= 0) errors.mortgageRate = "Mortgage rate must be greater than 0";
    if (!formData.holdingPeriod || formData.holdingPeriod <= 0) errors.holdingPeriod = "Holding period must be greater than 0";
    
    // Other validations
    if (formData.bedrooms <= 0) errors.bedrooms = "Bedrooms must be greater than 0";
    if (formData.bathrooms <= 0) errors.bathrooms = "Bathrooms must be greater than 0";
    if (formData.squareFeet <= 0) errors.squareFeet = "Square feet must be greater than 0";
    if (formData.yearBuilt <= 1800 || formData.yearBuilt > new Date().getFullYear()) {
      errors.yearBuilt = "Year built must be between 1800 and current year";
    }
    if (formData.propertyTaxes < 0) errors.propertyTaxes = "Property taxes cannot be negative";
    if (formData.hoa < 0) errors.hoa = "HOA cannot be negative";
    if (formData.renovationBudget < 0) errors.renovationBudget = "Renovation budget cannot be negative";
    if (formData.schoolRating < 0 || formData.schoolRating > 10) errors.schoolRating = "School rating must be between 0 and 10";
    if (formData.distanceToTrainStation < 0) errors.distanceToTrainStation = "Distance to train cannot be negative";
    if (formData.distanceToGrandCentral < 0) errors.distanceToGrandCentral = "Distance to Grand Central cannot be negative";
    if (formData.appreciationRate < 0) errors.appreciationRate = "Appreciation rate cannot be negative";
    if (formData.vacancyRate < 0 || formData.vacancyRate > 100) errors.vacancyRate = "Vacancy rate must be between 0 and 100";
    if (formData.maintenanceCostPerSqFt < 0) errors.maintenanceCostPerSqFt = "Maintenance cost cannot be negative";
    if (formData.monthlyRentalIncomePerSqFt < 0) errors.monthlyRentalIncomePerSqFt = "Rental income cannot be negative";
    if (formData.sellingCosts < 0 || formData.sellingCosts > 100) errors.sellingCosts = "Selling costs must be between 0 and 100";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Calculate monthly mortgage payment
  const calculateMonthlyPayment = (principal, rate, years) => {
    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;
    
    if (monthlyRate === 0) return principal / numPayments;
    
    return principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  };

  // Calculate Net Present Value (NPV)
  const calculateNPV = (initialInvestment, cashFlows, discountRate) => {
    const rate = discountRate / 100;
    let npv = -initialInvestment;
    
    for (let i = 0; i < cashFlows.length; i++) {
      npv += cashFlows[i] / Math.pow(1 + rate, i + 1);
    }
    
    return npv;
  };

  // Calculate Internal Rate of Return (IRR) using iterative approach
  const calculateIRR = (initialInvestment, cashFlows) => {
    // Use bisection method to find IRR
    let lowRate = -0.99; // -99%
    let highRate = 1; // 100% 
    let targetNPV = 0;
    let currentNPV = 0;
    let currentRate = 0;
    let previousNPV = 0;
    
    // Maximum iterations and precision
    const maxIterations = 100;
    const precision = 0.0001;
    
    // Start with a guess
    for (let i = 0; i < maxIterations; i++) {
      currentRate = (lowRate + highRate) / 2;
      
      // Calculate NPV at current rate
      currentNPV = -initialInvestment;
      for (let j = 0; j < cashFlows.length; j++) {
        currentNPV += cashFlows[j] / Math.pow(1 + currentRate, j + 1);
      }
      
      // Check if we've reached desired precision
      if (Math.abs(currentNPV) < precision) {
        return currentRate * 100; // Convert to percentage
      }
      
      // Adjust our bounds based on the NPV
      if (currentNPV > 0) {
        lowRate = currentRate;
      } else {
        highRate = currentRate;
      }
      
      // Check for convergence
      if (Math.abs(previousNPV - currentNPV) < precision) {
        return currentRate * 100; // Convert to percentage
      }
      
      previousNPV = currentNPV;
    }
    
    // If we reach here, we didn't converge
    return currentRate * 100; // Return best guess
  };

  // Calculate detailed cash flows for more accurate IRR
  const calculateDetailedCashFlows = () => {
    // Initial investment
    const initialInvestment = formData.downPayment + formData.renovationBudget;
    
    // Loan details
    const loanAmount = formData.purchasePrice - formData.downPayment;
    const monthlyMortgagePayment = calculateMonthlyPayment(loanAmount, formData.mortgageRate, 30);
    const annualMortgagePayment = monthlyMortgagePayment * 12;
    
    // Annual expenses
    const annualPropertyTaxes = formData.propertyTaxes;
    const annualHOA = formData.hoa * 12;
    const annualMaintenance = formData.squareFeet * formData.maintenanceCostPerSqFt;
    const annualInsurance = formData.purchasePrice * 0.004; // Assume 0.4% of purchase price for insurance
    
    // Annual rental income
    const monthlyRentalIncome = formData.squareFeet * formData.monthlyRentalIncomePerSqFt;
    const annualRentalIncome = monthlyRentalIncome * 12 * (1 - formData.vacancyRate / 100);
    
    // Calculate cash flow for each year
    const yearlyPrincipalPayments = [];
    const yearlyInterestPayments = [];
    const yearlyCashFlows = [];
    
    let remainingBalance = loanAmount;
    const monthlyRate = formData.mortgageRate / 100 / 12;
    
    // Calculate yearly principal and interest payments
    for (let year = 1; year <= formData.holdingPeriod; year++) {
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;
      
      for (let month = 1; month <= 12; month++) {
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = monthlyMortgagePayment - interestPayment;
        
        yearlyPrincipal += principalPayment;
        yearlyInterest += interestPayment;
        remainingBalance -= principalPayment;
      }
      
      yearlyPrincipalPayments.push(yearlyPrincipal);
      yearlyInterestPayments.push(yearlyInterest);
      
      // Calculate cash flow for the year
      // Note: Adding principal payments back since this is an accounting cash flow
      const operatingIncome = annualRentalIncome - annualPropertyTaxes - annualHOA - annualMaintenance - annualInsurance;
      const cashFlow = operatingIncome - yearlyInterest - yearlyPrincipal;
      
      yearlyCashFlows.push(cashFlow);
    }
    
    // Final year includes sale proceeds
    const appreciatedValue = formData.purchasePrice * Math.pow(1 + formData.appreciationRate / 100, formData.holdingPeriod);
    const sellingCosts = appreciatedValue * (formData.sellingCosts / 100);
    const netSaleProceeds = appreciatedValue - sellingCosts - remainingBalance;
    
    // Add sale proceeds to final year cash flow
    yearlyCashFlows[formData.holdingPeriod - 1] += netSaleProceeds;
    
    return {
      initialInvestment,
      yearlyCashFlows,
      remainingBalance,
      appreciatedValue,
      netSaleProceeds
    };
  };cat HomeAssessmentTool.jsx
cat HomeAssessmentTool.jsx
cat > HomeAssessmentTool.jsx
