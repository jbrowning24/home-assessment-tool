import React from 'react';
import './InvestmentAnalysis.css';

/**
 * InvestmentAnalysis component displays detailed financial metrics
 * for property investment analysis
 */
const InvestmentAnalysis = ({ results, property }) => {
  if (!results) return null;
  
  const {
    initialInvestment,
    yearlyCashFlows,
    monthlyPayment,
    totalReturnDollars,
    totalReturnPercent,
    irr,
    averageAnnualReturn,
    capRate,
    cashOnCash,
    breakEven,
    appreciatedValue,
    rentalIncome,
    operatingExpenses,
    netOperatingIncome
  } = results;
  
  // Format currency values
  const formatCurrency = (value) => {
    return value?.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }) || '$0';
  };
  
  // Format percentage values
  const formatPercent = (value) => {
    return `${value?.toFixed(2)}%` || '0%';
  };
  
  return (
    <div className="investment-analysis">
      <div className="analysis-header">
        <h2>Investment Analysis Results</h2>
        {property && (
          <div className="property-summary">
            <h3>{formatCurrency(property.price)}</h3>
            <p>{property.address}</p>
            <div className="property-specs">
              <span>{property.bedrooms} bed</span>
              <span className="separator">|</span>
              <span>{property.bathrooms} bath</span>
              <span className="separator">|</span>
              <span>{property.squareFeet?.toLocaleString()} sqft</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="analysis-grid">
        {/* Key metrics */}
        <div className="analysis-section metrics-section">
          <h3>Key Return Metrics</h3>
          
          <div className="metrics-grid">
            <div className="metric">
              <span className="metric-value highlight">{formatPercent(irr)}</span>
              <span className="metric-label">IRR</span>
            </div>
            
            <div className="metric">
              <span className="metric-value highlight">{formatPercent(cashOnCash)}</span>
              <span className="metric-label">Cash-on-Cash Return</span>
            </div>
            
            <div className="metric">
              <span className="metric-value">{formatPercent(capRate)}</span>
              <span className="metric-label">Cap Rate</span>
            </div>
            
            <div className="metric">
              <span className="metric-value">{formatPercent(totalReturnPercent)}</span>
              <span className="metric-label">Total Return</span>
            </div>
            
            <div className="metric">
              <span className="metric-value">{formatPercent(averageAnnualReturn)}</span>
              <span className="metric-label">Avg Annual Return</span>
            </div>
            
            <div className="metric">
              <span className="metric-value">{breakEven} years</span>
              <span className="metric-label">Break-Even</span>
            </div>
          </div>
        </div>
        
        {/* Cash flow summary */}
        <div className="analysis-section cash-flow-section">
          <h3>Cash Flow Summary</h3>
          
          <div className="cash-flow-table">
            <div className="cash-flow-row">
              <span className="cash-flow-label">Initial Investment</span>
              <span className="cash-flow-value">{formatCurrency(initialInvestment)}</span>
            </div>
            
            <div className="cash-flow-row">
              <span className="cash-flow-label">Monthly Mortgage</span>
              <span className="cash-flow-value">{formatCurrency(monthlyPayment)}/mo</span>
            </div>
            
            <div className="cash-flow-row">
              <span className="cash-flow-label">Monthly Rental Income</span>
              <span className="cash-flow-value">{formatCurrency(rentalIncome / 12)}/mo</span>
            </div>
            
            <div className="cash-flow-row">
              <span className="cash-flow-label">Annual Operating Expenses</span>
              <span className="cash-flow-value">{formatCurrency(operatingExpenses)}/yr</span>
            </div>
            
            <div className="cash-flow-row">
              <span className="cash-flow-label">Net Operating Income (NOI)</span>
              <span className="cash-flow-value">{formatCurrency(netOperatingIncome)}/yr</span>
            </div>
            
            <div className="cash-flow-row highlight">
              <span className="cash-flow-label">Final Year Cash Flow</span>
              <span className="cash-flow-value">{formatCurrency(yearlyCashFlows[yearlyCashFlows.length - 1])}</span>
            </div>
            
            <div className="cash-flow-row highlight">
              <span className="cash-flow-label">Appreciated Value</span>
              <span className="cash-flow-value">{formatCurrency(appreciatedValue)}</span>
            </div>
            
            <div className="cash-flow-row highlight">
              <span className="cash-flow-label">Total Return</span>
              <span className="cash-flow-value">{formatCurrency(totalReturnDollars)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Yearly Cash Flow Chart */}
      <div className="analysis-section cash-flow-chart-section">
        <h3>Yearly Cash Flows</h3>
        
        <div className="cash-flow-chart">
          {yearlyCashFlows.map((cashFlow, index) => {
            const barHeight = Math.min(Math.abs(cashFlow) / 50000 * 100, 100);
            const isPositive = cashFlow >= 0;
            
            return (
              <div key={index} className="chart-bar-container">
                <div 
                  className={`chart-bar ${isPositive ? 'positive' : 'negative'}`}
                  style={{ 
                    height: `${barHeight}%`,
                    top: isPositive ? 'auto' : `${100 - barHeight}%` 
                  }}
                >
                  <span className="bar-value">{formatCurrency(cashFlow)}</span>
                </div>
                <span className="bar-label">Year {index + 1}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Recommendation Section */}
      <div className="analysis-section recommendation-section">
        <h3>Investment Recommendation</h3>
        
        {irr >= 10 ? (
          <div className="recommendation positive">
            <span className="recommendation-icon">👍</span>
            <div className="recommendation-content">
              <h4>Strong Investment Opportunity</h4>
              <p>This property has an excellent IRR of {formatPercent(irr)} and a cash-on-cash return of {formatPercent(cashOnCash)}, indicating a strong potential investment. With a break-even point of {breakEven} years, this property should provide positive returns relatively quickly.</p>
            </div>
          </div>
        ) : irr >= 5 ? (
          <div className="recommendation neutral">
            <span className="recommendation-icon">👌</span>
            <div className="recommendation-content">
              <h4>Moderate Investment Opportunity</h4>
              <p>This property has a decent IRR of {formatPercent(irr)} and a cash-on-cash return of {formatPercent(cashOnCash)}. Consider adjusting your investment parameters to improve returns, such as increasing rental income or reducing the purchase price through negotiation.</p>
            </div>
          </div>
        ) : (
          <div className="recommendation negative">
            <span className="recommendation-icon">👎</span>
            <div className="recommendation-content">
              <h4>Poor Investment Opportunity</h4>
              <p>This property has a low IRR of {formatPercent(irr)} and a cash-on-cash return of {formatPercent(cashOnCash)}. We recommend looking for better investment opportunities or significantly adjusting your investment parameters to improve returns.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentAnalysis;