import React from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';

const Navbar = ({ user, onLogout }) => {
  const isSuperAdmin = user?.role === 'admin';

  return (
    <div className='navbar'>
      <div className='admin-brand-container'>
        <span className='admin-brand-icon'>⚡🍔</span>
        <div className='admin-brand-text'>
          <span className='admin-brand-name'>
            Quick<span className='admin-brand-accent'>Bites</span>
          </span>
          <span className={`admin-badge ${isSuperAdmin ? 'badge-superadmin' : 'badge-partner'}`}>
            {isSuperAdmin ? '🛡️ Super Admin' : '🏪 Restaurant Partner'}
          </span>
        </div>
      </div>

      <div className='admin-nav-right'>
        {user && (
          <div className='user-profile-meta'>
            <span className='user-welcome-name'>{user.name}</span>
            <span className='user-welcome-email'>{user.email}</span>
          </div>
        )}
        <img className='profile' src={assets.profile_image} alt='Profile' />
        {onLogout && (
          <button type='button' className='btn-admin-logout' onClick={onLogout} title='Sign Out'>
            Sign Out ⎋
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;