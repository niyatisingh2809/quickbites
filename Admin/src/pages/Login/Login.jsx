import React, { useState } from 'react';
import './Login.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = ({ url, setToken, setUser }) => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);

  // Login Form State
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Partner Registration Form State
  const [regData, setRegData] = useState({
    userName: '',
    email: '',
    password: '',
    phone: '',
    name: '',
    description: '',
    cuisine: 'North Indian, Biryani, Fast Food',
    street: '',
    city: 'Delhi NCR',
    state: 'Delhi',
    pincode: '',
    fssaiLicenseNumber: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: ''
  });

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegChange = (e) => {
    setRegData({ ...regData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${url}/api/user/login`, loginData);
      if (res.data.success) {
        const { token, user } = res.data;
        if (!['admin', 'restaurant_owner'].includes(user.role)) {
          toast.error('Access restricted to Platform Admins and Restaurant Partners');
          setLoading(false);
          return;
        }

        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        toast.success(`Welcome back, ${user.name}! (${user.role === 'admin' ? 'Super Admin' : 'Restaurant Partner'})`);
      } else {
        toast.error(res.data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regData.userName || !regData.email || !regData.password || !regData.name || !regData.street || !regData.city || !regData.pincode || !regData.phone) {
      toast.error('Please fill in all required restaurant and owner fields');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${url}/api/restaurant/register`, regData);
      if (res.data.success) {
        toast.success('🎉 Restaurant application submitted! Your account is pending admin verification.');
        if (res.data.token) {
          const userObj = {
            name: regData.userName,
            email: regData.email,
            role: 'restaurant_owner',
            status: 'active',
            restaurantId: res.data.restaurant?._id
          };
          localStorage.setItem('admin_token', res.data.token);
          localStorage.setItem('admin_user', JSON.stringify(userObj));
          setToken(res.data.token);
          setUser(userObj);
        } else {
          setActiveTab('login');
        }
      } else {
        toast.error(res.data.message || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-Click Demo Fillers
  const fillCredentials = (email, password) => {
    setLoginData({ email, password });
    setActiveTab('login');
  };

  return (
    <div className='portal-login-overlay'>
      <div className='portal-login-card'>
        <div className='portal-brand-header'>
          <span className='portal-logo-icon'>⚡🍔</span>
          <h2>Quick<span className='brand-blue'>Bites</span></h2>
          <p className='portal-subtitle'>Partner & Administration Portal</p>
        </div>

        {/* Tab Switcher */}
        <div className='portal-tab-switch'>
          <button
            type='button'
            className={`tab-switch-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            🔐 Sign In (Admin / Partner)
          </button>
          <button
            type='button'
            className={`tab-switch-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            🏪 Partner Onboarding
          </button>
        </div>

        {/* 1-Click Quick Demo Login Shortcuts */}
        <div className='demo-credentials-banner'>
          <span className='demo-title'>⚡ Quick Demo Logins:</span>
          <div className='demo-btns-row'>
            <button
              type='button'
              className='demo-pill-btn admin-pill'
              onClick={() => fillCredentials('admin@quickbites.com', 'Admin@12345')}
            >
              🛡️ Super Admin
            </button>
            <button
              type='button'
              className='demo-pill-btn partner-pill'
              onClick={() => fillCredentials('rajesh@royalbiryani.com', 'Partner@123')}
            >
              👑 Approved Partner
            </button>
            <button
              type='button'
              className='demo-pill-btn pending-pill'
              onClick={() => fillCredentials('pooja@delhisweets.com', 'Partner@123')}
            >
              ⏳ Pending Partner
            </button>
          </div>
        </div>

        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className='portal-form'>
            <div className='portal-input-group'>
              <label>Work Email Address</label>
              <input
                type='email'
                name='email'
                placeholder='e.g. admin@quickbites.com or partner@hotel.com'
                value={loginData.email}
                onChange={handleLoginChange}
                required
              />
            </div>

            <div className='portal-input-group'>
              <label>Password</label>
              <input
                type='password'
                name='password'
                placeholder='Enter your password'
                value={loginData.password}
                onChange={handleLoginChange}
                required
              />
            </div>

            <button type='submit' className='btn-portal-submit' disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In to Dashboard →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className='portal-form register-form-scroll'>
            <p className='section-header'>1. Owner & Account Credentials</p>
            <div className='portal-grid-2'>
              <div className='portal-input-group'>
                <label>Owner / Manager Name *</label>
                <input
                  type='text'
                  name='userName'
                  placeholder='Full Name'
                  value={regData.userName}
                  onChange={handleRegChange}
                  required
                />
              </div>
              <div className='portal-input-group'>
                <label>Owner Phone Number *</label>
                <input
                  type='tel'
                  name='phone'
                  placeholder='10-digit Mobile'
                  value={regData.phone}
                  onChange={handleRegChange}
                  required
                />
              </div>
            </div>

            <div className='portal-grid-2'>
              <div className='portal-input-group'>
                <label>Login Email *</label>
                <input
                  type='email'
                  name='email'
                  placeholder='partner@restaurant.com'
                  value={regData.email}
                  onChange={handleRegChange}
                  required
                />
              </div>
              <div className='portal-input-group'>
                <label>Account Password *</label>
                <input
                  type='password'
                  name='password'
                  placeholder='Min. 8 characters'
                  value={regData.password}
                  onChange={handleRegChange}
                  required
                />
              </div>
            </div>

            <p className='section-header'>2. Restaurant Business Profile</p>
            <div className='portal-input-group'>
              <label>Restaurant Name *</label>
              <input
                type='text'
                name='name'
                placeholder='e.g. Biryani Blues / Punjabi Rasoi'
                value={regData.name}
                onChange={handleRegChange}
                required
              />
            </div>

            <div className='portal-grid-2'>
              <div className='portal-input-group'>
                <label>Cuisines (comma-separated)</label>
                <input
                  type='text'
                  name='cuisine'
                  placeholder='North Indian, Biryani, Mughlai'
                  value={regData.cuisine}
                  onChange={handleRegChange}
                />
              </div>
              <div className='portal-input-group'>
                <label>FSSAI License Number</label>
                <input
                  type='text'
                  name='fssaiLicenseNumber'
                  placeholder='14-digit FSSAI Number'
                  value={regData.fssaiLicenseNumber}
                  onChange={handleRegChange}
                />
              </div>
            </div>

            <div className='portal-input-group'>
              <label>Street Address / Landmark *</label>
              <input
                type='text'
                name='street'
                placeholder='Shop No, Road, Area'
                value={regData.street}
                onChange={handleRegChange}
                required
              />
            </div>

            <div className='portal-grid-3'>
              <div className='portal-input-group'>
                <label>City *</label>
                <input
                  type='text'
                  name='city'
                  placeholder='City'
                  value={regData.city}
                  onChange={handleRegChange}
                  required
                />
              </div>
              <div className='portal-input-group'>
                <label>State *</label>
                <input
                  type='text'
                  name='state'
                  placeholder='State'
                  value={regData.state}
                  onChange={handleRegChange}
                  required
                />
              </div>
              <div className='portal-input-group'>
                <label>Pincode *</label>
                <input
                  type='text'
                  name='pincode'
                  placeholder='6-digit Pincode'
                  value={regData.pincode}
                  onChange={handleRegChange}
                  required
                />
              </div>
            </div>

            <p className='section-header'>3. Payout & Bank Information</p>
            <div className='portal-grid-2'>
              <div className='portal-input-group'>
                <label>Account Holder Name</label>
                <input
                  type='text'
                  name='accountHolderName'
                  placeholder='As per passbook'
                  value={regData.accountHolderName}
                  onChange={handleRegChange}
                />
              </div>
              <div className='portal-input-group'>
                <label>Bank Account Number</label>
                <input
                  type='text'
                  name='accountNumber'
                  placeholder='Account Number'
                  value={regData.accountNumber}
                  onChange={handleRegChange}
                />
              </div>
            </div>

            <div className='portal-grid-2'>
              <div className='portal-input-group'>
                <label>IFSC Code</label>
                <input
                  type='text'
                  name='ifscCode'
                  placeholder='e.g. SBIN0001234'
                  value={regData.ifscCode}
                  onChange={handleRegChange}
                />
              </div>
              <div className='portal-input-group'>
                <label>UPI ID for Settlements</label>
                <input
                  type='text'
                  name='upiId'
                  placeholder='merchant@okhdfcbank'
                  value={regData.upiId}
                  onChange={handleRegChange}
                />
              </div>
            </div>

            <button type='submit' className='btn-portal-submit' disabled={loading}>
              {loading ? 'Submitting Application...' : 'Submit Restaurant Application 🚀'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
