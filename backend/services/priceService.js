const axios = require('axios');

class PriceService {
    constructor() {
        this.baseURL = 'https://api.coingecko.com/api/v3';
        this.cache = new Map();
        this.cacheTimeout = 120000; // 2 minute cache
    }

    // Get real-time price for a specific coin
    async getCoinPrice(coinId) {
        try {
            const response = await axios.get(`${this.baseURL}/simple/price`, {
                params: {
                    ids: coinId,
                    vs_currencies: 'usd',
                    include_market_cap: true,
                    include_24hr_change: true,
                    include_24hr_vol: true
                },
                timeout: 10000 // 10 second timeout
            });

            const data = response.data[coinId];
            if (!data) {
                throw new Error(`Coin ${coinId} not found`);
            }

            return {
                id: coinId,
                price: data.usd || 0,
                market_cap: data.usd_market_cap || 0,
                price_change_24h: data.usd_24h_change || 0,
                volume_24h: data.usd_24h_vol || 0
            };
        } catch (error) {
            console.error(`Error fetching price for ${coinId}:`, error.message);
            // Return default values instead of throwing
            return {
                id: coinId,
                price: 0,
                market_cap: 0,
                price_change_24h: 0,
                volume_24h: 0
            };
        }
    }

    // Get multiple coin prices at once
    async getMultipleCoinPrices(coinIds) {
        try {
            const response = await axios.get(`${this.baseURL}/simple/price`, {
                params: {
                    ids: coinIds.join(','),
                    vs_currencies: 'usd',
                    include_market_cap: true,
                    include_24hr_change: true,
                    include_24hr_vol: true
                },
                timeout: 15000 // 15 second timeout
            });

            const results = {};
            for (const [coinId, data] of Object.entries(response.data)) {
                results[coinId] = {
                    id: coinId,
                    price: data.usd || 0,
                    market_cap: data.usd_market_cap || 0,
                    price_change_24h: data.usd_24h_change || 0,
                    volume_24h: data.usd_24h_vol || 0
                };
            }

            return results;
        } catch (error) {
            console.error('Error fetching multiple coin prices:', error.message);
            // Return empty results instead of throwing
            return {};
        }
    }

    // Get top cryptocurrencies by market cap
    async getTopCoins(limit = 50) {
        try {
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const response = await axios.get(`${this.baseURL}/coins/markets`, {
                params: {
                    vs_currency: 'usd',
                    order: 'market_cap_desc',
                    per_page: Math.min(limit, 20), // Limit to 20 to avoid rate limits
                    page: 1,
                    sparkline: false,
                    price_change_percentage: '24h'
                },
                timeout: 20000, // 20 second timeout
                headers: {
                    'User-Agent': 'Crypto-Tracker-App/1.0'
                }
            });

            return response.data.map(coin => ({
                id: coin.id,
                symbol: coin.symbol,
                name: coin.name,
                price: coin.current_price || 0,
                market_cap: coin.market_cap || 0,
                market_cap_rank: coin.market_cap_rank || 0,
                price_change_24h: coin.price_change_percentage_24h || 0,
                volume_24h: coin.total_volume || 0,
                image: coin.image || '',
                last_updated: coin.last_updated || new Date().toISOString()
            }));
        } catch (error) {
            console.error('Error fetching top coins:', error.message);
            // Return empty array instead of throwing
            return [];
        }
    }

    // Get coin details with full information
    async getCoinDetails(coinId) {
        try {
            const response = await axios.get(`${this.baseURL}/coins/${coinId}`, {
                params: {
                    localization: false,
                    tickers: false,
                    market_data: true,
                    community_data: false,
                    developer_data: false,
                    sparkline: false
                }
            });

            const data = response.data;
            return {
                id: data.id,
                symbol: data.symbol,
                name: data.name,
                description: data.description?.en || '',
                image: data.image?.large || data.image?.small || '',
                current_price: data.market_data?.current_price?.usd || 0,
                market_cap: data.market_data?.market_cap?.usd || 0,
                market_cap_rank: data.market_cap_rank,
                price_change_24h: data.market_data?.price_change_percentage_24h || 0,
                volume_24h: data.market_data?.total_volume?.usd || 0,
                high_24h: data.market_data?.high_24h?.usd || 0,
                low_24h: data.market_data?.low_24h?.usd || 0,
                ath: data.market_data?.ath?.usd || 0,
                ath_change_percentage: data.market_data?.ath_change_percentage?.usd || 0,
                last_updated: data.last_updated
            };
        } catch (error) {
            console.error(`Error fetching details for ${coinId}:`, error.message);
            throw error;
        }
    }

    // Search for coins
    async searchCoins(query) {
        try {
            const response = await axios.get(`${this.baseURL}/search`, {
                params: {
                    query: query
                }
            });

            return response.data.coins.map(coin => ({
                id: coin.id,
                name: coin.name,
                symbol: coin.symbol,
                market_cap_rank: coin.market_cap_rank,
                thumb: coin.thumb,
                large: coin.large
            }));
        } catch (error) {
            console.error('Error searching coins:', error.message);
            throw error;
        }
    }

    // Get cached price or fetch new one
    async getCachedPrice(coinId) {
        const now = Date.now();
        const cached = this.cache.get(coinId);

        if (cached && (now - cached.timestamp) < this.cacheTimeout) {
            return cached.data;
        }

        const priceData = await this.getCoinPrice(coinId);
        this.cache.set(coinId, {
            data: priceData,
            timestamp: now
        });

        return priceData;
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
    }
}

module.exports = new PriceService();
