import React, { useState, useContext } from 'react';
import './LocationModal.css';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';
import { LanguageContext } from '../../Context/LanguageContext';

const LocationModal = ({ isOpen, onClose, currentLocation, onSelectLocation, onDetectGPS, isDetectingGPS }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistPincode, setWaitlistPincode] = useState("");
  const [waitlistCity, setWaitlistCity] = useState("");
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [waitlistMessage, setWaitlistMessage] = useState("");

  const { url, user } = useContext(StoreContext) || {};
  const langCtx = useContext(LanguageContext);
  const t = langCtx?.t || ((k) => k);

  if (!isOpen) return null;

  const popularHubs = [
    {
      city: "Mirzapur",
      area: "Civil Lines / Station Road",
      state: "Uttar Pradesh",
      pincode: "231001",
      hubName: "QuickBites Mirzapur Express Hub",
      hubLandmark: "Near Station Road, Civil Lines",
      deliveryTime: "15-20 mins",
      latitude: 25.1337,
      longitude: 82.5644,
      tag: "🔥 UP Special"
    },
    {
      city: "Delhi NCR",
      area: "Connaught Place / Sector 18",
      state: "Delhi",
      pincode: "110001",
      hubName: "QuickBites Delhi NCR Mega Hub",
      hubLandmark: "Inner Circle & Sector 18 Dark Store",
      deliveryTime: "10-15 mins",
      latitude: 28.6139,
      longitude: 77.2090,
      tag: "⚡ 10-Min Fast"
    },
    {
      city: "Varanasi",
      area: "Godowlia / Cantt",
      state: "Uttar Pradesh",
      pincode: "221001",
      hubName: "QuickBites Varanasi Heritage Hub",
      hubLandmark: "Near Cantt Railway Station",
      deliveryTime: "15-20 mins",
      latitude: 25.3176,
      longitude: 82.9739,
      tag: "Popular"
    },
    {
      city: "Lucknow",
      area: "Hazratganj / Gomti Nagar",
      state: "Uttar Pradesh",
      pincode: "226001",
      hubName: "QuickBites Lucknow Central Hub",
      hubLandmark: "Hazratganj Commercial Belt",
      deliveryTime: "15-25 mins",
      latitude: 26.8467,
      longitude: 80.9462,
      tag: "Express"
    },
    {
      city: "Prayagraj",
      area: "Civil Lines / Katra",
      state: "Uttar Pradesh",
      pincode: "211001",
      hubName: "QuickBites Prayagraj Hub",
      hubLandmark: "Subhash Chauraha, Civil Lines",
      deliveryTime: "15-20 mins",
      latitude: 25.4358,
      longitude: 81.8463,
      tag: "Express"
    },
    {
      city: "Mumbai",
      area: "Bandra West / Andheri",
      state: "Maharashtra",
      pincode: "400050",
      hubName: "QuickBites Mumbai Coastal Hub",
      hubLandmark: "Hill Road & Linking Road Outlet",
      deliveryTime: "12-18 mins",
      latitude: 19.0760,
      longitude: 72.8777,
      tag: "Metro Hub"
    },
    {
      city: "Bengaluru",
      area: "Koramangala / Indiranagar",
      state: "Karnataka",
      pincode: "560034",
      hubName: "QuickBites Silicon Cloud Kitchen",
      hubLandmark: "80ft Road, 4th Block Koramangala",
      deliveryTime: "10-15 mins",
      latitude: 12.9716,
      longitude: 77.5946,
      tag: "⚡ 10-Min Fast"
    }
  ];

  const filteredHubs = popularHubs.filter(hub => 
    hub.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hub.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hub.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (hub) => {
    onSelectLocation(hub);
    onClose();
  };

  const handleJoinWaitlist = async (e) => {
    e.preventDefault();
    const activeUrl = url || import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
    if (!waitlistEmail || !waitlistPincode) {
      alert("Please provide both email and 6-digit pincode.");
      return;
    }
    setWaitlistSubmitting(true);
    try {
      const res = await axios.post(`${activeUrl}/api/waitlist/join`, {
        email: waitlistEmail,
        pincode: waitlistPincode,
        city: waitlistCity || searchQuery || "Unserviced Area",
        area: searchQuery || ""
      });
      if (res.data.success) {
        setWaitlistMessage(res.data.message || "🎉 You're on the priority waitlist!");
        setWaitlistEmail("");
        setWaitlistPincode("");
        setWaitlistCity("");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to join waitlist. Please check inputs.");
    } finally {
      setWaitlistSubmitting(false);
    }
  };

  return (
    <div className="location-modal-overlay" onClick={onClose}>
      <div className="location-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="location-modal-header">
          <div className="header-title-box">
            <span className="header-icon">📍</span>
            <div>
              <h3>{t('selectLocation')}</h3>
              <p>Choose your city or outlet to see live delivery time & menu</p>
            </div>
          </div>
          <button className="location-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Hyperlocal Explanation Banner */}
        <div className="hyperlocal-info-banner">
          <div className="banner-icon">💡</div>
          <div className="banner-text">
            <b>Hyperlocal Cloud Kitchen Delivery:</b>
            <span>
              Delhi me baith kar Mirzapur ke liye order karna hai? Yahan se <b>Mirzapur</b> chuniye. Mirzapur ke local outlet se fresh & hot delivery hogi!
            </span>
          </div>
        </div>

        {/* GPS Live Location Trigger Button */}
        <div className="gps-detect-card" onClick={onDetectGPS}>
          <div className="gps-icon-wrapper">
            {isDetectingGPS ? (
              <span className="gps-spinner"></span>
            ) : (
              <span className="gps-target-icon">🎯</span>
            )}
          </div>
          <div className="gps-card-text">
            <b>{isDetectingGPS ? "Detecting Live GPS Coordinates..." : t('liveGps')}</b>
            <span>Using device GPS to auto-assign the nearest QuickBites dark store</span>
          </div>
          <span className="gps-arrow-btn">Detect ➔</span>
        </div>

        {/* Search input */}
        <div className="location-search-wrap">
          <span className="search-icon-symbol">🔍</span>
          <input 
            type="text" 
            placeholder="Search city, area or dark store hub..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery("")}>✕</button>
          )}
        </div>

        {/* Popular Outlets / Hubs List */}
        <div className="hubs-list-section">
          <div className="hubs-section-title">
            <span>Available QuickBites Outlets & Hubs</span>
            <span className="active-hub-indicator">
              Current: <b>{currentLocation?.city || 'Delhi NCR'}</b>
            </span>
          </div>

          <div className="hubs-grid">
            {filteredHubs.map((hub, idx) => {
              const isSelected = currentLocation?.city?.toLowerCase() === hub.city.toLowerCase();
              return (
                <div 
                  key={idx} 
                  className={`hub-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(hub)}
                >
                  <div className="hub-card-top">
                    <span className="hub-city-name">{hub.city}</span>
                    {hub.tag && <span className="hub-tag">{hub.tag}</span>}
                  </div>
                  <p className="hub-area-text">{hub.area}, {hub.state}</p>
                  <p className="hub-kitchen-name">🏬 {hub.hubName}</p>
                  <div className="hub-card-bottom">
                    <span className="hub-delivery-eta">⏱️ {hub.deliveryTime}</span>
                    {isSelected ? (
                      <span className="hub-active-badge">✓ Active Outlet</span>
                    ) : (
                      <span className="hub-select-btn">Select Hub ➔</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredHubs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', margin: '14px 0', color: '#92400e', fontSize: '13px', fontWeight: 600 }}>
              ⚠️ No active QuickBites dark store outlet matching "{searchQuery}" yet.
            </div>
          )}

          {/* Phase 7: Service-Area Waitlist Demand Capture Box */}
          <div className="waitlist-card-box">
            <div className="waitlist-header-row">
              <span className="waitlist-icon">🏙️</span>
              <div>
                <h4 className="waitlist-title">{t('waitlistTitle')}</h4>
                <p className="waitlist-subtitle">{t('waitlistSub')}</p>
              </div>
            </div>

            {waitlistMessage ? (
              <div className="waitlist-success-banner">
                {waitlistMessage}
              </div>
            ) : (
              <form onSubmit={handleJoinWaitlist} className="waitlist-form">
                <div className="waitlist-inputs-row">
                  <input
                    type="text"
                    placeholder="6-Digit Pincode (e.g. 231304)"
                    maxLength={6}
                    value={waitlistPincode}
                    onChange={(e) => setWaitlistPincode(e.target.value)}
                    required
                    className="waitlist-input"
                  />
                  <input
                    type="text"
                    placeholder="City / Area"
                    value={waitlistCity}
                    onChange={(e) => setWaitlistCity(e.target.value)}
                    className="waitlist-input"
                  />
                </div>
                <div className="waitlist-submit-row">
                  <input
                    type="email"
                    placeholder="Email for ₹100 launch voucher"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    required
                    className="waitlist-input"
                  />
                  <button
                    type="submit"
                    disabled={waitlistSubmitting}
                    className="waitlist-submit-btn"
                  >
                    {waitlistSubmitting ? "..." : t('waitlistBtn')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="location-modal-footer">
          <span>🔒 Orders are routed to 100% verified FSSAI approved dark stores within 5 km of delivery address.</span>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
