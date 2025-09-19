const Coin = require('../models/coins');
const priceService = require('./priceService');

class PriceUpdater {
    constructor() {
        this.isUpdating = false;
        this.updateInterval = null;
        this.updateFrequency = 60000; // 1 minute default
    }

    // Start automatic price updates
    startAutoUpdate(frequency = 300000) { // 5 minutes default
        this.updateFrequency = frequency;
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        console.log(`Starting price updates every ${frequency / 1000} seconds`);
        
        // Update immediately on start
        this.updateAllPrices();
        
        // Then update at intervals
        this.updateInterval = setInterval(() => {
            this.updateAllPrices();
        }, frequency);
    }

    // Stop automatic updates
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('Stopped automatic price updates');
        }
    }

    // Update all coin prices
    async updateAllPrices() {
        if (this.isUpdating) {
            console.log('Price update already in progress, skipping...');
            return;
        }

        this.isUpdating = true;
        console.log('Starting price update...');

        try {
            // Get all coins from database
            const coins = await Coin.find({});
            
            if (coins.length === 0) {
                console.log('No coins found in database');
                this.isUpdating = false;
                return;
            }

            // Get coin IDs for API call
            const coinIds = coins.map(coin => coin.c_id);
            
            // Fetch latest prices from CoinGecko
            const priceData = await priceService.getMultipleCoinPrices(coinIds);
            
            // Update each coin in database
            const updatePromises = coins.map(async (coin) => {
                const latestData = priceData[coin.c_id];
                
                if (latestData) {
                    return Coin.findByIdAndUpdate(
                        coin._id,
                        {
                            price: latestData.price,
                            market_cap: latestData.market_cap,
                            price_change_24h: latestData.price_change_24h,
                            volume_24h: latestData.volume_24h,
                            last_updated: new Date()
                        },
                        { new: true }
                    );
                }
            });

            await Promise.all(updatePromises);
            console.log(`Updated prices for ${coins.length} coins`);
            
        } catch (error) {
            console.error('Error updating prices:', error.message);
        } finally {
            this.isUpdating = false;
        }
    }

    // Update specific coin price
    async updateCoinPrice(coinId) {
        try {
            const coin = await Coin.findOne({ c_id: coinId });
            if (!coin) {
                throw new Error(`Coin ${coinId} not found in database`);
            }

            const priceData = await priceService.getCoinPrice(coinId);
            
            const updatedCoin = await Coin.findByIdAndUpdate(
                coin._id,
                {
                    price: priceData.price,
                    market_cap: priceData.market_cap,
                    price_change_24h: priceData.price_change_24h,
                    volume_24h: priceData.volume_24h,
                    last_updated: new Date()
                },
                { new: true }
            );

            console.log(`Updated price for ${coinId}: $${priceData.price}`);
            return updatedCoin;
            
        } catch (error) {
            console.error(`Error updating price for ${coinId}:`, error.message);
            throw error;
        }
    }

    // Add new coins from CoinGecko top list
    async addTopCoins(limit = 50) {
        try {
            console.log(`Adding top ${limit} coins from CoinGecko...`);
            
            const topCoins = await priceService.getTopCoins(limit);
            
            if (topCoins.length === 0) {
                console.log('No coins received from API');
                return 0;
            }
            
            const coinsToAdd = [];
            
            for (const coinData of topCoins) {
                if (!coinData.id || !coinData.name || !coinData.symbol) {
                    continue; // Skip invalid coin data
                }
                
                const existingCoin = await Coin.findOne({ c_id: coinData.id });
                
                if (!existingCoin) {
                    coinsToAdd.push({
                        c_id: coinData.id,
                        c_name: coinData.name,
                        symbol: coinData.symbol,
                        price: coinData.price || 0,
                        market_cap: coinData.market_cap || 0,
                        market_cap_rank: coinData.market_cap_rank || 0,
                        price_change_24h: coinData.price_change_24h || 0,
                        volume_24h: coinData.volume_24h || 0,
                        image: coinData.image || '',
                        last_updated: new Date(coinData.last_updated || Date.now())
                    });
                }
            }

            if (coinsToAdd.length > 0) {
                await Coin.insertMany(coinsToAdd);
                console.log(`Added ${coinsToAdd.length} new coins to database`);
            } else {
                console.log('No new coins to add');
            }

            return coinsToAdd.length;
            
        } catch (error) {
            console.error('Error adding top coins:', error.message);
            return 0; // Return 0 instead of throwing
        }
    }

    // Get update status
    getStatus() {
        return {
            isUpdating: this.isUpdating,
            updateFrequency: this.updateFrequency,
            isAutoUpdateActive: !!this.updateInterval
        };
    }
}

module.exports = new PriceUpdater();
