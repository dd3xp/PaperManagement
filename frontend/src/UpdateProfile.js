import React, { useState } from 'react';
import axios from 'axios';
import './UpdateProfile.css';

const UpdateProfile = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5001/api/auth/update-username', { username }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert('Username updated successfully!');
    } catch (error) {
      console.error('Username update failed:', error.response?.data?.message || error.message);
      alert('Username update failed! ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5001/api/auth/update-password', { password }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert('Password updated successfully!');
    } catch (error) {
      console.error('Password update failed:', error.response?.data?.message || error.message);
      alert('Password update failed! ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="update-profile-container">
      <div className="update-profile-form">
        <h2>Update Profile</h2>
        <form onSubmit={handleUpdateUsername}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="New Username"
            required
            className="update-profile-input"
          />
          <button type="submit" className="update-profile-button">Update Username</button>
        </form>
        <form onSubmit={handleUpdatePassword}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
            required
            className="update-profile-input"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            required
            className="update-profile-input"
          />
          <button type="submit" className="update-profile-button">Update Password</button>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;
