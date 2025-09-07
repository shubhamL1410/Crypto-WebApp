import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coinsService } from '../services/coinsService';
import './CoinPage.css';

const CoinPage = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCoins();
  }, []);

  const fetchCoins = async () => {
    try {
      setLoading(true);
      setError(null);
      const coinsData = await coinsService.getAllCoins();
      setCoins(coinsData);
    } catch (err) {
      setError(err.message || 'Failed to fetch coins');
    } finally {
      setLoading(false);
    }
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
      <div className="coins-grid">
        {coins.length === 0 ? (
          <div className="no-coins">No coins available</div>
        ) : (
          coins.map((coin) => (
            <div key={coin._id} className="coin-card">
              <div className="coin-header">
                <h3>{coin.c_name}</h3>
                <span className="coin-id">ID: {coin.c_id}</span>
              </div>
              <div className="coin-price">
                <span className="price-label">Price:</span>
                <span className="price-value">${coin.price?.toFixed(2) || 'N/A'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CoinPage;
