import React, { useContext } from 'react';
import './FoodItem.css';
import { StoreContext } from '../../Context/StoreContext';

const FoodItem = ({ id, name, price, description, image, rating, reviewsCount, category, isNonVeg }) => {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);

  // Compute a realistic deterministic rating & review count if not provided
  const displayRating = (rating || (4.2 + ((name.charCodeAt(0) * 7) % 8) / 10)).toFixed(1);
  const displayReviews = reviewsCount || (120 + ((name.charCodeAt(0) * 43) % 450));
  const isBestseller = parseFloat(displayRating) >= 4.7;
  const originalMrp = price + (price > 200 ? 50 : 35);
  const currentQuantity = cartItems[id] || 0;

  return (
    <div className='food-item-card'>
      {/* IMAGE CONTAINER WITH BADGES */}
      <div className="food-item-media">
        <img
          className='food-item-img'
          src={image?.startsWith("http") ? image : `${url}/images/${image}`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `/images/${image}`;
          }}
          alt={name}
          loading="lazy"
        />

        {/* Veg / Non-Veg Indicator Badge */}
        <div className={`diet-indicator-badge ${isNonVeg ? 'non-veg' : 'veg'}`} title={isNonVeg ? 'Non-Vegetarian' : 'Pure Vegetarian'}>
          <div className='diet-symbol-shape'></div>
        </div>

        {/* Delivery Time Pill */}
        <div className='prep-time-pill'>
          <span>⏱️ 15-20m</span>
        </div>

        {/* Bestseller Badge */}
        {isBestseller && (
          <div className='bestseller-badge'>
            <span>⭐ Bestseller</span>
          </div>
        )}
      </div>

      {/* CARD CONTENT */}
      <div className="food-item-content">
        <div className="food-item-meta-row">
          {category && <span className="dish-category-tag">{category}</span>}
          <div className="dish-rating-badge">
            <span className="star-icon">★</span>
            <span className="rating-score">{displayRating}</span>
            <span className="rating-reviews-count">({displayReviews})</span>
          </div>
        </div>

        <h3 className="dish-title" title={name}>{name}</h3>
        <p className="dish-description" title={description}>{description}</p>

        {/* BOTTOM ROW: PRICE & SMART ADD BUTTON */}
        <div className="dish-footer-row">
          <div className="dish-pricing-col">
            <div className="dish-price-group">
              <span className="current-price">₹{price}</span>
              <span className="original-mrp">₹{originalMrp}</span>
            </div>
            <span className="save-badge">SAVE ₹{originalMrp - price}</span>
          </div>

          <div className="dish-action-col">
            {currentQuantity === 0 ? (
              <button
                type="button"
                className="btn-add-dish"
                onClick={() => addToCart(id)}
              >
                + ADD
              </button>
            ) : (
              <div className="dish-stepper-counter">
                <button
                  type="button"
                  className="stepper-btn minus"
                  onClick={() => removeFromCart(id)}
                  title="Remove one"
                >
                  −
                </button>
                <span className="stepper-count">{currentQuantity}</span>
                <button
                  type="button"
                  className="stepper-btn plus"
                  onClick={() => addToCart(id)}
                  title="Add one more"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodItem;