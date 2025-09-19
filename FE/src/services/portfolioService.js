import api from './authService';

export const portfolioService = {
  // Get user portfolio
  async getPortfolio() {
    try {
      console.log('Fetching user portfolio...');
      console.log('API Base URL:', api.defaults.baseURL);
      console.log('Auth Token:', localStorage.getItem('token'));
      
      const response = await api.get('/portfolio');
      console.log('Portfolio fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      throw error.response?.data || { message: 'Failed to fetch portfolio' };
    }
  },

  // Get portfolio by user ID
  async getPortfolioByUserId(userId) {
    try {
      console.log(`Fetching portfolio for user: ${userId}`);
      const response = await api.get(`/portfolio/${userId}`);
      console.log('Portfolio fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch portfolio:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Failed to fetch portfolio' };
    }
  },

  // Add coin to portfolio
  async addToPortfolio(coinName, amount) {
    try {
      console.log(`Adding ${amount} of ${coinName} to portfolio...`);
      const response = await api.post('/portfolio', { coin_name: coinName, amount });
      console.log('Coin added to portfolio successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to add to portfolio:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Failed to add to portfolio' };
    }
  },

  // Update portfolio entry
  async updatePortfolioEntry(id, amount, avgBuyPrice) {
    try {
      console.log(`Updating portfolio entry ${id}...`);
      const response = await api.put(`/portfolio/${id}`, { amount, avgBuyPrice });
      console.log('Portfolio entry updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to update portfolio entry:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Failed to update portfolio entry' };
    }
  },

  // Delete portfolio entry
  async deletePortfolioEntry(id) {
    try {
      console.log(`Deleting portfolio entry ${id}...`);
      const response = await api.delete(`/portfolio/${id}`);
      console.log('Portfolio entry deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to delete portfolio entry:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Failed to delete portfolio entry' };
    }
  }
};

export default portfolioService;
