import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coinsService } from '../services/coinsService';
import './Trade.css';

const Trade = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('buy');
  const [selectedCoin, setSelectedCoin] = useState('');
  const [amount, setAmount] = useState('');
  const [conversionCoin, setConversionCoin] = useState('');
  const [conversionAmount, setConversionAmount] = useState('');
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [userPortfolio, setUserPortfolio] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCoins();
    fetchTransactionHistory();
    fetchUserPortfolio();
  }, []);

  const fetchCoins = async () => {
    try {
      setLoading(true);
      setError(null);
      const coinsData = await coinsService.getAllCoins();
      setCoins(coinsData);
      if (coinsData.length > 0) {
        setSelectedCoin(coinsData[0].c_id);
        setConversionCoin(coinsData[0].c_id);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch coins');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionHistory = async () => {
    try {
      const history = await coinsService.getTransactionHistory();
      setTransactionHistory(history);
    } catch (err) {
      console.error('Failed to fetch transaction history:', err);
    }
  };

  const fetchUserPortfolio = async () => {
    try {
      const portfolio = await coinsService.getUserPortfolio();
      setUserPortfolio(portfolio);
    } catch (err) {
      console.error('Failed to fetch user portfolio:', err);
    }
  };

  // Get only coins that user owns
  const getUserOwnedCoins = () => {
    if (!userPortfolio || !userPortfolio.holdings) return [];
    
    return coins.filter(coin => {
      const holding = userPortfolio.holdings.find(h => h.coinId === coin.c_id);
      return holding && holding.amount > 0;
    });
  };

  // Get user's holding for a specific coin
  const getUserHolding = (coinId) => {
    if (!userPortfolio || !userPortfolio.holdings) return null;
    return userPortfolio.holdings.find(h => h.coinId === coinId);
  };

  const handleBuy = async () => {
    if (!selectedCoin || !amount || amount <= 0) {
      setError('Please select a coin and enter a valid amount');
      return;
    }

    try {
      setError(null);
      await coinsService.buyCoin(selectedCoin, parseFloat(amount));
      setAmount('');
      fetchTransactionHistory();
      fetchUserPortfolio();
      alert('Purchase successful!');
    } catch (err) {
      setError(err.message || 'Purchase failed');
    }
  };

  const handleSell = async () => {
    if (!selectedCoin || !amount || amount <= 0) {
      setError('Please select a coin and enter a valid amount');
      return;
    }

    const holding = getUserHolding(selectedCoin);
    if (!holding || holding.amount < parseFloat(amount)) {
      setError('Insufficient coins to sell');
      return;
    }

    try {
      setError(null);
      await coinsService.sellCoin(selectedCoin, parseFloat(amount));
      setAmount('');
      fetchTransactionHistory();
      fetchUserPortfolio();
      alert('Sale successful!');
    } catch (err) {
      setError(err.message || 'Sale failed');
    }
  };

  const handleConvert = async () => {
    if (!selectedCoin || !conversionCoin || !conversionAmount || conversionAmount <= 0) {
      setError('Please select coins and enter a valid amount');
      return;
    }

    if (selectedCoin === conversionCoin) {
      setError('Cannot convert to the same coin');
      return;
    }

    const holding = getUserHolding(selectedCoin);
    if (!holding || holding.amount < parseFloat(conversionAmount)) {
      setError('Insufficient coins to convert');
      return;
    }

    try {
      setError(null);
      await coinsService.convertCoin(selectedCoin, conversionCoin, parseFloat(conversionAmount));
      setConversionAmount('');
      fetchTransactionHistory();
      fetchUserPortfolio();
      alert('Conversion successful!');
    } catch (err) {
      setError(err.message || 'Conversion failed');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const getCoinPrice = (coinId) => {
    const coin = coins.find(c => c.c_id === coinId);
    return coin ? coin.price : 0;
  };

  const calculateTotal = (coinId, amount) => {
    const price = getCoinPrice(coinId);
    return (price * amount).toFixed(2);
  };

  // Update selected coin when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setAmount('');
    setConversionAmount('');
    
    if (tab === 'sell') {
      const ownedCoins = getUserOwnedCoins();
      if (ownedCoins.length > 0) {
        setSelectedCoin(ownedCoins[0].c_id);
      }
    } else if (tab === 'buy' || tab === 'convert') {
      if (coins.length > 0) {
        setSelectedCoin(coins[0].c_id);
      }
    }
  };

  if (loading) {
    return (
      <div className="trade-page">
        <div className="back-button-container">
          <button onClick={handleBack} className="back-btn">
            ← Back to Home
          </button>
        </div>
        <div className="loading">Loading trade options...</div>
      </div>
    );
  }

  return (
    <div className="trade-page">
      <div className="back-button-container">
        <button onClick={handleBack} className="back-btn">
          ← Back to Home
        </button>
      </div>
      
      <h1>Trade Center</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="trade-tabs">
        <button 
          className={`tab-btn ${activeTab === 'buy' ? 'active' : ''}`}
          onClick={() => handleTabChange('buy')}
        >
          Buy
        </button>
        <button 
          className={`tab-btn ${activeTab === 'sell' ? 'active' : ''}`}
          onClick={() => handleTabChange('sell')}
        >
          Sell
        </button>
        <button 
          className={`tab-btn ${activeTab === 'convert' ? 'active' : ''}`}
          onClick={() => handleTabChange('convert')}
        >
          Convert
        </button>
      </div>

      <div className="trade-content">
        {activeTab === 'buy' && (
          <div className="trade-form">
            <h2>Buy Coins</h2>
            <div className="form-group">
              <label>Select Coin:</label>
              <select 
                value={selectedCoin} 
                onChange={(e) => setSelectedCoin(e.target.value)}
                className="form-select"
              >
                {coins.map(coin => (
                  <option key={coin.c_id} value={coin.c_id}>
                    {coin.c_name} (${coin.price})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Amount:</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="form-input"
                min="0"
                step="0.01"
              />
            </div>
            {amount && selectedCoin && (
              <div className="calculation">
                <p>Total Cost: ${calculateTotal(selectedCoin, amount)}</p>
                {userPortfolio && (
                  <p>Available Balance: ${userPortfolio.balance?.toFixed(2)}</p>
                )}
              </div>
            )}
            <button onClick={handleBuy} className="trade-btn buy-btn">
              Buy Coins
            </button>
          </div>
        )}

        {activeTab === 'sell' && (
          <div className="trade-form">
            <h2>Sell Coins</h2>
            <div className="form-group">
              <label>Select Coin:</label>
              <select 
                value={selectedCoin} 
                onChange={(e) => setSelectedCoin(e.target.value)}
                className="form-select"
              >
                {getUserOwnedCoins().map(coin => {
                  const holding = getUserHolding(coin.c_id);
                  return (
                    <option key={coin.c_id} value={coin.c_id}>
                      {coin.c_name} - Owned: {holding?.amount?.toFixed(2)} (${coin.price})
                    </option>
                  );
                })}
              </select>
            </div>
            {selectedCoin && (
              <div className="form-group">
                <label>Amount to Sell:</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="form-input"
                  min="0"
                  step="0.01"
                  max={getUserHolding(selectedCoin)?.amount || 0}
                />
                <small className="form-help">
                  Available: {getUserHolding(selectedCoin)?.amount?.toFixed(2) || 0}
                </small>
              </div>
            )}
            {amount && selectedCoin && (
              <div className="calculation">
                <p>Total Value: ${calculateTotal(selectedCoin, amount)}</p>
                <p>Remaining: {((getUserHolding(selectedCoin)?.amount || 0) - parseFloat(amount)).toFixed(2)}</p>
              </div>
            )}
            <button 
              onClick={handleSell} 
              className="trade-btn sell-btn"
              disabled={!selectedCoin || !amount || amount <= 0}
            >
              Sell Coins
            </button>
          </div>
        )}

        {activeTab === 'convert' && (
          <div className="trade-form">
            <h2>Convert Coins</h2>
            <div className="form-group">
              <label>From Coin:</label>
              <select 
                value={selectedCoin} 
                onChange={(e) => setSelectedCoin(e.target.value)}
                className="form-select"
              >
                {getUserOwnedCoins().map(coin => {
                  const holding = getUserHolding(coin.c_id);
                  return (
                    <option key={coin.c_id} value={coin.c_id}>
                      {coin.c_name} - Owned: {holding?.amount?.toFixed(2)} (${coin.price})
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="form-group">
              <label>To Coin:</label>
              <select 
                value={conversionCoin} 
                onChange={(e) => setConversionCoin(e.target.value)}
                className="form-select"
              >
                {coins.map(coin => (
                  <option key={coin.c_id} value={coin.c_id}>
                    {coin.c_name} (${coin.price})
                  </option>
                ))}
              </select>
            </div>
            {selectedCoin && (
              <div className="form-group">
                <label>Amount to Convert:</label>
                <input
                  type="number"
                  value={conversionAmount}
                  onChange={(e) => setConversionAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="form-input"
                  min="0"
                  step="0.01"
                  max={getUserHolding(selectedCoin)?.amount || 0}
                />
                <small className="form-help">
                  Available: {getUserHolding(selectedCoin)?.amount?.toFixed(2) || 0}
                </small>
              </div>
            )}
            {conversionAmount && selectedCoin && conversionCoin && (
              <div className="calculation">
                <p>Converting: {conversionAmount} {selectedCoin}</p>
                <p>To: {coins.find(c => c.c_id === conversionCoin)?.c_name}</p>
                <p>Estimated: {((parseFloat(conversionAmount) * getCoinPrice(selectedCoin)) / getCoinPrice(conversionCoin)).toFixed(4)} {conversionCoin}</p>
              </div>
            )}
            <button 
              onClick={handleConvert} 
              className="trade-btn convert-btn"
              disabled={!selectedCoin || !conversionCoin || !conversionAmount || conversionAmount <= 0}
            >
              Convert Coins
            </button>
          </div>
        )}
      </div>

      <div className="transaction-history">
        <h2>Transaction History</h2>
        <div className="history-list">
          {transactionHistory.length === 0 ? (
            <p className="no-history">No transactions yet</p>
          ) : (
            transactionHistory.map((transaction, index) => (
              <div key={index} className="history-item">
                <div className="transaction-type">{transaction.type}</div>
                <div className="transaction-details">
                  <span>{transaction.coinId}</span>
                  <span>{transaction.amount}</span>
                  <span>${transaction.totalValue}</span>
                </div>
                <div className="transaction-date">
                  {new Date(transaction.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Trade;
