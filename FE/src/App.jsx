import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';
import Home from './pages/Home';
import CoinPage from './pages/CoinPage';
import Trade from './pages/Trade';
import Portfolio from './pages/Portfolio';
import Signup from './pages/signup';
import Login from './pages/login';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { authService } from './services/authService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app load
    const checkAuth = () => {
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();
      
      if (token && currentUser) {
        setIsAuthenticated(true);
        setUser(currentUser);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <div>
        {/* Navigation Header */}
        {isAuthenticated && user && (
          <header className="app-header">
            <div className="header-content">
              <h1>Crypto Vault</h1>
              <div className="user-info">
                <span>Welcome, {user.name}!</span>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            </div>
          </header>
        )}

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          } />
          <Route path="/signup" element={
            isAuthenticated ? <Navigate to="/" replace /> : <Signup />
          } />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/coins" element={
            <ProtectedRoute>
              <CoinPage />
            </ProtectedRoute>
          } />
          <Route path="/trade" element={
            <ProtectedRoute>
              <Trade showConvert={false} />
            </ProtectedRoute>
          } />
          <Route path="/convert" element={
            <ProtectedRoute>
              <Trade initialTab="convert" />
            </ProtectedRoute>
          } />
          <Route path="/portfolio" element={
            <ProtectedRoute>
              <Portfolio />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/coin/:id" element={
            <ProtectedRoute>
              <CoinPage />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
