import api from './authService';

export const coinsService = {
  // Get all coins
  async getAllCoins() {
    try {
      console.log('Fetching all coins...');
      const response = await api.get('/coins');
      console.log('Coins fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch coins:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Failed to fetch coins' };
    }
  },

  // Buy coins
  async buyCoin(coinId, amount) {
    try {
      console.log(`Buying ${amount} of coin ${coinId}...`);
      const response = await api.post('/coins/buy', { coinId, amount });
      console.log('Purchase successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Purchase failed:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Purchase failed' };
    }
  },

  // Sell coins
  async sellCoin(coinId, amount) {
    try {
      console.log(`Selling ${amount} of coin ${coinId}...`);
      const response = await api.post('/coins/sell', { coinId, amount });
      console.log('Sale successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Sale failed:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Sale failed' };
    }
  },

  // Convert coins
  async convertCoin(fromCoinId, toCoinId, amount) {
    try {
      console.log(`Converting ${amount} from ${fromCoinId} to ${toCoinId}...`);
      const response = await api.post('/coins/convert', { fromCoinId, toCoinId, amount });
      console.log('Conversion successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Conversion failed:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Conversion failed' };
    }
  },

  // Get transaction history
  async getTransactionHistory() {
    try {
      console.log('Fetching transaction history...');
      const response = await api.get('/coins/transactions');
      console.log('Transaction history fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transaction history:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Failed to fetch transaction history' };
    }
  },

  // Get user portfolio
  async getUserPortfolio() {
    try {
      console.log('Fetching user portfolio...');
      const response = await api.get('/coins/portfolio');
      console.log('Portfolio fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch portfolio:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Failed to fetch portfolio' };
    }
  }
};

export default coinsService;
