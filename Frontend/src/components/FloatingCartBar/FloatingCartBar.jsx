import React, { useContext } from 'react';
import './FloatingCartBar.css';
import { StoreContext } from '../../Context/StoreContext';
import { useNavigate, useLocation } from 'react-router-dom';

const FloatingCartBar = ({ setShowLogin }) => {
  const { getTotalCartAmount, getTotalItemsCount, token, promoCode, discount } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

  const totalItems = getTotalItemsCount();
  const subtotal = getTotalCartAmount();

  // Only show when cart has items and not already on cart or checkout pages
  if (totalItems === 0 || location.pathname === '/cart' || location.pathname === '/order') {
    return null;
  }

  const handleQuickCheckout = () => {
    const activeToken = token || localStorage.getItem("token");
    if (!activeToken) {
      if (setShowLogin) {
        setShowLogin(true);
      } else {
        navigate('/cart');
      }
      return;
    }
    navigate('/order');
  };

  return (
    <div className="floating-cart-wrapper">
      <div className="floating-cart-bar">
        <div className="floating-cart-left" onClick={() => navigate('/cart')}>
          <div className="floating-cart-icon-wrap">
            <span className="floating-cart-emoji">🛍️</span>
            <span className="floating-cart-badge">{totalItems}</span>
          </div>
          <div className="floating-cart-text">
            <div className="floating-cart-price-row">
              <span className="floating-cart-count">{totalItems} {totalItems === 1 ? 'Item' : 'Items'}</span>
              <span className="floating-cart-dot">•</span>
              <span className="floating-cart-price">₹{subtotal}</span>
            </div>
            <p className="floating-cart-subtext">
              {discount > 0 ? `🎉 ${promoCode} applied! Extra savings` : '⚡ Tap to view items or proceed'}
            </p>
          </div>
        </div>

        <div className="floating-cart-right">
          <button 
            type="button"
            className="floating-cart-btn-view"
            onClick={() => navigate('/cart')}
          >
            View Cart
          </button>
          <button 
            type="button" 
            className="floating-cart-btn-proceed"
            onClick={handleQuickCheckout}
          >
            <span>Proceed to Pay</span>
            <span className="arrow-icon">➔</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingCartBar;
