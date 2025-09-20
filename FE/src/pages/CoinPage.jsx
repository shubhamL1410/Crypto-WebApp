import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coinsService } from '../services/coinsService';
import './CoinPage.css';

const CoinPage = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCoins();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchCoins, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCoins = async () => {
    try {
      setLoading(true);
      setError(null);
      const coinsData = await coinsService.getAllCoins();
      setCoins(coinsData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || 'Failed to fetch coins');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (query.trim() === '') {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }
    
    try {
      const results = await coinsService.searchCoins(query);
      // Filter for exact matches only (case-insensitive)
      const exactMatches = results.filter(coin => 
        coin.name.toLowerCase() === query.toLowerCase() || 
        coin.symbol.toLowerCase() === query.toLowerCase()
      );
      setSearchResults(exactMatches);
      setShowSearch(true);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const formatPrice = (price) => {
    if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  };

  const formatChange = (change) => {
    const isPositive = change >= 0;
    return (
      <span className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? '+' : ''}{change?.toFixed(2) || 0}%
      </span>
    );
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="coin-page">
        <div className="back-button-container">
          <button onClick={handleBack} className="back-btn">
            ← Back to Home
          </button>
        </div>
        <div className="loading">Loading coins...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="coin-page">
        <div className="back-button-container">
          <button onClick={handleBack} className="back-btn">
            ← Back to Home
          </button>
        </div>
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={fetchCoins} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="coin-page">
      <div className="back-button-container">
        <button onClick={handleBack} className="back-btn">
          ← Back to Home
        </button>
      </div>
      
      <h1>All Coins</h1>
      {lastUpdated && (
        <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '1rem'}}>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      <div className="search-container">
        <input
          type="text"
          placeholder="Search cryptocurrencies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch(searchQuery);
            }
          }}
          className="search-input"
        />
        <button 
          onClick={() => handleSearch(searchQuery)}
          className="search-btn"
        >
          Search
        </button>
        <button 
          onClick={() => {
            setSearchQuery('');
            setSearchResults([]);
            setShowSearch(false);
          }}
          className="clear-btn"
        >
          Clear
        </button>
      </div>
      
      {showSearch && (
        <div className="search-results">
          <h3>Search Results</h3>
          {searchResults.length > 0 ? (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem'}}>
              {searchResults.slice(0, 6).map((coin) => (
                <div key={coin.id} style={{
                  padding: '0.5rem',
                  border: '1px solid #e1e5e9',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    {coin.thumb && (
                      <img src={coin.thumb} alt={coin.name} style={{width: '20px', height: '20px', marginRight: '0.5rem'}} />
                    )}
                    <div>
                      <h4 style={{margin: 0, fontSize: '0.9rem'}}>{coin.name}</h4>
                      <span style={{fontSize: '0.8rem', color: '#666'}}>{coin.symbol?.toUpperCase()}</span>
                    </div>
                  </div>
                  <div style={{fontSize: '0.8rem', color: '#666', marginTop: '0.25rem'}}>
                    Rank: {coin.market_cap_rank || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>No exact matches found for "{searchQuery}"</p>
              <p style={{fontSize: '0.9rem'}}>Try searching for the exact coin name or symbol (e.g., "Bitcoin" or "BTC")</p>
            </div>
          )}
        </div>
      )}

      <div className="coins-grid">
        {coins.length === 0 ? (
          <div className="no-coins">No coins available</div>
        ) : (
          coins.map((coin) => (
            <div key={coin._id} className="coin-card">
              <div className="coin-header">
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.5rem'}}>
                  {coin.image && (
                    <img 
                      src={coin.image} 
                      alt={coin.c_name} 
                      style={{
                        width: '32px', 
                        height: '32px', 
                        marginRight: '0.75rem', 
                        borderRadius: '50%'
                      }} 
                    />
                  )}
                  <div>
                    <h3 style={{margin: 0}}>{coin.c_name}</h3>
                    <span className="coin-id">ID: {coin.c_id}</span>
                  </div>
                </div>
              </div>
              <div className="coin-price">
                <span className="price-label">Price:</span>
                <span className="price-value">${coin.price?.toFixed(2) || 'N/A'}</span>
              </div>
              {coin.price_change_24h !== undefined && (
                <div style={{
                  color: coin.price_change_24h >= 0 ? '#22c55e' : '#ef4444',
                  fontWeight: 'bold',
                  marginTop: '0.5rem'
                }}>
                  {coin.price_change_24h >= 0 ? '+' : ''}{coin.price_change_24h?.toFixed(2) || 0}%
                </div>
              )}
              {coin.market_cap && (
                <div style={{fontSize: '0.9rem', color: '#666', marginTop: '0.5rem'}}>
                  Market Cap: ${coin.market_cap?.toLocaleString() || 'N/A'}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CoinPage;
