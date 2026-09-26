import React from 'react'
import './Navbar.css'
import {assets} from '../../assets/assets'
const Navbar = () => {
  return (
    <div className='navbar'>
        <div className='admin-brand-container'>
            <span className='admin-brand-icon'>⚡🍔</span>
            <div className='admin-brand-text'>
                <span className='admin-brand-name'>Quick<span className='admin-brand-accent'>Bites</span></span>
                <span className='admin-badge'>Admin Panel</span>
            </div>
        </div>
        <img className='profile' src={assets.profile_image} alt="" />
    </div>
  )
}

export default Navbar