import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './Profile.css';

const Profile = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const profile = await authService.getProfile();
        setFormData({ name: profile.name || '', email: profile.email || '' });
      } catch (e) {
        setError(e.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleBack = () => {
    navigate('/');
  };

  const handleLogout = () => {
    authService.logout();
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h1>My Profile</h1>
      {error && <div className="error-message">{error}</div>}
      <div className="profile-form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" type="text" value={formData.name} readOnly />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={formData.email} readOnly />
        </div>
        <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
          <button type="button" className="back-btn" onClick={handleBack}>
            Back to Home
          </button>
          <button 
            type="button" 
            className="logout-btn" 
            onClick={handleLogout}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;