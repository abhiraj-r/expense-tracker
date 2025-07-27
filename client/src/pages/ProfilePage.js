import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaEnvelope, FaLock, FaSave, FaEye, FaEyeSlash, FaSignOutAlt, FaTrash } from 'react-icons/fa';
import { getProfile, updateProfile } from '../services/api';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        setProfile(res.data);
        setForm({ name: res.data.name, email: res.data.email, password: '', confirmPassword: '' });
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (form.password && form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      const response = await updateProfile(payload);
      setSuccess('Profile updated successfully!');
      setProfile({ ...profile, name: form.name, email: form.email });
      setForm({ ...form, password: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      // You would need to implement this API endpoint
      // const response = await deleteAccount();
      localStorage.removeItem('token');
      navigate('/');
    } catch (err) {
      setError('Failed to delete account. Please try again.');
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            <FaArrowLeft />
            <span>Back to Dashboard</span>
          </button>
          <h1>User Profile</h1>
        </div>

        <div className="profile-content">
          <div className="profile-avatar">
            <div className="avatar-circle">
              <FaUser />
            </div>
            <h2>{profile.name}</h2>
            <p>{profile.email}</p>
          </div>

          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">
                <FaUser />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <FaEnvelope />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <FaLock />
                <span>New Password</span>
              </label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                <FaLock />
                <span>Confirm Password</span>
              </label>
              <div className="password-input">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {error && (
              <div className="profile-error">
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="profile-success">
                <span>{success}</span>
              </div>
            )}

            <button type="submit" className="save-btn">
              <FaSave />
              <span>Save Changes</span>
            </button>
          </form>

          {/* Account Actions Section */}
          <div className="account-actions">
            <button 
              className="logout-btn" 
              onClick={handleLogout}
              title="Sign out of your account"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
            
            <button 
              className={`delete-account-btn ${showDeleteConfirm ? 'confirm' : ''}`}
              onClick={handleDeleteAccount}
              title={showDeleteConfirm ? "Click again to confirm account deletion" : "Delete your account permanently"}
            >
              <FaTrash />
              <span>{showDeleteConfirm ? 'Confirm Delete Account' : 'Delete Account'}</span>
            </button>
            
            {showDeleteConfirm && (
              <div className="delete-warning">
                <p>⚠️ This action cannot be undone. All your data will be permanently deleted.</p>
                <button 
                  className="cancel-delete-btn"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 