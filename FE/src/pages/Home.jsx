import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { coinsService } from '../services/coinsService';
import './Home.css'

const Home = () => {
  const location = useLocation();
  const [topCoins, setTopCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchTopCoins();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchTopCoins, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTopCoins = async () => {
    try {
      setLoading(true);
      const coins = await coinsService.getTopCoins(5);
      setTopCoins(coins);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch top coins:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-wrapper">
      <nav className="navbar">
        <ul>
          <li><NavLink className="navbar-brand" to="/">Home</NavLink></li>
          <li><NavLink 
            to="/coins" 
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            Coins
          </NavLink></li>
          <li><NavLink to="/convert">Convert</NavLink></li>
          <li><NavLink to="/trade">Trade</NavLink></li>
          <li><NavLink 
            to="/portfolio" 
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            Portfolio
          </NavLink></li>
          <li className="left"><NavLink to="/profile">Profile</NavLink></li>
        </ul>
      </nav>

      <div className="container">
        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '3rem 2rem',
          borderRadius: '16px',
          marginBottom: '2rem',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            margin: '0 0 1rem 0',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            Simple . Secure . Smarter
          </h1>
          <p style={{
            fontSize: '1.2rem',
            margin: '0 0 2rem 0',
            opacity: 0.9
          }}>
            Your gateway to the world of cryptocurrency trading
          </p>
          <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
            <NavLink 
              to="/trade" 
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                padding: '0.75rem 2rem',
                borderRadius: '25px',
                textDecoration: 'none',
                fontWeight: '600',
                border: '2px solid rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              Start Trading
            </NavLink>
            <NavLink 
              to="/portfolio" 
              style={{
                background: 'transparent',
                color: 'white',
                padding: '0.75rem 2rem',
                borderRadius: '25px',
                textDecoration: 'none',
                fontWeight: '600',
                border: '2px solid white',
                transition: 'all 0.3s ease'
              }}
            >
              View Portfolio
            </NavLink>
          </div>
        </div>

        {/* Stats Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            textAlign: 'center',
            border: '1px solid #e1e5e9'
          }}>
            <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#667eea', marginBottom: '0.5rem'}}>
              {topCoins.length}
            </div>
            <div style={{color: '#666', fontSize: '0.9rem'}}>Active Coins</div>
          </div>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            textAlign: 'center',
            border: '1px solid #e1e5e9'
          }}>
            <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#22c55e', marginBottom: '0.5rem'}}>
              Live
            </div>
            <div style={{color: '#666', fontSize: '0.9rem'}}>Real-time Prices</div>
          </div>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            textAlign: 'center',
            border: '1px solid #e1e5e9'
          }}>
            <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '0.5rem'}}>
              24/7
            </div>
            <div style={{color: '#666', fontSize: '0.9rem'}}>Market Access</div>
          </div>
        </div>
        
        {/* Top Cryptocurrencies Section */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e1e5e9'
        }}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
            <h2 style={{
              margin: 0,
              fontSize: '1.8rem',
              fontWeight: 'bold',
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📈 Top Cryptocurrencies
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 'normal',
                color: '#666',
                background: '#f3f4f6',
                padding: '0.25rem 0.5rem',
                borderRadius: '12px'
              }}>
                Live Prices
              </span>
            </h2>
            {lastUpdated && (
              <div style={{
                fontSize: '0.8rem',
                color: '#666',
                background: '#f3f4f6',
                padding: '0.5rem 1rem',
                borderRadius: '20px'
              }}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
          
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '3rem',
              color: '#666'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f4f6',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <span style={{marginLeft: '1rem'}}>Loading live prices...</span>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              {topCoins.map((coin, index) => (
                <div key={coin.id} style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid #e1e5e9',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}>
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '1rem'}}>
                    {coin.image && (
                      <img 
                        src={coin.image} 
                        alt={coin.name} 
                        style={{
                          width: '40px', 
                          height: '40px', 
                          marginRight: '1rem', 
                          borderRadius: '50%',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }} 
                      />
                    )}
                    <div>
                      <h4 style={{margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#333'}}>
                        {coin.name}
                      </h4>
                      <span style={{
                        fontSize: '0.8rem', 
                        color: '#666',
                        background: '#f3f4f6',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '8px'
                      }}>
                        {coin.symbol?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div style={{textAlign: 'center'}}>
                    <div style={{
                      fontSize: '1.4rem', 
                      fontWeight: 'bold', 
                      color: '#333',
                      marginBottom: '0.5rem'
                    }}>
                      ${coin.price?.toFixed(2) || 'N/A'}
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      color: coin.price_change_24h >= 0 ? '#22c55e' : '#ef4444',
                      fontWeight: '600',
                      background: coin.price_change_24h >= 0 ? '#dcfce7' : '#fef2f2',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      display: 'inline-block'
                    }}>
                      {coin.price_change_24h >= 0 ? '↗' : '↘'} {coin.price_change_24h >= 0 ? '+' : ''}{coin.price_change_24h?.toFixed(2) || 0}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer style={{
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        color: 'white',
        padding: '2rem 0',
        marginTop: '3rem',
        borderTop: '1px solid #e1e5e9'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          alignItems: 'start'
        }}>
          {/* Company Info */}
          <div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              CryptoVault
            </h3>
            <p style={{
              color: '#bdc3c7',
              lineHeight: '1.6',
              marginBottom: '1rem'
            }}>
              Your trusted gateway to the world of cryptocurrency trading. 
              Simple, secure, and smarter than ever.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#ecf0f1'
            }}>
              Quick Links
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              <li style={{marginBottom: '0.5rem'}}>
                <NavLink 
                  to="/trade" 
                  style={{
                    color: '#bdc3c7',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  💰 Trading
                </NavLink>
              </li>
              <li style={{marginBottom: '0.5rem'}}>
                <NavLink 
                  to="/portfolio" 
                  style={{
                    color: '#bdc3c7',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  📊 Portfolio
                </NavLink>
              </li>
              <li style={{marginBottom: '0.5rem'}}>
                <NavLink 
                  to="/coins" 
                  style={{
                    color: '#bdc3c7',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  🪙 All Coins
                </NavLink>
              </li>
              <li style={{marginBottom: '0.5rem'}}>
                <NavLink 
                  to="/profile" 
                  style={{
                    color: '#bdc3c7',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  👤 Profile
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#ecf0f1'
            }}>
              Contact
            </h4>
            <div style={{
              color: '#bdc3c7',
              lineHeight: '1.8'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <span>👨‍💻</span>
                <span>Shubham Lathiya</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <span>📧</span>
                <a 
                  href="mailto:lathiyashubham07@gmail.com"
                  style={{
                    color: '#667eea',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease'
                  }}
                >
                  lathiyashubham07@gmail.com
                </a>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <span>🌐</span>
                <span>Cryptocurrency Platform</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          textAlign: 'center',
          color: '#95a5a6',
          fontSize: '0.9rem'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              © 2024 CryptoVault. All rights reserved.
            </div>
            <div style={{
              display: 'flex',
              gap: '2rem',
              fontSize: '0.8rem'
            }}>
              <span style={{cursor: 'pointer', transition: 'color 0.3s ease'}}>
                Privacy Policy
              </span>
              <span style={{cursor: 'pointer', transition: 'color 0.3s ease'}}>
                Terms of Service
              </span>
              <span style={{cursor: 'pointer', transition: 'color 0.3s ease'}}>
                Support
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home

