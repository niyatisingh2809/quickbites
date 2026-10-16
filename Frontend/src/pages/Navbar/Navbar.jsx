import React, { useContext, useState, useEffect } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import LocationModal from '../../components/LocationModal/LocationModal';
import { LanguageContext } from '../../Context/LanguageContext';

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

    const langCtx = useContext(LanguageContext);
    const lang = langCtx?.lang || 'en';
    const setLanguage = langCtx?.setLanguage || (() => {});
    const currentLanguage = langCtx?.currentLanguage || { code: 'en', name: 'English', nativeName: 'English' };
    const supportedLanguages = langCtx?.supportedLanguages || [];
    const t = langCtx?.t || ((k) => k);

    const [guestDropdownOpen, setGuestDropdownOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [activeDropdownView, setActiveDropdownView] = useState('main'); // 'main' | 'language'
    const [mobileLangOpen, setMobileLangOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Close on Escape key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (activeDropdownView === 'language') {
                    setActiveDropdownView('main');
                } else {
                    setProfileDropdownOpen(false);
                    setGuestDropdownOpen(false);
                    setMobileDrawerOpen(false);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeDropdownView]);

    const handleLogout = () => {
        logoutUser();
        setProfileDropdownOpen(false);
        setActiveDropdownView('main');
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
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

    // Reusable language selection panel inside Account dropdown
    const renderLanguageSelectionPanel = () => (
        <div className="language-panel-wrap" role="dialog" aria-label={t('selectLanguage')}>
            <div className="dropdown-panel-header">
                <button
                    type="button"
                    className="dropdown-back-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownView('main');
                    }}
                    aria-label={t('back')}
                >
                    ‹ {t('back')}
                </button>
                <span className="dropdown-panel-title">{t('selectLanguage')}</span>
            </div>
            <ul className="language-scroll-list" role="radiogroup" aria-label={t('selectLanguage')}>
                {supportedLanguages.map((l) => {
                    const isSelected = l.code === lang;
                    return (
                        <li
                            key={l.code}
                            className={`lang-choice-item ${isSelected ? 'active-lang' : ''}`}
                            role="radio"
                            aria-checked={isSelected}
                            tabIndex={0}
                            onClick={(e) => {
                                e.stopPropagation();
                                setLanguage(l.code);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setLanguage(l.code);
                                }
                            }}
                        >
                            <div className="lang-text-col">
                                <span className="lang-native">{l.nativeName}</span>
                                <span className="lang-roman">{l.name}</span>
                            </div>
                            {isSelected && (
                                <span className="lang-check-tick" aria-hidden="true">✓</span>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );

    return (
        <div className='navbar'>
            {/* Left: Brand Logo & Delivery Location Stacked Below */}
            <div className="navbar-left-col">
                <Link to='/' onClick={() => navigateToSection('header', 'home')} className='brand-logo-container'>
                    <span className='brand-icon' aria-hidden='true'>⚡🍔</span>
                    <div className='brand-text-wrap'>
                        <span className='brand-name'>Quick<span className='brand-accent'>Bites</span></span>
                    </div>
                </Link>

                {/* Compact Location Row directly BELOW logo */}
                <div 
                    className={`nav-location-row ${isDetectingGPS ? 'detecting' : ''}`}
                    onClick={() => setShowLocationModal(true)}
                    role='button'
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowLocationModal(true); }}}
                    title="Change Delivery Location / Cloud Kitchen Outlet"
                    aria-label={`Delivery location: ${currentLocation?.city || "Delhi NCR"}, ${currentLocation?.area || "Select Outlet"}`}
                >
                    <span className={`loc-pin-icon ${isDetectingGPS ? 'loc-icon-pulse' : ''}`} aria-hidden='true'>
                        {isDetectingGPS ? '📡' : '📍'}
                    </span>
                    <span className="loc-city-text">
                        {isDetectingGPS ? t('detectingLive') : (currentLocation?.city || "Delhi NCR")}
                    </span>
                    {currentLocation?.isGPSDetected && !isDetectingGPS && (
                        <span className="loc-live-gps-badge">LIVE</span>
                    )}
                    <span className="loc-dot-sep">•</span>
                    <span className="loc-area-text">
                        {isDetectingGPS ? "GPS active..." : (currentLocation?.area || "Select Outlet")}
                    </span>
                    <span className="loc-chevron" aria-hidden='true'>▾</span>
                </div>
            </div>

            {/* Primary Center Navigation Links */}
            <ul className='navbar-menu' role='menubar'>
                <li 
                    role='menuitem'
                    tabIndex={0}
                    onClick={() => navigateToSection('header', 'home')} 
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigateToSection('header', 'home'); }}}
                    className={menu === "home" && location.pathname === '/' ? "active" : ""}
                >
                    {t('navHome')}
                </li>
                <li 
                    role='menuitem'
                    tabIndex={0}
                    onClick={() => navigateToSection('explore-menu', 'menu')} 
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigateToSection('explore-menu', 'menu'); }}}
                    className={menu === "menu" ? "active" : ""}
                >
                    {t('navMenu')}
                </li>
                <li 
                    role='menuitem'
                    tabIndex={0}
                    onClick={() => { setMenu("daily"); navigate('/daily'); }} 
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMenu("daily"); navigate('/daily'); }}}
                    className={location.pathname === '/daily' ? "active" : ""}
                >
                    {t('navDaily')}
                </li>
                <li 
                    role='menuitem'
                    tabIndex={0}
                    onClick={() => navigateToSection('app-download', 'mobile-app')} 
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigateToSection('app-download', 'mobile-app'); }}}
                    className={menu === "mobile-app" ? "active" : ""}
                >
                    {t('navApp')}
                </li>
                <li 
                    role='menuitem'
                    tabIndex={0}
                    onClick={() => navigateToSection('footer', 'contact-us')} 
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigateToSection('footer', 'contact-us'); }}}
                    className={menu === "contact-us" ? "active" : ""}
                >
                    {t('navContact')}
                </li>
            </ul>

            {/* Right Side Navigation Controls */}
            <div className="navbar-right">
                {/* Search Icon with Click Handler & Tooltip */}
                <div 
                    className="navbar-search-btn"
                    onClick={() => setShowSearch && setShowSearch(true)}
                    title="Search 120+ dishes & cuisines"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowSearch && setShowSearch(true); }}}
                >
                    <img src={assets.search_icon} alt="Search" />
                    <span className="search-hint-badge">{t('navSearch')}</span>
                </div>

                <div className="navbar-search-icon">
                    <Link to='/cart' title={t('navCart')}><img src={assets.basket_icon} alt="Cart" /></Link>
                    {totalItems > 0 && (
                        <div className="cart-badge-count">{totalItems}</div>
                    )}
                </div>

                {/* Account / Profile Dropdown (Accessible to both Guests and Signed-in Users) */}
                {!token ? (
                    <div 
                        className={`navbar-profile guest-profile ${guestDropdownOpen ? 'is-open' : ''}`}
                        tabIndex={0}
                        onBlur={(e) => {
                            if (!e.currentTarget.contains(e.relatedTarget)) {
                                setGuestDropdownOpen(false);
                                setActiveDropdownView('main');
                            }
                        }}
                    >
                        <button 
                            className="nav-signin-btn" 
                            onClick={() => setShowLogin(true)}
                        >
                            {t('navSignIn')}
                        </button>

                        <div 
                            className="user-avatar-badge guest-badge" 
                            title={t('accountSettings')}
                            onClick={() => {
                                setGuestDropdownOpen((prev) => !prev);
                                setActiveDropdownView('main');
                            }}
                            role="button"
                            tabIndex={0}
                            aria-label={t('accountSettings')}
                            aria-haspopup="true"
                            aria-expanded={guestDropdownOpen}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setGuestDropdownOpen((prev) => !prev);
                                    setActiveDropdownView('main');
                                }
                            }}
                        >
                            👤
                        </div>

                        <div className="nav-profile-dropdown guest-dropdown">
                            {activeDropdownView === 'language' ? (
                                renderLanguageSelectionPanel()
                            ) : (
                                <>
                                    <div className="profile-dropdown-header">
                                        <div className="profile-avatar-lg guest-avatar-lg">👤</div>
                                        <div className="profile-header-info">
                                            <p className="profile-name">{t('guestUser')}</p>
                                            <p className="profile-email">{t('guestSub')}</p>
                                        </div>
                                    </div>
                                    <hr className="dropdown-divider" />
                                    <li onClick={() => { setGuestDropdownOpen(false); setShowLogin(true); }}>
                                        <span className="dropdown-icon">🔑</span>
                                        <div>
                                            <p className="dropdown-title">{t('navSignIn')}</p>
                                            <span className="dropdown-sub">{t('loginTitle')}</span>
                                        </div>
                                    </li>
                                    <li 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveDropdownView('language');
                                        }}
                                        className="lang-row"
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`${t('navLanguage')}: ${currentLanguage.nativeName}`}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                setActiveDropdownView('language');
                                            }
                                        }}
                                    >
                                        <span className="dropdown-icon">🌐</span>
                                        <div style={{ flex: 1 }}>
                                            <p className="dropdown-title">{t('navLanguage')}</p>
                                            <span className="dropdown-sub">{currentLanguage.nativeName} ({currentLanguage.name})</span>
                                        </div>
                                        <span className="dropdown-arrow" aria-hidden="true">›</span>
                                    </li>
                                    <li onClick={() => { setGuestDropdownOpen(false); navigate('/daily'); }}>
                                        <span className="dropdown-icon">🍱</span>
                                        <div>
                                            <p className="dropdown-title">QuickBites Daily</p>
                                            <span className="dropdown-sub">{t('dailySubtitle')}</span>
                                        </div>
                                    </li>
                                    <li onClick={() => { setGuestDropdownOpen(false); navigate('/support/tickets'); }}>
                                        <span className="dropdown-icon">🎧</span>
                                        <div>
                                            <p className="dropdown-title">{t('navSupport')}</p>
                                            <span className="dropdown-sub">{t('supportTitle')}</span>
                                        </div>
                                    </li>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div 
                        className={`navbar-profile ${profileDropdownOpen ? 'is-open' : ''}`}
                        tabIndex={0}
                        onBlur={(e) => {
                            if (!e.currentTarget.contains(e.relatedTarget)) {
                                setProfileDropdownOpen(false);
                                setActiveDropdownView('main');
                            }
                        }}
                    >
                        <div 
                            className="user-avatar-badge" 
                            title={user?.name || t('accountSettings')}
                            onClick={() => {
                                setProfileDropdownOpen((prev) => !prev);
                                setActiveDropdownView('main');
                            }}
                            role="button"
                            tabIndex={0}
                            aria-label={user?.name || t('accountSettings')}
                            aria-haspopup="true"
                            aria-expanded={profileDropdownOpen}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setProfileDropdownOpen((prev) => !prev);
                                    setActiveDropdownView('main');
                                }
                            }}
                        >
                            {userInitial}
                        </div>
                        <div className="nav-profile-dropdown">
                            {activeDropdownView === 'language' ? (
                                renderLanguageSelectionPanel()
                            ) : (
                                <>
                                    <div className="profile-dropdown-header">
                                        <div className="profile-avatar-lg">{userInitial}</div>
                                        <div className="profile-header-info">
                                            <p className="profile-name">{user?.name || "Foodie Member"}</p>
                                            <p className="profile-email">{user?.email || "Account Active"}</p>
                                        </div>
                                    </div>
                                    <hr className="dropdown-divider" />
                                    <li onClick={() => { setProfileDropdownOpen(false); navigate('/myorders'); }}>
                                        <span className="dropdown-icon">📦</span>
                                        <div>
                                            <p className="dropdown-title">{t('navOrdersHistory')}</p>
                                            <span className="dropdown-sub">Track & re-order meals</span>
                                        </div>
                                    </li>
                                    <li onClick={() => { setProfileDropdownOpen(false); navigate('/favorites'); }}>
                                        <span className="dropdown-icon">❤️</span>
                                        <div>
                                            <p className="dropdown-title">{t('navFavorites')}</p>
                                            <span className="dropdown-sub">Saved dishes & kitchens</span>
                                        </div>
                                    </li>
                                    <li onClick={() => { setProfileDropdownOpen(false); navigate('/daily'); }}>
                                        <span className="dropdown-icon">🍱</span>
                                        <div>
                                            <p className="dropdown-title">QuickBites Daily</p>
                                            <span className="dropdown-sub">{t('dailySubtitle')}</span>
                                        </div>
                                    </li>
                                    <li 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveDropdownView('language');
                                        }}
                                        className="lang-row"
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`${t('navLanguage')}: ${currentLanguage.nativeName}`}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                setActiveDropdownView('language');
                                            }
                                        }}
                                    >
                                        <span className="dropdown-icon">🌐</span>
                                        <div style={{ flex: 1 }}>
                                            <p className="dropdown-title">{t('navLanguage')}</p>
                                            <span className="dropdown-sub">{currentLanguage.nativeName} ({currentLanguage.name})</span>
                                        </div>
                                        <span className="dropdown-arrow" aria-hidden="true">›</span>
                                    </li>
                                    <li onClick={() => { setProfileDropdownOpen(false); navigate('/support/tickets'); }}>
                                        <span className="dropdown-icon">🎧</span>
                                        <div>
                                            <p className="dropdown-title">{t('navSupport')}</p>
                                            <span className="dropdown-sub">{t('supportTitle')}</span>
                                        </div>
                                    </li>
                                    <li onClick={() => { setProfileDropdownOpen(false); navigateToSection('explore-menu', 'menu'); }}>
                                        <span className="dropdown-icon">🍽️</span>
                                        <div>
                                            <p className="dropdown-title">{t('exploreMenu')}</p>
                                            <span className="dropdown-sub">Explore 120+ dishes</span>
                                        </div>
                                    </li>
                                    <li onClick={() => { setProfileDropdownOpen(false); navigate('/order'); }}>
                                        <span className="dropdown-icon">📍</span>
                                        <div>
                                            <p className="dropdown-title">{t('navAddress')}</p>
                                            <span className="dropdown-sub">
                                                {deliveryAddress?.city ? `${deliveryAddress.city}, ${deliveryAddress.zipcode || ""}` : "Auto-saved address"}
                                            </span>
                                        </div>
                                    </li>
                                    <li onClick={() => { setProfileDropdownOpen(false); navigate('/cart'); }}>
                                        <span className="dropdown-icon">🎟️</span>
                                        <div>
                                            <p className="dropdown-title">{t('navOffers')}</p>
                                            <span className="dropdown-sub">WELCOME50, TASTY10 active</span>
                                        </div>
                                    </li>
                                    <hr className="dropdown-divider" />
                                    <li onClick={handleLogout} className="logout-item">
                                        <img src={assets.logout_icon} alt="Logout" />
                                        <p>{t('navSignOut')}</p>
                                    </li>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Mobile Hamburger Toggle for Android / Mobile */}
                <button 
                    className="navbar-mobile-toggle"
                    onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
                    aria-label="Toggle Menu"
                    title="Menu"
                >
                    <span className="mobile-bar"></span>
                    <span className="mobile-bar"></span>
                    <span className="mobile-bar"></span>
                </button>
            </div>

            {/* Slide-out Mobile Navigation Drawer */}
            {mobileDrawerOpen && (
                <div className="mobile-drawer-overlay" onClick={() => setMobileDrawerOpen(false)}>
                    <div className="mobile-drawer-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="mobile-drawer-header">
                            <div className="drawer-brand">
                                <span className="drawer-icon">⚡🍔</span>
                                <span className="drawer-title">Quick<b>Bites</b></span>
                            </div>
                            <button className="drawer-close-btn" onClick={() => setMobileDrawerOpen(false)}>✕</button>
                        </div>

                        {/* Location Switcher in Mobile Drawer */}
                        <div className="drawer-location-card" onClick={() => { setMobileDrawerOpen(false); setShowLocationModal(true); }}>
                            <div className="drawer-loc-icon">📍</div>
                            <div className="drawer-loc-text">
                                <span className="drawer-loc-city">
                                    {currentLocation?.city || "Delhi NCR"}
                                    {currentLocation?.isGPSDetected && <span className="drawer-live-tag">LIVE</span>}
                                </span>
                                <span className="drawer-loc-area">{currentLocation?.area || "Tap to switch outlet"}</span>
                            </div>
                            <span className="drawer-loc-arrow">→</span>
                        </div>

                        {/* Language Selection in Mobile Drawer */}
                        <div className="drawer-lang-selector">
                            <div 
                                className="drawer-lang-header"
                                onClick={() => setMobileLangOpen(!mobileLangOpen)}
                                role="button"
                                tabIndex={0}
                            >
                                <span className="drawer-lang-icon">🌐</span>
                                <div style={{ flex: 1 }}>
                                    <span className="drawer-lang-label">{t('navLanguage')}: <b>{currentLanguage.nativeName}</b></span>
                                    <span className="drawer-lang-sub">{currentLanguage.name}</span>
                                </div>
                                <span className="drawer-lang-arrow">{mobileLangOpen ? '▴' : '▾'}</span>
                            </div>

                            {mobileLangOpen && (
                                <div className="drawer-lang-options-grid">
                                    {supportedLanguages.map((l) => (
                                        <button
                                            key={l.code}
                                            type="button"
                                            className={`drawer-lang-chip ${l.code === lang ? 'active' : ''}`}
                                            onClick={() => {
                                                setLanguage(l.code);
                                                setMobileLangOpen(false);
                                            }}
                                        >
                                            <span className="chip-native">{l.nativeName}</span>
                                            <span className="chip-roman">{l.name}</span>
                                            {l.code === lang && <span className="chip-check">✓</span>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <ul className="drawer-nav-list">
                            <li onClick={() => { setMobileDrawerOpen(false); navigateToSection('header', 'home'); }}>
                                <span>🏠 {t('navHome')}</span>
                            </li>
                            <li onClick={() => { setMobileDrawerOpen(false); navigateToSection('explore-menu', 'menu'); }}>
                                <span>🍽️ {t('exploreMenu')}</span>
                            </li>
                            <li onClick={() => { setMobileDrawerOpen(false); navigate('/daily'); }}>
                                <span>🍱 QuickBites Daily (Budget & Tiffins)</span>
                            </li>
                            <li onClick={() => { setMobileDrawerOpen(false); navigate('/myorders'); }}>
                                <span>📦 {t('navOrdersHistory')}</span>
                            </li>
                            <li onClick={() => { setMobileDrawerOpen(false); navigate('/cart'); }}>
                                <span>🛒 {t('navCart')} ({totalItems})</span>
                            </li>
                            <li onClick={() => { setMobileDrawerOpen(false); navigateToSection('app-download', 'mobile-app'); }}>
                                <span>📱 {t('navApp')}</span>
                            </li>
                            <li onClick={() => { setMobileDrawerOpen(false); navigateToSection('footer', 'contact-us'); }}>
                                <span>📞 {t('navContact')}</span>
                            </li>
                        </ul>

                        <div className="drawer-auth-box">
                            {!token ? (
                                <button className="drawer-login-btn" onClick={() => { setMobileDrawerOpen(false); setShowLogin(true); }}>
                                    {t('navSignIn')}
                                </button>
                            ) : (
                                <div className="drawer-user-info">
                                    <p className="drawer-user-name">👤 {user?.name || "Customer"}</p>
                                    <button className="drawer-signout-btn" onClick={() => { setMobileDrawerOpen(false); handleLogout(); }}>
                                        {t('navSignOut')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

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