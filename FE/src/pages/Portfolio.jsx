import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { portfolioService } from '../services/portfolioService';
import { coinsService } from '../services/coinsService';
import { authService } from '../services/authService';
import './Portfolio.css';

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [coinPrices, setCoinPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalValue, setTotalValue] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated before fetching portfolio
    if (!authService.isAuthenticated()) {
      setError('Please log in to view your portfolio.');
      setLoading(false);
      return;
    }
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user's portfolio using the working endpoint
      const portfolioData = await coinsService.getUserPortfolio();
      console.log('Portfolio data received:', portfolioData);
      
      if (portfolioData && portfolioData.holdings) {
        // Convert holdings to portfolio format for display
        const portfolioItems = portfolioData.holdings.map(holding => ({
          coin_name: holding.coinId,
          amount: holding.amount,
          avgBuyPrice: holding.avgBuyPrice || 0
        }));
        
        setPortfolio(portfolioItems);
        
        // Fetch current prices for all coins in portfolio
        if (portfolioItems.length > 0) {
          const coinNames = portfolioItems.map(item => item.coin_name);
          console.log('Fetching prices for coins:', coinNames);
          await fetchCoinPrices(coinNames, portfolioItems);
        }
      } else {
        console.log('No portfolio data found or empty portfolio');
        setPortfolio([]);
      }
    } catch (err) {
      console.error('Failed to fetch portfolio:', err);
      if (err.message && err.message.includes('401')) {
        setError('Please log in to view your portfolio.');
      } else {
        setError('Failed to load portfolio. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCoinPrices = async (coinNames, portfolioItems) => {
    try {
      const prices = {};
      let total = 0;
      
      // Get all coins from database first
      const allCoins = await coinsService.getAllCoins();
      console.log('All coins from database:', allCoins);
      
      for (const coinName of coinNames) {
        try {
          // Find coin in database by ID or name
          const coin = allCoins.find(c => 
            c.c_id === coinName || 
            c.c_name === coinName ||
            c.c_name?.toLowerCase() === coinName?.toLowerCase()
          );
          
          if (coin) {
            const price = coin.price || 0;
            prices[coinName] = price;
            
            // Calculate total value using the passed portfolioItems
            const portfolioItem = portfolioItems.find(item => item.coin_name === coinName);
            if (portfolioItem) {
              total += portfolioItem.amount * price;
            }
            console.log(`${coinName}: ${portfolioItem?.amount || 0} * ${price} = ${(portfolioItem?.amount || 0) * price}`);
          } else {
            console.warn(`Coin not found in database: ${coinName}`);
            prices[coinName] = 0;
          }
        } catch (err) {
          console.error(`Failed to fetch price for ${coinName}:`, err);
          prices[coinName] = 0;
        }
      }
      
      console.log('Total calculated:', total);
      setCoinPrices(prices);
      setTotalValue(total);
    } catch (err) {
      console.error('Failed to fetch coin prices:', err);
    }
  };

  const handleDeletePortfolioItem = async (id) => {
    // Removed delete functionality - users cannot remove coins from portfolio
    console.log('Delete functionality disabled');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="portfolio-container">
        <div className="loading">Loading your portfolio...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-container">
        <div className="error">
          <h2>Error Loading Portfolio</h2>
          <p>{error}</p>
          <p>Please make sure you are logged in and try again.</p>
        </div>
        <button onClick={fetchPortfolio} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="portfolio-container">
      <div className="back-button-container">
        <button onClick={handleBack} className="back-btn">
          ← Back to Home
        </button>
      </div>
      
      <div className="portfolio-header">
        <h1>My Portfolio</h1>
        <div className="portfolio-summary">
          <div className="total-value">
            <span className="label">Total Value:</span>
            <span className="value">{formatPrice(totalValue)}</span>
          </div>
          <div className="total-coins">
            <span className="label">Coins Owned:</span>
            <span className="value">{portfolio.length}</span>
          </div>
        </div>
      </div>

      {portfolio.length === 0 ? (
        <div className="empty-portfolio">
          <h2>Your portfolio is empty</h2>
          <p>Start by buying some coins to see them here!</p>
        </div>
      ) : (
        <div className="portfolio-grid">
          {portfolio.map((item) => {
            const currentPrice = coinPrices[item.coin_name] || 0;
            const currentValue = item.amount * currentPrice;
            const avgPrice = item.avgBuyPrice || 0;
            const profitLoss = currentValue - (item.amount * avgPrice);
            const profitLossPercentage = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;

            return (
              <div key={item._id} className="portfolio-card">
                <div className="card-header">
                  <h3>{item.coin_name}</h3>
                </div>
                
                <div className="card-content">
                  <div className="amount-info">
                    <div className="amount">
                      <span className="label">Amount:</span>
                      <span className="value">{item.amount.toFixed(6)}</span>
                    </div>
                    <div className="avg-price">
                      <span className="label">Avg Buy Price:</span>
                      <span className="value">{formatPrice(avgPrice)}</span>
                    </div>
                  </div>
                  
                  <div className="price-info">
                    <div className="current-price">
                      <span className="label">Current Price:</span>
                      <span className="value">{formatPrice(currentPrice)}</span>
                    </div>
                    <div className="current-value">
                      <span className="label">Current Value:</span>
                      <span className="value">{formatPrice(currentValue)}</span>
                    </div>
                  </div>
                  
                  <div className="profit-loss">
                    <div className="pnl-amount">
                      <span className="label">P&L:</span>
                      <span className={`value ${profitLoss >= 0 ? 'positive' : 'negative'}`}>
                        {formatPrice(profitLoss)}
                      </span>
                    </div>
                    <div className="pnl-percentage">
                      <span className="label">P&L %:</span>
                      <span className={`value ${profitLossPercentage >= 0 ? 'positive' : 'negative'}`}>
                        {formatPercentage(profitLossPercentage)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Portfolio;
