import React from 'react';
import './Sidebar.css';
import { assets } from '../../assets/assets';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ user }) => {
  const isSuperAdmin = user?.role === 'admin';

  return (
    <div className='sidebar'>
      <div className='sidebar-options'>
        {isSuperAdmin ? (
          <>
            <NavLink to='/restaurants' className='sidebar-option'>
              <span className='sidebar-emoji'>🏪</span>
              <p>Restaurants</p>
            </NavLink>

            <NavLink to='/delivery-partners' className='sidebar-option'>
              <span className='sidebar-emoji'>🛵</span>
              <p>Delivery Riders</p>
            </NavLink>

            <NavLink to='/list' className='sidebar-option'>
              <img src={assets.order_icon} alt='' />
              <p>Food Catalog</p>
            </NavLink>

            <NavLink to='/add' className='sidebar-option'>
              <img src={assets.add_icon} alt='' />
              <p>Add Food Item</p>
            </NavLink>

            <NavLink to='/thali-templates' className='sidebar-option'>
              <span className='sidebar-emoji'>🍱</span>
              <p>Thali Templates</p>
            </NavLink>

            <NavLink to='/orders' className='sidebar-option'>
              <img src={assets.parcel_icon} alt='' />
              <p>Platform Orders</p>
            </NavLink>

            <NavLink to='/support-tickets' className='sidebar-option'>
              <span className='sidebar-emoji'>🎧</span>
              <p>Support Desk</p>
            </NavLink>

            <NavLink to='/analytics' className='sidebar-option'>
              <span className='sidebar-emoji'>📊</span>
              <p>Analytics</p>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to='/my-restaurant' className='sidebar-option'>
              <span className='sidebar-emoji'>🏪</span>
              <p>My Restaurant</p>
            </NavLink>

            <NavLink to='/list' className='sidebar-option'>
              <img src={assets.order_icon} alt='' />
              <p>My Menu</p>
            </NavLink>

            <NavLink to='/add' className='sidebar-option'>
              <img src={assets.add_icon} alt='' />
              <p>Add Dish</p>
            </NavLink>

            <NavLink to='/thali-templates' className='sidebar-option'>
              <span className='sidebar-emoji'>🍱</span>
              <p>Thali Templates</p>
            </NavLink>

            <NavLink to='/orders' className='sidebar-option'>
              <img src={assets.parcel_icon} alt='' />
              <p>Kitchen Orders</p>
            </NavLink>

            <NavLink to='/support-tickets' className='sidebar-option'>
              <span className='sidebar-emoji'>🎧</span>
              <p>Support Desk</p>
            </NavLink>

            <NavLink to='/analytics' className='sidebar-option'>
              <span className='sidebar-emoji'>📊</span>
              <p>Analytics</p>
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;