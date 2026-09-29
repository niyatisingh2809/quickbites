import React, { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../Context/StoreContext.jsx';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import './MyOrders.css';

const MyOrders = ({ setShowLogin }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTrackingOrder, setActiveTrackingOrder] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const { url, token, addToCart } = useContext(StoreContext);
    const navigate = useNavigate();

    const fetchOrders = async (isQuiet = false) => {
        const activeToken = token || localStorage.getItem("token");
        if (!activeToken) {
            setLoading(false);
            return;
        }
        try {
            if (!isQuiet) setLoading(true);
            const response = await axios.post(url + "/api/order/userorders", {}, { headers: { token: activeToken } });
            if (response.data && response.data.data) {
                const freshOrders = response.data.data.reverse();
                setData(freshOrders);
                // Also sync active modal order if open
                if (activeTrackingOrder) {
                    const matched = freshOrders.find(o => o._id === activeTrackingOrder._id);
                    if (matched) setActiveTrackingOrder(matched);
                }
            }
        } catch (err) {
            console.warn("Fetch orders notice:", err.message);
            try {
                const localOrders = JSON.parse(localStorage.getItem("quickbites_orders")) || [];
                if (localOrders.length > 0) {
                    setData(localOrders);
                }
            } catch (e) {}
        } finally {
            if (!isQuiet) setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // Quiet live polling every 5 seconds for real-time tracking updates
        const interval = setInterval(() => {
            fetchOrders(true);
        }, 5000);
        return () => clearInterval(interval);
    }, [token]);

    const activeToken = token || localStorage.getItem("token");

    const handleReorder = (order) => {
        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
                for (let i = 0; i < (item.quantity || 1); i++) {
                    addToCart(item._id);
                }
            });
            alert("🛍️ Items re-added to your cart!");
            navigate('/cart');
        }
    };

    const getStatusStep = (status) => {
        const s = (status || "").toLowerCase();
        if (s.includes("deliver")) return 4;
        if (s.includes("out") || s.includes("way")) return 3;
        if (s.includes("process") || s.includes("cook")) return 2;
        return 1;
    };

    // Update order status live in backend and UI
    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            setUpdatingId(orderId);
            const response = await axios.post(url + "/api/order/status", {
                orderId,
                status: newStatus
            });
            if (response.data.success) {
                // Optimistically update local state immediately
                setData(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
                if (activeTrackingOrder && activeTrackingOrder._id === orderId) {
                    setActiveTrackingOrder(prev => ({ ...prev, status: newStatus }));
                }
            }
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Could not update status. Please try again.");
        } finally {
            setUpdatingId(null);
        }
    };

    // Quick advance to next logical step
    const handleAdvanceNext = (order) => {
        const step = getStatusStep(order.status);
        if (step === 1 || step === 2) {
            handleUpdateStatus(order._id, "Out for delivery");
        } else if (step === 3) {
            handleUpdateStatus(order._id, "Delivered");
        } else if (step === 4) {
            // Re-open for testing
            handleUpdateStatus(order._id, "Food Processing");
        }
    };

    if (!activeToken) {
        return (
            <div className='my-orders empty-state'>
                <div className="empty-orders-card">
                    <span className="empty-emoji">🔐</span>
                    <h2>Sign In to View Orders</h2>
                    <p>Track your active food deliveries, view past orders, and re-order your favorite meals.</p>
                    <button onClick={() => setShowLogin && setShowLogin(true)} className="orders-login-btn">
                        Sign In / Create Account
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='my-orders'>
            <div className="my-orders-header">
                <div>
                    <h2>Orders History & Live Tracking</h2>
                    <p className="my-orders-subtitle">
                        {data.length} {data.length === 1 ? 'order' : 'orders'} placed • Instant live status updates
                    </p>
                </div>
                <button onClick={() => fetchOrders(false)} className="refresh-orders-btn">
                    🔄 Refresh Status
                </button>
            </div>

            {loading && data.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    Loading your orders...
                </div>
            ) : data.length === 0 ? (
                <div className="empty-orders-card">
                    <span className="empty-emoji">🍽️</span>
                    <h2>No Orders Placed Yet</h2>
                    <p>Looks like you haven't placed any orders yet. Discover delicious dishes from our menu!</p>
                    <button onClick={() => navigate('/')} className="orders-login-btn">
                        Explore Menu
                    </button>
                </div>
            ) : (
                <div className="orders-card-list">
                    {data.map((order, index) => {
                        const step = getStatusStep(order.status);
                        const isDelivered = step === 4;
                        const isOutForDelivery = step === 3;
                        const isKitchen = step === 2;

                        const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN", {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        }) : "Recent Order";

                        return (
                            <div key={order._id || index} className={`order-card-container ${isDelivered ? 'card-delivered' : ''}`}>
                                <div className="order-card-top">
                                    <div className="order-id-group">
                                        <div className="parcel-avatar-box">
                                            {isDelivered ? '🎉' : (isOutForDelivery ? '🛵' : '👨‍🍳')}
                                        </div>
                                        <div>
                                            <span className="order-id-badge">Order #{order._id ? order._id.slice(-6).toUpperCase() : (index + 1)}</span>
                                            <span className="order-date-text">{orderDate}</span>
                                        </div>
                                    </div>
                                    <div className="order-status-pill-wrap">
                                        <span className={`order-status-badge step-${step}`}>
                                            ● {order.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Interactive 4-Step Visual Tracker */}
                                <div className="order-tracker-timeline">
                                    <div 
                                        className={`tracker-step ${step >= 1 ? 'completed' : ''}`}
                                        title="Step 1: Order Placed"
                                    >
                                        <div className="step-circle">{step >= 1 ? '✓' : '1'}</div>
                                        <span className="step-label">Order Placed</span>
                                    </div>
                                    <div className={`tracker-line ${step >= 2 ? 'active' : ''}`}></div>
                                    
                                    <div 
                                        className={`tracker-step ${step >= 2 ? 'completed' : ''} step-clickable`}
                                        onClick={() => handleUpdateStatus(order._id, "Food Processing")}
                                        title="Click to set: In Kitchen"
                                    >
                                        <div className="step-circle">{step >= 2 ? '✓' : '2'}</div>
                                        <span className="step-label">In Kitchen</span>
                                    </div>
                                    <div className={`tracker-line ${step >= 3 ? 'active' : ''}`}></div>

                                    <div 
                                        className={`tracker-step ${step >= 3 ? 'completed' : ''} step-clickable`}
                                        onClick={() => handleUpdateStatus(order._id, "Out for delivery")}
                                        title="Click to set: Out for Delivery"
                                    >
                                        <div className="step-circle">{step >= 3 ? '✓' : '3'}</div>
                                        <span className="step-label">Out for Delivery</span>
                                    </div>
                                    <div className={`tracker-line ${step >= 4 ? 'active' : ''}`}></div>

                                    <div 
                                        className={`tracker-step ${step >= 4 ? 'completed' : ''} step-clickable`}
                                        onClick={() => handleUpdateStatus(order._id, "Delivered")}
                                        title="Click to set: Delivered"
                                    >
                                        <div className="step-circle">{step >= 4 ? '✓' : '4'}</div>
                                        <span className="step-label">Delivered</span>
                                    </div>
                                </div>

                                {/* Order details */}
                                <div className="order-items-summary">
                                    <p className="order-items-text">
                                        <b>Items:</b> {order.items.map((item, idx) => (
                                            <span key={idx}>
                                                {item.name} × {item.quantity}{idx < order.items.length - 1 ? ', ' : ''}
                                            </span>
                                        ))}
                                    </p>
                                    {order.address && (
                                        <p className="order-address-text">
                                            <b>Deliver to:</b> {order.address.street ? `${order.address.street}, ${order.address.city || ""}` : (order.address.city || "Saved Address")}
                                        </p>
                                    )}
                                </div>

                                <div className="order-card-bottom">
                                    <div className="order-price-info">
                                        <span className="order-amount-label">Total Amount</span>
                                        <span className="order-amount-val">₹{order.amount}</span>
                                    </div>
                                    
                                    <div className="order-action-btns">
                                        <button onClick={() => handleReorder(order)} className="btn-reorder">
                                            🛍️ Re-order
                                        </button>
                                        
                                        {/* Status Advance Quick Button */}
                                        <button 
                                            onClick={() => handleAdvanceNext(order)}
                                            disabled={updatingId === order._id}
                                            className={`btn-advance-status ${isDelivered ? 'btn-delivered-done' : ''}`}
                                        >
                                            {updatingId === order._id ? "Updating..." : (
                                                isKitchen ? "🛵 Dispatch Order" :
                                                (isOutForDelivery ? "✅ Mark Delivered" : "🎉 Completed (Re-open)")
                                            )}
                                        </button>

                                        {/* Open Zepto-style Full Live Tracking Page */}
                                        <button 
                                            onClick={() => navigate(`/track/${order._id}`)} 
                                            className="btn-track-order"
                                        >
                                            📍 Track Order
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* FULL SCREEN LIVE TRACKING MODAL */}
            {activeTrackingOrder && (
                <div className="tracking-modal-backdrop" onClick={() => setActiveTrackingOrder(null)}>
                    <div className="tracking-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="tracking-modal-header">
                            <div>
                                <span className="modal-eyebrow">🔴 Live GPS Tracking</span>
                                <h3>Order #{activeTrackingOrder._id ? activeTrackingOrder._id.slice(-6).toUpperCase() : "LIVE"}</h3>
                            </div>
                            <button className="modal-close-btn" onClick={() => setActiveTrackingOrder(null)}>✕</button>
                        </div>

                        {/* Status announcement hero */}
                        {(() => {
                            const step = getStatusStep(activeTrackingOrder.status);
                            return (
                                <div className={`modal-status-hero step-${step}`}>
                                    <div className="hero-status-icon">
                                        {step === 4 ? '🎉' : (step === 3 ? '🛵' : '👨‍🍳')}
                                    </div>
                                    <div className="hero-status-details">
                                        <h4>
                                            {step === 4 ? "Order Delivered Successfully!" :
                                             (step === 3 ? "Delivery Partner is on the way!" :
                                              "Your food is being prepared in kitchen")}
                                        </h4>
                                        <p>
                                            {step === 4 ? "Enjoy your meal! Rated 5 stars by customers." :
                                             (step === 3 ? "Estimated arrival in ~12 mins at your doorstep." :
                                              "Our top chefs are crafting your fresh order.")}
                                        </p>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Interactive Animated Route Map */}
                        <div className="animated-map-canvas">
                            <div className="map-road-bg">
                                <div className="map-grid-overlay"></div>
                                <div className="road-path-line">
                                    <div 
                                        className="animated-bike-rider"
                                        style={{
                                            left: getStatusStep(activeTrackingOrder.status) === 4 ? '88%' : 
                                                  (getStatusStep(activeTrackingOrder.status) === 3 ? '52%' : '18%')
                                        }}
                                    >
                                        <div className="bike-pulse-ring"></div>
                                        <span className="bike-icon">🛵</span>
                                        <span className="rider-floating-tag">
                                            {getStatusStep(activeTrackingOrder.status) === 4 ? "Arrived!" : "Rider (8 mins)"}
                                        </span>
                                    </div>
                                </div>

                                <div className="map-node node-restaurant">
                                    <span className="node-icon">🏪</span>
                                    <div className="node-info">
                                        <b>QuickBites Kitchen</b>
                                        <span>Sector 18, Hub</span>
                                    </div>
                                </div>

                                <div className="map-node node-destination">
                                    <span className="node-icon">📍</span>
                                    <div className="node-info">
                                        <b>Delivery Location</b>
                                        <span>{activeTrackingOrder.address?.city || "Customer Address"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4-Step Stepper in Modal */}
                        {(() => {
                            const step = getStatusStep(activeTrackingOrder.status);
                            return (
                                <div className="modal-tracker-timeline">
                                    <div 
                                        className={`modal-step ${step >= 1 ? 'completed' : ''}`}
                                    >
                                        <div className="modal-step-circle">{step >= 1 ? '✓' : '1'}</div>
                                        <span className="modal-step-label">Order Placed</span>
                                    </div>
                                    <div className={`modal-step-line ${step >= 2 ? 'active' : ''}`}></div>

                                    <div 
                                        className={`modal-step ${step >= 2 ? 'completed' : ''} step-clickable`}
                                        onClick={() => handleUpdateStatus(activeTrackingOrder._id, "Food Processing")}
                                    >
                                        <div className="modal-step-circle">{step >= 2 ? '✓' : '2'}</div>
                                        <span className="modal-step-label">In Kitchen</span>
                                    </div>
                                    <div className={`modal-step-line ${step >= 3 ? 'active' : ''}`}></div>

                                    <div 
                                        className={`modal-step ${step >= 3 ? 'completed' : ''} step-clickable`}
                                        onClick={() => handleUpdateStatus(activeTrackingOrder._id, "Out for delivery")}
                                    >
                                        <div className="modal-step-circle">{step >= 3 ? '✓' : '3'}</div>
                                        <span className="modal-step-label">Out for Delivery</span>
                                    </div>
                                    <div className={`modal-step-line ${step >= 4 ? 'active' : ''}`}></div>

                                    <div 
                                        className={`modal-step ${step >= 4 ? 'completed' : ''} step-clickable`}
                                        onClick={() => handleUpdateStatus(activeTrackingOrder._id, "Delivered")}
                                    >
                                        <div className="modal-step-circle">{step >= 4 ? '✓' : '4'}</div>
                                        <span className="modal-step-label">Delivered</span>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Delivery Partner Contact Card */}
                        <div className="delivery-partner-card">
                            <div className="partner-avatar-wrap">
                                <div className="partner-avatar">👨‍🦱</div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <b className="partner-name">Rahul Sharma</b>
                                        <span className="partner-badge">🛡️ Verified</span>
                                    </div>
                                    <p className="partner-meta">★ 4.9 (840+ deliveries) • Hero Electric Optima</p>
                                </div>
                            </div>

                            <div className="partner-actions">
                                <button 
                                    className="partner-call-btn"
                                    onClick={() => alert("📞 Connecting to Delivery Partner: +91 98765 43210 (Direct Toll-Free)")}
                                >
                                    📞 Call Partner
                                </button>
                                <button 
                                    className="partner-chat-btn"
                                    onClick={() => alert("💬 Delivery Partner: 'I am on my way with your hot meal! Will reach in 8 minutes.'")}
                                >
                                    💬 Message
                                </button>
                            </div>
                        </div>

                        {/* Interactive Status Advance Buttons in Modal */}
                        <div className="modal-control-row">
                            <p className="modal-control-title">⚡ Quick Complete / Advance Track:</p>
                            <div className="modal-control-buttons">
                                <button 
                                    className={`btn-state-toggle ${getStatusStep(activeTrackingOrder.status) === 2 ? 'active' : ''}`}
                                    onClick={() => handleUpdateStatus(activeTrackingOrder._id, "Food Processing")}
                                >
                                    👨‍🍳 In Kitchen
                                </button>
                                <button 
                                    className={`btn-state-toggle ${getStatusStep(activeTrackingOrder.status) === 3 ? 'active' : ''}`}
                                    onClick={() => handleUpdateStatus(activeTrackingOrder._id, "Out for delivery")}
                                >
                                    🛵 Out for Delivery
                                </button>
                                <button 
                                    className={`btn-state-toggle btn-complete-highlight ${getStatusStep(activeTrackingOrder.status) === 4 ? 'active' : ''}`}
                                    onClick={() => handleUpdateStatus(activeTrackingOrder._id, "Delivered")}
                                >
                                    🎉 Complete Track (Delivered)
                                </button>
                            </div>
                        </div>

                        {/* Order Summary in modal */}
                        <div className="modal-items-box">
                            <div className="modal-items-header">
                                <span>Order Summary ({activeTrackingOrder.items?.length} items)</span>
                                <b>₹{activeTrackingOrder.amount}</b>
                            </div>
                            <div className="modal-items-list">
                                {activeTrackingOrder.items?.map((item, idx) => (
                                    <div key={idx} className="modal-item-row">
                                        <span>{item.name} × {item.quantity}</span>
                                        <span>₹{item.price * (item.quantity || 1)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOrders;