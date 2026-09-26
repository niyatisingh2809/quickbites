import React, { useState, useEffect, useContext } from 'react';
import './TrackOrder.css';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';

const TrackOrder = () => {
  const { orderId } = useParams();
  const { url, token } = useContext(StoreContext);
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(600); // 10 minutes countdown in seconds
  const [riderDistance, setRiderDistance] = useState(1.4);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch order data
  const fetchOrderData = async (quiet = false) => {
    try {
      if (!quiet) setLoading(true);
      const res = await axios.get(`${url}/api/order/track/${orderId}`);
      if (res.data && res.data.success) {
        setOrder(res.data.data);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      console.error('Track Order fetch error:', err);
      setError('Unable to load order details');
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderData();
      // Auto-poll every 4 seconds for live updates
      const timer = setInterval(() => {
        fetchOrderData(true);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [orderId]);

  // Live countdown timer ticking down
  useEffect(() => {
    if (!order) return;
    const step = getStatusStep(order.status);
    if (step === 4) return; // Delivered

    const clock = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
      // Gradually decrease rider distance
      setRiderDistance((prev) => {
        if (prev <= 0.2) return 0.1;
        return +(prev - 0.05).toFixed(2);
      });
    }, 1000);

    return () => clearInterval(clock);
  }, [order]);

  const getStatusStep = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('deliver')) return 4;
    if (s.includes('out') || s.includes('way')) return 3;
    if (s.includes('process') || s.includes('cook') || s.includes('pack')) return 2;
    return 1;
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await axios.post(`${url}/api/order/status`, {
        orderId,
        status: newStatus
      });
      if (res.data && res.data.success) {
        setOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Status update error:', err);
      alert('Could not advance status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="track-order-page loading-state">
        <div className="track-loading-spinner"></div>
        <p>Loading real-time GPS tracking for Order #{orderId ? orderId.slice(-6).toUpperCase() : ''}...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="track-order-page error-state">
        <div className="track-error-card">
          <span className="error-icon">⚠️</span>
          <h3>{error || 'Order Details Unavailable'}</h3>
          <p>We couldn't retrieve this order. Please verify your order ID or check your orders history.</p>
          <button onClick={() => navigate('/myorders')} className="btn-back-orders">
            Go to My Orders
          </button>
        </div>
      </div>
    );
  }

  const step = getStatusStep(order.status);
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const formattedCountdown = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const riderProgressPercent = step === 4 ? 92 : (step === 3 ? 58 : 22);

  // Delivery destination address
  const deliveryAddressStr = order.address 
    ? `${order.address.street || ''}, ${order.address.city || ''}, ${order.address.state || ''} ${order.address.zipcode || ''}`.trim()
    : 'Customer Delivery Address';

  return (
    <div className="track-order-page">
      {/* Back button & breadcrumbs */}
      <div className="track-top-bar">
        <button onClick={() => navigate('/myorders')} className="btn-back-link">
          ← Back to Orders
        </button>
        <span className="live-gps-indicator">
          <span className="live-blink-dot"></span> LIVE GPS TRACKING
        </span>
      </div>

      <div className="track-main-layout">
        {/* LEFT COLUMN: Map & Rider Tracker */}
        <div className="track-left-col">
          {/* Zepto Style ETA Header Card */}
          <div className={`zepto-eta-card step-${step}`}>
            <div className="eta-header-top">
              <div>
                <span className="eta-badge">
                  {step === 4 ? '🎉 ORDER DELIVERED' : '⚡ INSTANT 10-MIN DELIVERY'}
                </span>
                <h1 className="eta-time-title">
                  {step === 4 ? (
                    'Delivered at your doorstep!'
                  ) : (
                    <>Arriving in <span className="highlight-mins">{minutes} mins</span> <span className="countdown-pill">⏱ {formattedCountdown}</span></>
                  )}
                </h1>
                <p className="eta-subtitle">
                  {step === 4 ? (
                    'Thank you for ordering with QuickBites! Enjoy your fresh food.'
                  ) : (
                    step === 3 ? (
                      `Rider Amit is en route • ${riderDistance} km away from your location`
                    ) : (
                      'QuickBites Kitchen is packing your delicious order fresh & hot'
                    )
                  )}
                </p>
              </div>

              <div className="eta-hero-icon-box">
                {step === 4 ? '🏡' : (step === 3 ? '🛵' : '👨‍🍳')}
              </div>
            </div>

            {/* Zepto-Style 4-Step Progress Bar */}
            <div className="zepto-stepper">
              <div className={`zepto-step ${step >= 1 ? 'active' : ''}`}>
                <div className="step-circle">{step >= 1 ? '✓' : '1'}</div>
                <span className="step-text">Order Placed</span>
              </div>
              <div className={`step-connector ${step >= 2 ? 'filled' : ''}`}></div>

              <div className={`zepto-step ${step >= 2 ? 'active' : ''}`}>
                <div className="step-circle">{step >= 2 ? '✓' : '2'}</div>
                <span className="step-text">Packed at Store</span>
              </div>
              <div className={`step-connector ${step >= 3 ? 'filled' : ''}`}></div>

              <div className={`zepto-step ${step >= 3 ? 'active' : ''}`}>
                <div className="step-circle">{step >= 3 ? '✓' : '3'}</div>
                <span className="step-text">On the Way</span>
              </div>
              <div className={`step-connector ${step >= 4 ? 'filled' : ''}`}></div>

              <div className={`zepto-step ${step >= 4 ? 'active' : ''}`}>
                <div className="step-circle">{step >= 4 ? '✓' : '4'}</div>
                <span className="step-text">Delivered</span>
              </div>
            </div>
          </div>

          {/* REALISTIC HIGH-FIDELITY DELIVERY MAP (Zepto / Swiggy Style) */}
          <div className="zepto-map-viewport">
            <div className="map-city-grid">
              {/* Street Names & Landmarks */}
              <span className="map-landmark mark-1">Sector 18 Metro</span>
              <span className="map-landmark mark-2">Atta Market Hub</span>
              <span className="map-landmark mark-3">Sector 19 Green Park</span>
              <span className="map-landmark mark-4">Residential Pocket C</span>

              {/* Road Network */}
              <div className="road-horizontal road-1"></div>
              <div className="road-horizontal road-2"></div>
              <div className="road-vertical road-v1"></div>
              <div className="road-vertical road-v2"></div>

              {/* Active Delivery Route with Animated Glow */}
              <div className="active-delivery-route">
                <div 
                  className="route-progress-fill" 
                  style={{ width: `${riderProgressPercent}%` }}
                ></div>

                {/* Animated Delivery Rider on Road */}
                <div 
                  className="live-rider-marker"
                  style={{ left: `${riderProgressPercent}%` }}
                >
                  <div className="radar-ping-ring"></div>
                  <div className="rider-sprite">
                    <span className="scooter-emoji">🛵</span>
                  </div>
                  <div className="rider-tooltip">
                    <b>{step === 4 ? 'Delivered' : `Amit • ${riderDistance} km`}</b>
                    <span>{step === 4 ? 'At Doorstep' : `${minutes} mins away`}</span>
                  </div>
                </div>
              </div>

              {/* Origin: QuickBites Dark Store */}
              <div className="map-pin-origin">
                <div className="store-pin-bubble">
                  <span className="pin-icon">🏪</span>
                  <div className="pin-text">
                    <b>QuickBites Kitchen</b>
                    <span>Sector 18 Cloud Hub</span>
                  </div>
                </div>
              </div>

              {/* Destination: Customer Home */}
              <div className="map-pin-destination">
                <div className="home-pin-bubble">
                  <div className="dest-pulse-dot"></div>
                  <span className="pin-icon">🏠</span>
                  <div className="pin-text">
                    <b>Delivery Address</b>
                    <span>{order.address?.street || 'Your Location'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Partner Profile Card (Zepto Style) */}
          <div className="rider-profile-card">
            <div className="rider-profile-left">
              <div className="rider-avatar-badge">
                <span className="rider-avatar-emoji">👨‍🦱</span>
                <span className="vaccinated-tick" title="Vaccinated & Sanitized">🛡️</span>
              </div>
              <div className="rider-info-details">
                <div className="rider-name-row">
                  <h3 className="rider-name">Amit Verma</h3>
                  <span className="rating-badge">★ 4.96 (1,420 deliveries)</span>
                </div>
                <p className="rider-vehicle-text">
                  ⚡ Hero Electric Optima • UP 16 AB 9120 • Wearing Mask & Gloves
                </p>
              </div>
            </div>

            <div className="rider-contact-actions">
              <button 
                className="btn-call-partner"
                onClick={() => alert(`📞 Calling Delivery Partner Amit Verma: +91 98765 43210\nConnecting to toll-free masked rider call...`)}
              >
                <span>📞</span> Call Partner
              </button>
              <button 
                className="btn-chat-partner"
                onClick={() => alert(`💬 Delivery Note sent to Amit: "Please do not ring the doorbell. Call on mobile upon arrival."`)}
              >
                <span>💬</span> Delivery Note
              </button>
            </div>
          </div>

          {/* Interactive Simulation / Status Controls */}
          <div className="track-status-controls-box">
            <div className="controls-header">
              <span className="controls-badge">⚡ Interactive Controls</span>
              <p>Simulate delivery progress or advance order status:</p>
            </div>
            <div className="controls-buttons-grid">
              <button 
                disabled={updatingStatus}
                className={`btn-advance-step ${step === 2 ? 'active' : ''}`}
                onClick={() => handleUpdateStatus('Food Processing')}
              >
                👨‍🍳 1. Packed at Store
              </button>
              <button 
                disabled={updatingStatus}
                className={`btn-advance-step ${step === 3 ? 'active' : ''}`}
                onClick={() => handleUpdateStatus('Out for delivery')}
              >
                🛵 2. Out for Delivery
              </button>
              <button 
                disabled={updatingStatus}
                className={`btn-advance-step btn-complete ${step === 4 ? 'active' : ''}`}
                onClick={() => handleUpdateStatus('Delivered')}
              >
                🎉 3. Mark as Delivered
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary & Receipt Breakdown */}
        <div className="track-right-col">
          <div className="order-receipt-card">
            <div className="receipt-header">
              <h3>Order Summary</h3>
              <span className="order-number-tag">
                #{order._id.slice(-6).toUpperCase()}
              </span>
            </div>

            {/* Delivery address box */}
            <div className="receipt-address-box">
              <div className="addr-icon-box">📍</div>
              <div>
                <p className="addr-recipient">
                  {order.address?.firstName || ''} {order.address?.lastName || ''}
                </p>
                <p className="addr-full-text">{deliveryAddressStr}</p>
                <p className="addr-phone">Phone: +91 {order.address?.phone || '9876543210'}</p>
              </div>
            </div>

            {/* Items list */}
            <div className="receipt-items-list">
              <p className="items-header-label">Items in Order ({order.items?.length || 0})</p>
              {order.items?.map((item, idx) => (
                <div key={idx} className="receipt-item-row">
                  <div className="receipt-item-img-title">
                    <img 
                      src={`${url}/images/${item.image}`} 
                      alt={item.name} 
                      className="receipt-item-img"
                    />
                    <div>
                      <p className="receipt-item-name">{item.name}</p>
                      <span className="receipt-item-qty">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="receipt-item-price">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Bill breakdown */}
            <div className="receipt-bill-breakdown">
              <div className="bill-row">
                <span>Items Subtotal</span>
                <span>₹{order.amount - (order.discount || 0) > 0 ? order.amount : order.amount}</span>
              </div>
              <div className="bill-row">
                <span>Delivery Partner Fee</span>
                <span className="free-delivery-tag">FREE (Zepto Fast Delivery)</span>
              </div>
              {order.discount > 0 && (
                <div className="bill-row discount-row">
                  <span>Promo Discount ({order.promoCode || 'SAVINGS'})</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <hr className="bill-divider" />
              <div className="bill-row bill-total-row">
                <b>Total Amount Paid</b>
                <b className="total-rupees">₹{order.amount}</b>
              </div>
              <div className="payment-mode-pill">
                <span>Payment Mode: <b>{order.paymentMethod ? order.paymentMethod.toUpperCase() : 'ONLINE'}</b></span>
                <span className="paid-tick">✅ PAID</span>
              </div>
              {order.transactionId && (
                <div className="txn-ref-pill">
                  <span>Txn Ref: <b>{order.transactionId}</b></span>
                </div>
              )}
            </div>

            {/* Support Help */}
            <div className="receipt-support-box">
              <p>Need help with this order?</p>
              <button 
                className="btn-support-call"
                onClick={() => alert('📞 QuickBites 24x7 Customer Care: +91 98765 43210\nOur support team is ready to assist you!')}
              >
                📞 Contact 24/7 Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
