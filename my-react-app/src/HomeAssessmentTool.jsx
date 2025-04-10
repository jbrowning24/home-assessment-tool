import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PropertySearch from './components/PropertySearch';
import PropertyListings from './components/PropertyListings';
import InvestmentAnalysis from './components/InvestmentAnalysis';
import './HomeAssessmentTool.css';

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

  // State for listing parser and property search
  const [listingText, setListingText] = useState('');
  const [parsingStatus, setParsingStatus] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [addressData, setAddressData] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  
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
  
  // Function to handle address selection from property search
  const handleAddressSelect = (address, placeDetails) => {
    setPropertyAddress(address);
    setAddressData(placeDetails);
    
    // If we have state and county from Google Places, update the form immediately
    if (placeDetails) {
      const updatedFormData = { ...formData };
      
      // Update state from place details
      if (placeDetails.state && ['NY', 'NJ', 'CT'].includes(placeDetails.state)) {
        updatedFormData.state = placeDetails.state;
      }
      
      // Update county from place details
      if (placeDetails.county) {
        const stateCounties = counties[updatedFormData.state] || [];
        // Verify the county exists in our data for the state
        const matchingCounty = stateCounties.find(county => 
          county.toLowerCase() === placeDetails.county.toLowerCase());
          
        if (matchingCounty) {
          updatedFormData.county = matchingCounty;
        }
      }
      
      setFormData(updatedFormData);
    }
    
    // Property data will be fetched by the PropertyListings component
  };
  
  // Function to handle property selection from listings
  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
    
    if (!property) return;
    
    // Update form data with property information
    const updatedFormData = { ...formData };
    
    // Update basic property details
    if (property.bedrooms) updatedFormData.bedrooms = property.bedrooms;
    if (property.bathrooms) updatedFormData.bathrooms = property.bathrooms;
    if (property.squareFeet) updatedFormData.squareFeet = property.squareFeet;
    if (property.yearBuilt) updatedFormData.yearBuilt = property.yearBuilt;
    if (property.price) updatedFormData.purchasePrice = property.price;
    
    // Default down payment to 20% of purchase price
    if (property.price) {
      updatedFormData.downPayment = Math.round(property.price * 0.2);
    }
    
    // Update location information
    if (property.state) updatedFormData.state = property.state;
    if (property.county) updatedFormData.county = property.county;
    
    // If we have state and county, use them to update property taxes and appreciation rate
    if (property.state && property.county) {
      if (taxRates[property.state]?.[property.county]) {
        updatedFormData.propertyTaxes = Math.round(property.price * 
          taxRates[property.state][property.county] / 100);
      }
      
      if (historicalAppreciation[property.state]?.[property.county]) {
        updatedFormData.appreciationRate = historicalAppreciation[property.state][property.county];
      }
    }
    
    // If we have coordinates, we can calculate distance to Grand Central
    if (property.lat && property.lng && window.google) {
      calculateCommuteTime(property.lat, property.lng);
    }
    
    setFormData(updatedFormData);
    toast.success('Property details loaded for analysis');
  };

  // Function to handle property analysis
  const handleAnalyzeProperty = (property) => {
    // Select the property first
    handlePropertySelect(property);
    
    // Then trigger analysis by simulating form submission
    validateForm() && handleCalculate(new Event('submit'));
  };
  
  // Function to calculate commute time to Grand Central using Directions API
  const calculateCommuteTime = (lat, lng) => {
    if (!window.google) return;
    
    const directionsService = new window.google.maps.DirectionsService();
    const origin = new window.google.maps.LatLng(lat, lng);
    const destination = "Grand Central Terminal, New York, NY";
    
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.TRANSIT,
      },
      (response, status) => {
        if (status === "OK") {
          const route = response.routes[0];
          const leg = route.legs[0];
          const durationMinutes = Math.round(leg.duration.value / 60);
          
          setFormData(prevData => ({
            ...prevData,
            distanceToGrandCentral: durationMinutes
          }));
          
          console.log(`Commute to Grand Central: ${leg.duration.text}`);
        } else {
          console.log(`Directions request failed: ${status}`);
        }
      }
    );
  };

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
        if (addressMatch[2]) {
          extractData.propertyAddress = `${addressMatch[1]}, ${addressMatch[2]}, ${addressMatch[3]} ${addressMatch[4]}`;
        }
      }
      
      // Extract bedrooms
      const bedroomsRegex = /(\d+)\s*(?:bed|bedroom|bdrm|br)s?\b/i;
      const bedroomsMatch = listingText.match(bedroomsRegex);
      if (bedroomsMatch && bedroomsMatch[1]) {
        extractData.bedrooms = Number(bedroomsMatch[1]);
      }
      
      // Extract bathrooms
      const bathroomsRegex = /(\d+(?:\.\d+)?)\s*(?:bath|bathroom|ba)s?\b/i;
      const bathroomsMatch = listingText.match(bathroomsRegex);
      if (bathroomsMatch && bathroomsMatch[1]) {
        extractData.bathrooms = Number(bathroomsMatch[1]);
      }
      
      // Extract square feet
      const sqftRegex = /(\d{3,4}(?:,\d{3})*)\s*(?:sq(?:\.|uare)?\s*(?:ft|feet)|sf)\b/i;
      const sqftMatch = listingText.match(sqftRegex);
      if (sqftMatch && sqftMatch[1]) {
        extractData.squareFeet = Number(sqftMatch[1].replace(/,/g, ''));
      }
      
      // Extract year built
      const yearBuiltRegex = /(?:built|constructed|year)\s*(?:in)?\s*(\d{4})\b/i;
      const yearBuiltMatch = listingText.match(yearBuiltRegex);
      if (yearBuiltMatch && yearBuiltMatch[1]) {
        const year = Number(yearBuiltMatch[1]);
        if (year >= 1800 && year <= new Date().getFullYear()) {
          extractData.yearBuilt = year;
        }
      }
      
      // Extract property taxes
      const taxesRegex = /(?:property|annual)\s*tax(?:es)?\s*(?:of)?\s*(?:\$)?\s*(\d{1,3}(?:,\d{3})+|\d{1,3}(?:,\d{3}){1,}(?:\.\d+)?|\d{4,}(?:\.\d+)?)/i;
      const taxesMatch = listingText.match(taxesRegex);
      if (taxesMatch && taxesMatch[1]) {
        extractData.propertyTaxes = Number(taxesMatch[1].replace(/,/g, ''));
      }
      
      // Extract HOA fees
      const hoaRegex = /(?:hoa|association)\s*(?:fee|dues)\s*(?:of)?\s*(?:\$)?\s*(\d{1,3}(?:,\d{3})+|\d{1,3}(?:,\d{3}){1,}(?:\.\d+)?|\d{1,3}(?:\.\d+)?)/i;
      const hoaMatch = listingText.match(hoaRegex);
      if (hoaMatch && hoaMatch[1]) {
        // Assume monthly HOA fees
        extractData.hoa = Number(hoaMatch[1].replace(/,/g, ''));
      }
      
      // Update form data
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

  // Other calculation functions...
  // (NPV, IRR, etc. - truncated for brevity)

  // Function to handle form submission
  const handleCalculate = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }
    
    // Perform calculations
    const analysisResults = calculateInvestmentMetrics();
    
    // Set results state to trigger UI update
    setResults(analysisResults);
    
    // Scroll to results section
    setTimeout(() => {
      const resultsElement = document.querySelector('.results-section');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    
    toast.success('Analysis complete!');
  };
  
  // Calculate detailed investment metrics
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
  
  const calculateInvestmentMetrics = () => {
    // Get cash flows data using the detailed cash flows function
    const cashFlowsData = calculateDetailedCashFlows();
    
    // Extract values
    const {
      initialInvestment,
      yearlyCashFlows,
      remainingBalance,
      appreciatedValue,
      netSaleProceeds
    } = cashFlowsData;
    
    // Calculate Internal Rate of Return (IRR) 
    const irr = calculateIRR(initialInvestment, yearlyCashFlows);
    
    // Calculate Net Present Value (NPV)
    const discountRate = 7; // Assume 7% discount rate
    const npv = calculateNPV(initialInvestment, yearlyCashFlows, discountRate);
    
    // Calculate total return
    const totalReturnDollars = yearlyCashFlows.reduce((sum, cf) => sum + cf, 0);
    const totalReturnPercent = (totalReturnDollars / initialInvestment) * 100;
    
    // Calculate average annual return
    const averageAnnualReturn = totalReturnPercent / formData.holdingPeriod;
    
    // Calculate loan details
    const loanAmount = formData.purchasePrice - formData.downPayment;
    const monthlyPayment = calculateMonthlyPayment(loanAmount, formData.mortgageRate, 30);
    const annualMortgagePayment = monthlyPayment * 12;
    
    // Calculate rental income
    const monthlyRentalIncome = formData.squareFeet * formData.monthlyRentalIncomePerSqFt;
    const annualRentalIncome = monthlyRentalIncome * 12 * (1 - formData.vacancyRate / 100);
    
    // Calculate operating expenses
    const annualPropertyTaxes = formData.propertyTaxes;
    const annualHOA = formData.hoa * 12;
    const annualMaintenance = formData.squareFeet * formData.maintenanceCostPerSqFt;
    const annualInsurance = formData.purchasePrice * 0.004; // Assume 0.4% of purchase price for insurance
    const totalOperatingExpenses = annualPropertyTaxes + annualHOA + annualMaintenance + annualInsurance;
    
    // Calculate Net Operating Income (NOI)
    const netOperatingIncome = annualRentalIncome - totalOperatingExpenses;
    
    // Calculate Cap Rate
    const capRate = (netOperatingIncome / formData.purchasePrice) * 100;
    
    // Calculate Cash-on-Cash Return
    const cashFlow = netOperatingIncome - annualMortgagePayment;
    const cashOnCash = (cashFlow / initialInvestment) * 100;
    
    // Calculate break-even point (in years)
    const yearlyNetCashFlows = yearlyCashFlows.map(cf => cf - annualMortgagePayment);
    let cumulativeCashFlow = -initialInvestment;
    let breakEven = formData.holdingPeriod; // Default to holding period
    
    for (let i = 0; i < yearlyNetCashFlows.length; i++) {
      cumulativeCashFlow += yearlyNetCashFlows[i];
      if (cumulativeCashFlow >= 0) {
        breakEven = i + 1;
        break;
      }
    }
    
    // Return comprehensive analysis results
    return {
      initialInvestment,
      yearlyCashFlows,
      remainingBalance,
      appreciatedValue,
      netSaleProceeds,
      irr,
      npv,
      totalReturnDollars,
      totalReturnPercent,
      averageAnnualReturn,
      monthlyPayment,
      capRate,
      cashOnCash,
      breakEven,
      rentalIncome: annualRentalIncome,
      operatingExpenses: totalOperatingExpenses,
      netOperatingIncome
    };
  };
  
  // Now let's render the UI with the PropertySearch and PropertyListings components
  return (
    <div className="home-assessment-tool">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <h1>Home Investment Assessment Tool</h1>
      
      {/* Property Search Bar */}
      <PropertySearch onAddressSelect={handleAddressSelect} />
      
      {/* Property Listings (will only show when a property is selected) */}
      {propertyAddress && (
        <PropertyListings 
          selectedAddress={propertyAddress}
          addressDetails={addressData}
          onSelectProperty={handlePropertySelect}
          onAnalyzeProperty={handleAnalyzeProperty}
        />
      )}
      
      <div className="tool-container">
        <div className="form-section">
          <h2>Investment Analysis Parameters</h2>
          
          <form onSubmit={handleCalculate}>
            <div className="form-row">
              <div className="form-group">
                <label>State</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={formErrors.state ? 'form-control error' : 'form-control'}
                >
                  <option value="">Select State</option>
                  <option value="NJ">New Jersey</option>
                  <option value="NY">New York</option>
                  <option value="CT">Connecticut</option>
                </select>
                {formErrors.state && <div className="error-message">{formErrors.state}</div>}
              </div>
              
              <div className="form-group">
                <label>County</label>
                <select
                  name="county"
                  value={formData.county}
                  onChange={handleInputChange}
                  className={formErrors.county ? 'form-control error' : 'form-control'}
                  disabled={!formData.state}
                >
                  <option value="">Select County</option>
                  {formData.state && counties[formData.state]?.map(county => (
                    <option key={county} value={county}>{county}</option>
                  ))}
                </select>
                {formErrors.county && <div className="error-message">{formErrors.county}</div>}
              </div>
            </div>
            
            {/* More form fields */}
            <div className="form-row">
              <div className="form-group">
                <label>Bedrooms</label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  className={formErrors.bedrooms ? 'form-control error' : 'form-control'}
                />
                {formErrors.bedrooms && <div className="error-message">{formErrors.bedrooms}</div>}
              </div>
              
              <div className="form-group">
                <label>Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  className={formErrors.bathrooms ? 'form-control error' : 'form-control'}
                  step="0.5"
                />
                {formErrors.bathrooms && <div className="error-message">{formErrors.bathrooms}</div>}
              </div>
              
              <div className="form-group">
                <label>Square Feet</label>
                <input
                  type="number"
                  name="squareFeet"
                  value={formData.squareFeet}
                  onChange={handleInputChange}
                  className={formErrors.squareFeet ? 'form-control error' : 'form-control'}
                />
                {formErrors.squareFeet && <div className="error-message">{formErrors.squareFeet}</div>}
              </div>
            </div>
            
            {/* Financial details */}
            <div className="form-row">
              <div className="form-group">
                <label>Purchase Price ($)</label>
                <input
                  type="number"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleInputChange}
                  className={formErrors.purchasePrice ? 'form-control error' : 'form-control'}
                />
                {formErrors.purchasePrice && <div className="error-message">{formErrors.purchasePrice}</div>}
              </div>
              
              <div className="form-group">
                <label>Down Payment ($)</label>
                <input
                  type="number"
                  name="downPayment"
                  value={formData.downPayment}
                  onChange={handleInputChange}
                  className={formErrors.downPayment ? 'form-control error' : 'form-control'}
                />
                {formErrors.downPayment && <div className="error-message">{formErrors.downPayment}</div>}
              </div>
              
              <div className="form-group">
                <label>Mortgage Rate (%)</label>
                <input
                  type="number"
                  name="mortgageRate"
                  value={formData.mortgageRate}
                  onChange={handleInputChange}
                  className={formErrors.mortgageRate ? 'form-control error' : 'form-control'}
                  step="0.01"
                />
                {formErrors.mortgageRate && <div className="error-message">{formErrors.mortgageRate}</div>}
              </div>
            </div>
            
            {/* Investment Parameters */}
            <div className="form-row">
              <div className="form-group">
                <label>Holding Period (years)</label>
                <input
                  type="number"
                  name="holdingPeriod"
                  value={formData.holdingPeriod}
                  onChange={handleInputChange}
                  className={formErrors.holdingPeriod ? 'form-control error' : 'form-control'}
                />
                {formErrors.holdingPeriod && <div className="error-message">{formErrors.holdingPeriod}</div>}
              </div>
              
              <div className="form-group">
                <label>Appreciation Rate (%)</label>
                <input
                  type="number"
                  name="appreciationRate"
                  value={formData.appreciationRate}
                  onChange={handleInputChange}
                  className={formErrors.appreciationRate ? 'form-control error' : 'form-control'}
                  step="0.1"
                />
                {formErrors.appreciationRate && <div className="error-message">{formErrors.appreciationRate}</div>}
              </div>
              
              <div className="form-group">
                <label>Selling Costs (%)</label>
                <input
                  type="number"
                  name="sellingCosts"
                  value={formData.sellingCosts}
                  onChange={handleInputChange}
                  className={formErrors.sellingCosts ? 'form-control error' : 'form-control'}
                  step="0.1"
                />
                {formErrors.sellingCosts && <div className="error-message">{formErrors.sellingCosts}</div>}
              </div>
            </div>
            
            {/* Rental Parameters */}
            <div className="form-row">
              <div className="form-group">
                <label>Monthly Rental Income (per sqft)</label>
                <input
                  type="number"
                  name="monthlyRentalIncomePerSqFt"
                  value={formData.monthlyRentalIncomePerSqFt}
                  onChange={handleInputChange}
                  className={formErrors.monthlyRentalIncomePerSqFt ? 'form-control error' : 'form-control'}
                  step="0.1"
                />
                {formErrors.monthlyRentalIncomePerSqFt && <div className="error-message">{formErrors.monthlyRentalIncomePerSqFt}</div>}
              </div>
              
              <div className="form-group">
                <label>Vacancy Rate (%)</label>
                <input
                  type="number"
                  name="vacancyRate"
                  value={formData.vacancyRate}
                  onChange={handleInputChange}
                  className={formErrors.vacancyRate ? 'form-control error' : 'form-control'}
                  step="0.1"
                />
                {formErrors.vacancyRate && <div className="error-message">{formErrors.vacancyRate}</div>}
              </div>
              
              <div className="form-group">
                <label>Maintenance Cost (per sqft/year)</label>
                <input
                  type="number"
                  name="maintenanceCostPerSqFt"
                  value={formData.maintenanceCostPerSqFt}
                  onChange={handleInputChange}
                  className={formErrors.maintenanceCostPerSqFt ? 'form-control error' : 'form-control'}
                  step="0.1"
                />
                {formErrors.maintenanceCostPerSqFt && <div className="error-message">{formErrors.maintenanceCostPerSqFt}</div>}
              </div>
            </div>
            
            <div className="button-row">
              <button type="submit" className="btn-primary">Calculate Investment</button>
            </div>
          </form>
        </div>
        
        {/* Listing Parser Section */}
        <div className="listing-parser">
          <h2>Property Listing Parser</h2>
          <p>Paste a property listing to automatically extract details</p>
          
          <textarea
            value={listingText}
            onChange={(e) => setListingText(e.target.value)}
            placeholder="Paste property listing text here..."
            rows={6}
          />
          
          <div className="button-row">
            <button 
              onClick={parseListingText} 
              disabled={!listingText} 
              className="btn-secondary"
            >
              Parse Listing
            </button>
          </div>
          
          {parsingStatus && <div className="parsing-status">{parsingStatus}</div>}
        </div>
        
        {/* Results Section */}
        {results && (
          <div className="results-section">
            <InvestmentAnalysis 
              results={results}
              property={selectedProperty}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeAssessmentTool;