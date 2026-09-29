import React, { useContext, useState } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import LocationModal from '../../components/LocationModal/LocationModal';

const Navbar = ({ setShowLogin, setShowSearch }) => {
    const [menu, setMenu] = useState("home");
    const [showLocationModal, setShowLocationModal] = useState(false);
    const { 
        getTotalCartAmount, 
        getTotalItemsCount, 
        token, 
        user, 
        logoutUser, 
        deliveryAddress,
        currentLocation,
        selectLocation,
        detectGPSLocation,
        isDetectingGPS
    } = useContext(StoreContext);

    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logoutUser();
        navigate("/");
    };

    // Smooth navigation to any section on Home page from ANY page (Home, MyOrders, Cart, etc.)
    const navigateToSection = (sectionId, menuName) => {
        setMenu(menuName);
        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                const el = document.getElementById(sectionId);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }, 120);
        } else {
            const el = document.getElementById(sectionId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };

    const userInitial = user?.name ? user.name.trim()[0].toUpperCase() : "U";
    const totalItems = getTotalItemsCount();

    return (
        <div className='navbar'>
            <div className="navbar-brand-location-group">
                <Link to='/' onClick={() => navigateToSection('header', 'home')} className='brand-logo-container'>
                    <span className='brand-icon'>⚡🍔</span>
                    <div className='brand-text-wrap'>
                        <span className='brand-name'>Quick<span className='brand-accent'>Bites</span></span>
                        <span className='brand-tagline'>Fast & Fresh Delivery</span>
                    </div>
                </Link>

                {/* Hyperlocal Multi-Outlet Location Selector */}
                <div 
                    className="nav-location-pill" 
                    onClick={() => setShowLocationModal(true)}
                    title="Change Delivery Location / Cloud Kitchen Outlet"
                >
                    <span className="loc-pin-icon">📍</span>
                    <div className="loc-text-col">
                        <div className="loc-city-row">
                            <span className="loc-city-name">{currentLocation?.city || "Delhi NCR"}</span>
                            <span className="loc-chevron">▾</span>
                        </div>
                        <span className="loc-area-sub">
                            {currentLocation?.area ? (currentLocation.area.length > 18 ? `${currentLocation.area.slice(0, 18)}...` : currentLocation.area) : "Select Outlet"}
                        </span>
                    </div>
                </div>
            </div>

            <ul className='navbar-menu'>
                <li 
                    onClick={() => navigateToSection('header', 'home')} 
                    className={menu === "home" && location.pathname === '/' ? "active" : ""}
                >
                    Home
                </li>
                <li 
                    onClick={() => navigateToSection('explore-menu', 'menu')} 
                    className={menu === "menu" ? "active" : ""}
                >
                    Menu
                </li>
                <li 
                    onClick={() => navigateToSection('app-download', 'mobile-app')} 
                    className={menu === "mobile-app" ? "active" : ""}
                >
                    Mobile-App
                </li>
                <li 
                    onClick={() => navigateToSection('footer', 'contact-us')} 
                    className={menu === "contact-us" ? "active" : ""}
                >
                    Contact Us
                </li>
            </ul>

            <div className="navbar-right">
                {/* Search Icon with Click Handler & Tooltip */}
                <div 
                    className="navbar-search-btn"
                    onClick={() => setShowSearch && setShowSearch(true)}
                    title="Search 120+ dishes & cuisines"
                >
                    <img src={assets.search_icon} alt="Search" />
                    <span className="search-hint-badge">Search</span>
                </div>

                <div className="navbar-search-icon">
                    <Link to='/cart' title="View Cart"><img src={assets.basket_icon} alt="Cart" /></Link>
                    {totalItems > 0 && (
                        <div className="cart-badge-count">{totalItems}</div>
                    )}
                </div>

                {!token ? (
                    <button onClick={() => setShowLogin(true)}>Sign in</button>
                ) : (
                    <div className="navbar-profile">
                        <div className="user-avatar-badge" title={user?.name || "My Account"}>
                            {userInitial}
                        </div>
                        <div className="nav-profile-dropdown">
                            <div className="profile-dropdown-header">
                                <div className="profile-avatar-lg">{userInitial}</div>
                                <div className="profile-header-info">
                                    <p className="profile-name">{user?.name || "Foodie Member"}</p>
                                    <p className="profile-email">{user?.email || "Account Active"}</p>
                                </div>
                            </div>
                            <hr className="dropdown-divider" />
                            <li onClick={() => navigate('/myorders')}>
                                <span className="dropdown-icon">📦</span>
                                <div>
                                    <p className="dropdown-title">Orders History</p>
                                    <span className="dropdown-sub">Track & re-order meals</span>
                                </div>
                            </li>
                            <li onClick={() => navigateToSection('explore-menu', 'menu')}>
                                <span className="dropdown-icon">🍽️</span>
                                <div>
                                    <p className="dropdown-title">Browse Menu</p>
                                    <span className="dropdown-sub">Explore 120+ dishes</span>
                                </div>
                            </li>
                            <li onClick={() => navigate('/order')}>
                                <span className="dropdown-icon">📍</span>
                                <div>
                                    <p className="dropdown-title">Delivery Address</p>
                                    <span className="dropdown-sub">
                                        {deliveryAddress?.city ? `${deliveryAddress.city}, ${deliveryAddress.zipcode || ""}` : "Auto-saved address"}
                                    </span>
                                </div>
                            </li>
                            <li onClick={() => navigate('/cart')}>
                                <span className="dropdown-icon">🎟️</span>
                                <div>
                                    <p className="dropdown-title">Offers & Promos</p>
                                    <span className="dropdown-sub">WELCOME50, TASTY10 active</span>
                                </div>
                            </li>
                            <hr className="dropdown-divider" />
                            <li onClick={handleLogout} className="logout-item">
                                <img src={assets.logout_icon} alt="Logout" />
                                <p>Sign Out</p>
                            </li>
                        </div>
                    </div>
                )}
            </div>

            {/* Hyperlocal Location Selector Modal */}
            <LocationModal
                isOpen={showLocationModal}
                onClose={() => setShowLocationModal(false)}
                currentLocation={currentLocation}
                onSelectLocation={selectLocation}
                onDetectGPS={detectGPSLocation}
                isDetectingGPS={isDetectingGPS}
            />
        </div>
    );
};

export default Navbar;