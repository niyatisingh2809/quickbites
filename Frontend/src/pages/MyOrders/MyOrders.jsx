import React, { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../Context/StoreContext.jsx';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import ReportIssueModal from '../Support/ReportIssueModal';
import './MyOrders.css';

const MyOrders = ({ setShowLogin }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTrackingOrder, setActiveTrackingOrder] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [reportOrder, setReportOrder] = useState(null);
    const [reorderModalData, setReorderModalData] = useState(null);
    const [reorderLoadingId, setReorderLoadingId] = useState(null);

    const { url, token, addToCart, addThaliToCart } = useContext(StoreContext);
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

    const executeReorderItems = (items) => {
        let addedCount = 0;
        items.forEach(item => {
            if (item.isAvailable) {
                if (item.isThali && item.thaliConfiguration) {
                    addThaliToCart(item.thaliConfiguration);
                    addedCount += (item.quantity || 1);
                } else if (item.foodId || item._id) {
                    for (let i = 0; i < (item.quantity || 1); i++) {
                        addToCart(item.foodId || item._id);
                    }
                    addedCount += (item.quantity || 1);
                }
            }
        });
        setReorderModalData(null);
        if (addedCount > 0) {
            navigate('/cart');
        } else {
            alert("No available items could be added to the cart.");
        }
    };

    const handleReorder = async (order) => {
        setReorderLoadingId(order._id);
        try {
            const response = await axios.post(
                url + "/api/order/reorder-check",
                { orderId: order._id },
                { headers: { token: activeToken } }
            );
            if (response.data && response.data.success) {
                const checkData = response.data;
                if (checkData.restaurant?.isRushModePaused) {
                    alert(`⏳ ${checkData.restaurant.name || "Kitchen"} is currently in Kitchen Rush Mode and pausing new orders. Please try again in a few minutes!`);
                    return;
                }
                if (checkData.restaurant?.isOpen === false) {
                    alert(`🏪 ${checkData.restaurant.name || "Kitchen"} is currently closed for new orders.`);
                    return;
                }
                if (!checkData.allAvailable || checkData.priceChanged) {
                    setReorderModalData(checkData);
                } else {
                    executeReorderItems(checkData.items);
                }
            } else {
                // Fallback direct reorder
                executeReorderItems(order.items.map(it => ({ ...it, foodId: it._id, isAvailable: true })));
            }
        } catch (err) {
            console.error("Reorder check error:", err);
            // Fallback direct reorder
            executeReorderItems(order.items.map(it => ({ ...it, foodId: it._id, isAvailable: true })));
        } finally {
            setReorderLoadingId(null);
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
                                            <span key={idx} style={{ display: 'inline-block', marginRight: '6px' }}>
                                                <strong>{item.name}</strong> × {item.quantity}
                                                {item.isThali && item.thaliConfiguration && (
                                                    <span style={{ display: 'block', fontSize: '12px', color: '#0284c7', background: '#f0f9ff', padding: '4px 8px', borderRadius: '6px', margin: '3px 0' }}>
                                                        🍱 <em>Includes:</em> {(item.thaliConfiguration.components || []).map(c => `${c.name}${c.portion ? ` (${c.portion})` : ''}${c.quantity > 1 ? ` x${c.quantity}` : ''}`).join(', ')}
                                                        {item.thaliConfiguration.preparationInstructions && ` | 👨‍🍳 Note: ${item.thaliConfiguration.preparationInstructions}`}
                                                    </span>
                                                )}
                                                {idx < order.items.length - 1 ? ', ' : ''}
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
                                        <button 
                                            onClick={() => handleReorder(order)} 
                                            disabled={reorderLoadingId === order._id}
                                            className="btn-reorder"
                                        >
                                            {reorderLoadingId === order._id ? "Verifying..." : "🛍️ Re-order"}
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

                                        {/* Support Dispute Button */}
                                        {order.hasActiveSupportTicket ? (
                                            <button
                                                onClick={() => navigate('/support/tickets')}
                                                style={{
                                                    background: '#eff6ff',
                                                    color: '#1d4ed8',
                                                    border: '1px solid #bfdbfe',
                                                    padding: '7px 12px',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                    fontWeight: '700',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                🎫 Ticket Active
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setReportOrder(order)}
                                                style={{
                                                    background: '#fef2f2',
                                                    color: '#b91c1c',
                                                    border: '1px solid #fecaca',
                                                    padding: '7px 12px',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                    fontWeight: '700',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                🚨 Report Issue
                                            </button>
                                        )}
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

            {/* Smart Reorder Stock & Price Verification Modal */}
            {reorderModalData && (
                <div className="report-modal-overlay" onClick={() => setReorderModalData(null)}>
                    <div className="report-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
                        <div className="report-modal-header">
                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                                    🛍️ Smart Reorder Verification
                                </h3>
                                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                                    {reorderModalData.restaurant?.name || "Kitchen"} • Live Stock & Price Check
                                </p>
                            </div>
                            <button className="btn-close-modal" onClick={() => setReorderModalData(null)}>✕</button>
                        </div>

                        <div style={{ padding: '16px 20px' }}>
                            <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 14px' }}>
                                Some items or prices from this past order have changed since your last order:
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
                                {reorderModalData.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '10px 12px',
                                            borderRadius: '10px',
                                            background: item.isAvailable ? '#f8fafc' : '#fef2f2',
                                            border: item.isAvailable ? '1px solid #e2e8f0' : '1px solid #fecaca'
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '13.5px', color: item.isAvailable ? '#0f172a' : '#991b1b' }}>
                                                {item.name} × {item.quantity}
                                            </div>
                                            {!item.isAvailable && (
                                                <div style={{ fontSize: '11.5px', color: '#dc2626', fontWeight: 600, marginTop: '2px' }}>
                                                    ⚠️ {item.reason || "Currently Out of Stock"}
                                                </div>
                                            )}
                                            {item.isAvailable && item.oldPrice !== item.newPrice && (
                                                <div style={{ fontSize: '11.5px', color: '#b45309', fontWeight: 600, marginTop: '2px' }}>
                                                    Price updated: ₹{item.oldPrice} → ₹{item.newPrice}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            {item.isAvailable ? (
                                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534', background: '#dcfce7', padding: '3px 8px', borderRadius: '6px' }}>
                                                    Available ✓
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#991b1b', background: '#fee2e2', padding: '3px 8px', borderRadius: '6px' }}>
                                                    Skipped ✕
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                                <button
                                    type="button"
                                    onClick={() => setReorderModalData(null)}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #cbd5e1',
                                        background: '#ffffff',
                                        fontWeight: 700,
                                        color: '#475569',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => executeReorderItems(reorderModalData.items)}
                                    style={{
                                        flex: 2,
                                        padding: '10px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #ff6b00 0%, #ea580c 100%)',
                                        color: '#ffffff',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
                                    }}
                                >
                                    Proceed with Available Items →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOrders;