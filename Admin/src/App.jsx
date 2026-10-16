import React, { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import { Route, Routes, Navigate } from 'react-router-dom';
import Add from './pages/Add/Add';
import List from './pages/List/List';
import Orders from './pages/Orders/Orders';
import Restaurants from './pages/Restaurants/Restaurants';
import DeliveryPartners from './pages/DeliveryPartners/DeliveryPartners';
import MyRestaurant from './pages/MyRestaurant/MyRestaurant';
import ThaliTemplates from './pages/ThaliTemplates/ThaliTemplates';
import SupportTickets from './pages/SupportTickets/SupportTickets';
import AnalyticsDashboard from './pages/Analytics/AnalyticsDashboard';
import Login from './pages/Login/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || '');
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('admin_user')) || null;
    } catch (e) {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken('');
    setUser(null);
  };

  if (!token) {
    return (
      <div>
        <ToastContainer position='top-right' autoClose={3000} />
        <Login url={url} setToken={setToken} setUser={setUser} />
      </div>
    );
  }

  const isSuperAdmin = user?.role === 'admin';

  return (
    <div>
      <ToastContainer position='top-right' autoClose={3000} />
      <Navbar user={user} onLogout={handleLogout} />
      <hr style={{ margin: 0, borderColor: '#f1f5f9' }} />
      <div className='app-content'>
        <Sidebar user={user} />
        <Routes>
          {/* Default Route based on role */}
          <Route
            path='/'
            element={<Navigate to={isSuperAdmin ? '/restaurants' : '/my-restaurant'} replace />}
          />

          {/* Super Admin Routes */}
          <Route path='/restaurants' element={<Restaurants url={url} token={token} user={user} />} />
          <Route path='/delivery-partners' element={<DeliveryPartners url={url} token={token} user={user} />} />

          {/* Restaurant Partner Routes */}
          <Route path='/my-restaurant' element={<MyRestaurant url={url} token={token} user={user} />} />

          {/* Shared Catalog & Orders Routes */}
          <Route path='/add' element={<Add url={url} token={token} user={user} />} />
          <Route path='/list' element={<List url={url} token={token} user={user} />} />
          <Route path='/thali-templates' element={<ThaliTemplates url={url} token={token} user={user} />} />
          <Route path='/orders' element={<Orders url={url} token={token} user={user} />} />
          <Route path='/support-tickets' element={<SupportTickets url={url} token={token} user={user} />} />
          <Route path='/analytics' element={<AnalyticsDashboard url={url} token={token} user={user} />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;